from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta, timezone
from passlib.hash import bcrypt
from dotenv import load_dotenv
from typing import Optional
from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError
import os
import uuid

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
TOKEN_EXPIRY_DAYS = int(os.getenv("TOKEN_EXPIRY_DAYS"))

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users = db["users"]

users.create_index([("email", ASCENDING)], unique=True, name="uniq_email")
users.create_index([("token", ASCENDING)], name="idx_token")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class AuthResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    token: str
    token_expiry: datetime

def now_utc() -> datetime:
    return datetime.now(timezone.utc)

def generate_token() -> str:
    return str(uuid.uuid4())

def get_expiry_time() -> datetime:
    return now_utc() + timedelta(days=TOKEN_EXPIRY_DAYS)

def is_token_expired(expiry_time: Optional[datetime]) -> bool:
    if expiry_time is None:
        return True
    return now_utc() > expiry_time

def doc_to_auth_response(doc) -> AuthResponse:
    return AuthResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        token=doc["token"],
        token_expiry=doc["token_expiry"],
    )

def get_user_by_email(email: str):
    return users.find_one({"email": email})

def get_user_by_token(token: str):
    return users.find_one({"token": token}, {"name": 1, "email": 1, "token_expiry": 1})

@app.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest):
    password_hash = bcrypt.hash(payload.password)
    token = generate_token()
    token_expiry = get_expiry_time()

    doc = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": password_hash,
        "token": token,
        "token_expiry": token_expiry,
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }

    try:
        result = users.insert_one(doc)
        inserted = users.find_one({"_id": result.inserted_id}, {"password_hash": 0})
        return doc_to_auth_response(inserted)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Email already in use")

@app.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    doc = get_user_by_email(payload.email)
    if not doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not bcrypt.verify(payload.password, doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = generate_token()
    token_expiry = get_expiry_time()

    users.update_one(
        {"_id": doc["_id"]},
        {
            "$set": {
                "token": token,
                "token_expiry": token_expiry,
                "updated_at": now_utc(),
            }
        },
    )

    updated = users.find_one({"_id": doc["_id"]}, {"password_hash": 0})
    return doc_to_auth_response(updated)

@app.post("/logout")
def logout(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.split(" ", 1)[1].strip()
    res = users.update_one(
        {"token": token},
        {"$set": {"token": None, "token_expiry": None, "updated_at": now_utc()}},
    )
    if res.modified_count == 0:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"message": "Logged out"}

@app.get("/protected")
def protected_route(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.split(" ", 1)[1].strip()
    doc = get_user_by_token(token)
    if not doc:
        raise HTTPException(status_code=401, detail="Invalid token")

    if is_token_expired(doc.get("token_expiry")):
        raise HTTPException(status_code=401, detail="Token expired")

    return {
        "message": f"Hello, {doc['name']}. Your token is valid.",
        "user": {"id": str(doc["_id"]), "name": doc["name"], "email": doc["email"]},
    }
