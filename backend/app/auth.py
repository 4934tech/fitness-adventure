from datetime import timedelta
from typing import Optional, TypedDict
from fastapi import HTTPException, Request, Depends
from passlib.hash import bcrypt
import uuid

from .db import users_col, utcnow
from .config import get_settings

settings = get_settings()

def generate_token() -> str:
    return str(uuid.uuid4())

def get_expiry_time():
    return utcnow() + timedelta(days=settings.TOKEN_EXPIRY_DAYS)

def is_token_expired(expiry_time: Optional[object]) -> bool:
    if not expiry_time:
        return True
    return utcnow() > expiry_time

def hash_password(raw: str) -> str:
    return bcrypt.hash(raw)

def verify_password(raw: str, hashed: str) -> bool:
    return bcrypt.verify(raw, hashed)

class AuthedUser(TypedDict):
    _id: object
    name: str
    email: str
    token_expiry: object

def get_user_by_email(email: str):
    return users_col().find_one({"email": email})

def get_user_by_token(token: str) -> Optional[AuthedUser]:
    return users_col().find_one(
        {"token": token},
        {"name": 1, "email": 1, "token_expiry": 1}
    )

def rotate_token_for_user(user_id):
    token = generate_token()
    token_expiry = get_expiry_time()
    users_col().update_one(
        {"_id": user_id},
        {"$set": {"token": token, "token_expiry": token_expiry, "updated_at": utcnow()}}
    )
    return users_col().find_one({"_id": user_id}, {"password_hash": 0})

def require_auth(request: Request) -> AuthedUser:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.split(" ", 1)[1].strip()
    doc = get_user_by_token(token)
    if not doc:
        raise HTTPException(status_code=401, detail="Invalid token")

    if is_token_expired(doc.get("token_expiry")):
        raise HTTPException(status_code=401, detail="Token expired")

    return doc
