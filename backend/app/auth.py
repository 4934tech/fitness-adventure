from datetime import timedelta
from typing import Optional, TypedDict
from fastapi import HTTPException, Request
from passlib.hash import bcrypt
import uuid, secrets, hmac, hashlib
from pydantic import EmailStr
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

def normalize_email(email: EmailStr) -> str:
    return str(email).strip().lower()

def generate_code(length: int = 6) -> str:
    max_value = 10 ** length
    return f"{secrets.randbelow(max_value):0{length}d}"

def hash_code(code: str) -> str:
    pepper = settings.VERIFICATION_PEPPER.encode()
    return hmac.new(pepper, code.encode(), hashlib.sha256).hexdigest()

def codes_equal(stored_hash: str, candidate: str) -> bool:
    pepper = settings.VERIFICATION_PEPPER.encode()
    cand = hmac.new(pepper, candidate.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(stored_hash, cand)

class AuthedUser(TypedDict):
    _id: object
    name: str
    email: str
    token_expiry: object

def get_user_by_email(email: EmailStr):
    return users_col().find_one({"email": normalize_email(email)})

def get_user_by_token(token: str) -> Optional[AuthedUser]:
    return users_col().find_one(
        {"token": token},
        {"name": 1, "email": 1, "token_expiry": 1, "verified": 1}
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

    if settings.REQUIRE_VERIFIED_FOR_LOGIN and not doc.get("verified", False):
        raise HTTPException(status_code=403, detail="Email not verified")

    return doc
