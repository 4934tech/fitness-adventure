from fastapi import FastAPI, HTTPException, Body, Request, Depends
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import psycopg2
import uuid
import os
from dotenv import load_dotenv
from passlib.hash import bcrypt

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

TOKEN_EXPIRY_DAYS = int(os.getenv("TOKEN_EXPIRY_DAYS", "2"))

def get_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL UNIQUE,
                        password_hash TEXT NOT NULL,
                        token TEXT UNIQUE,
                        token_expiry TIMESTAMP,
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
                    )
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_token ON users(token)")
    finally:
        conn.close()

init_db()

class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class AuthResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    token: str
    token_expiry: datetime


def generate_token() -> str:
    return str(uuid.uuid4())

def get_expiry_time() -> datetime:
    return datetime.utcnow() + timedelta(days=TOKEN_EXPIRY_DAYS)

def is_token_expired(expiry_time: datetime | None) -> bool:
    if expiry_time is None:
        return True
    return datetime.utcnow() > expiry_time

def get_user_by_email(cursor, email: str):
    cursor.execute("""
        SELECT id, name, email, password_hash, token, token_expiry
        FROM users
        WHERE email = %s
    """, (email,))
    return cursor.fetchone()

def get_user_by_token(cursor, token: str):
    cursor.execute("""
        SELECT id, name, email, token_expiry
        FROM users
        WHERE token = %s
    """, (token,))
    return cursor.fetchone()

# Routes

@app.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest):
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cursor:
                existing = get_user_by_email(cursor, payload.email)
                if existing:
                    raise HTTPException(status_code=409, detail="Email already in use")

                password_hash = bcrypt.hash(payload.password)
                token = generate_token()
                token_expiry = get_expiry_time()

                cursor.execute("""
                    INSERT INTO users (name, email, password_hash, token, token_expiry)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id, name, email, token, token_expiry
                """, (payload.name, payload.email, password_hash, token, token_expiry))
                row = cursor.fetchone()

                return AuthResponse(
                    id=row[0],
                    name=row[1],
                    email=row[2],
                    token=row[3],
                    token_expiry=row[4],
                )
    finally:
        conn.close()

@app.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cursor:
                row = get_user_by_email(cursor, payload.email)
                if not row:
                    raise HTTPException(status_code=401, detail="Invalid credentials")

                user_id, name, email, password_hash, _, _ = row

                if not bcrypt.verify(payload.password, password_hash):
                    raise HTTPException(status_code=401, detail="Invalid credentials")

                token = generate_token()
                token_expiry = get_expiry_time()
                cursor.execute("""
                    UPDATE users
                    SET token = %s, token_expiry = %s, updated_at = NOW()
                    WHERE id = %s
                """, (token, token_expiry, user_id))

                return AuthResponse(
                    id=user_id,
                    name=name,
                    email=email,
                    token=token,
                    token_expiry=token_expiry,
                )
    finally:
        conn.close()

@app.post("/logout")
def logout(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ", 1)[1].strip()

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cursor:
                cursor.execute("UPDATE users SET token = NULL, token_expiry = NULL, updated_at = NOW() WHERE token = %s", (token,))
                if cursor.rowcount == 0:
                    raise HTTPException(status_code=401, detail="Invalid token")
        return {"message": "Logged out"}
    finally:
        conn.close()

@app.get("/protected")
def protected_route(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ", 1)[1].strip()

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cursor:
                row = get_user_by_token(cursor, token)
                if not row:
                    raise HTTPException(status_code=401, detail="Invalid token")

                user_id, name, email, expiry = row
                if is_token_expired(expiry):
                    raise HTTPException(status_code=401, detail="Token expired")

                return {"message": f"Hello, {name}. Your token is valid.", "user": {"id": user_id, "name": name, "email": email}}
    finally:
        conn.close()
