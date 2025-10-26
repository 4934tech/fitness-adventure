from datetime import timedelta
from typing import Optional, Mapping, Any, Dict
from fastapi import HTTPException, Request, Body
from passlib.hash import bcrypt
import uuid, secrets, hmac, hashlib
from pydantic import EmailStr
from .db import users_col, utcnow
from .config import get_settings
from .models import AuthedUser, LoginRequest

settings = get_settings()

PREONBOARDING_ALLOWED_PATHS = { # Might need something later?
    "/protected/onboarding",
}

def generate_token() -> str:
    return str(uuid.uuid4())

def get_expiry_time():
    return utcnow() + timedelta(days=settings.TOKEN_EXPIRY_DAYS)

def is_token_expired(expiry_time: Optional[object]) -> bool:
    if not expiry_time:
        return True
    return utcnow() > expiry_time


def _truncate_password_bytes(raw: str) -> str:
    """Truncate password to 72 bytes for bcrypt, handling UTF-8 multi-byte characters properly."""
    encoded = raw.encode('utf-8')
    if len(encoded) <= 72:
        return raw

    # Truncate to 72 bytes
    truncated_bytes = encoded[:72]

    # Remove trailing bytes until we have valid UTF-8
    # This handles the case where we sliced in the middle of a multi-byte character
    while truncated_bytes:
        try:
            return truncated_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # Remove the last byte and try again
            truncated_bytes = truncated_bytes[:-1]

    # Fallback (should never happen with valid input)
    return raw[0] if raw else ""

def hash_password(raw: str) -> str:
    # Bcrypt has a 72-byte limit, truncate if necessary
    truncated = _truncate_password_bytes(raw)
    return bcrypt.hash(truncated)

def verify_password(raw: str, hashed: str) -> bool:
    # Bcrypt has a 72-byte limit, truncate if necessary
    truncated = _truncate_password_bytes(raw)
    return bcrypt.verify(truncated, hashed)

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

def get_user_by_email(email: EmailStr) -> Optional[AuthedUser]:
    return users_col().find_one({"email": normalize_email(email)})

def get_user_by_token(token: str) -> Optional[AuthedUser]:
    return users_col().find_one(
        {"token": token},
        {
            "name": 1,
            "email": 1,
            "token_expiry": 1,
            "verified": 1,
            "onboarding": 1,
        }
    )

def rotate_token_for_user(user_id):
    token = generate_token()
    token_expiry = get_expiry_time()
    users_col().update_one(
        {"_id": user_id},
        {"$set": {
            "token": token,
            "token_expiry": token_expiry,
            "updated_at": utcnow(),
        }}
    )
    return users_col().find_one({"_id": user_id}, {"password_hash": 0})

REQUIRED_ONBOARDING_FIELDS = (
    "height_in",
    "weight_lb",
    "primary_goal",
    "experience",
    "equipment",
    "preferred_days_per_week",
    "age",
)
# Check if all required onboarding fields are present and non-null
def is_fully_onboarded_user(user: Mapping[str, Any]) -> bool:
    ob = user.get("onboarding")
    if not isinstance(ob, Mapping):
        return False

    return all(field in ob and ob[field] is not None for field in REQUIRED_ONBOARDING_FIELDS)

def _extract_bearer_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization") or ""
    if not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return token

def require_auth(request: Request) -> AuthedUser:
    token = _extract_bearer_token(request)

    user: Optional[AuthedUser] = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    if is_token_expired(user.get("token_expiry")):
        raise HTTPException(status_code=401, detail="Token expired")

    if settings.REQUIRE_VERIFIED_FOR_LOGIN and not bool(user.get("verified", False)):
        raise HTTPException(status_code=403, detail="Email not verified")

    path = request.url.path
    if not is_fully_onboarded_user(user) and path not in PREONBOARDING_ALLOWED_PATHS:
        raise HTTPException(status_code=403, detail="Onboarding required")

    return user

def authenticate_credentials(payload: LoginRequest = Body(...)) -> AuthedUser:
    user = get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if settings.REQUIRE_VERIFIED_FOR_LOGIN and not bool(user.get("verified", False)):
        raise HTTPException(status_code=403, detail="Email not verified")

    return user
