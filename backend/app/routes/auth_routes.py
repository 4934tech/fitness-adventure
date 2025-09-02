from fastapi import APIRouter, HTTPException
from pymongo.errors import DuplicateKeyError

from ..models import SignupRequest, LoginRequest, AuthResponse
from ..db import users_col, utcnow
from ..auth import hash_password, verify_password, rotate_token_for_user, get_user_by_email

router = APIRouter(prefix="/auth", tags=["auth"])

def doc_to_auth_response(doc) -> AuthResponse:
    return AuthResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        token=doc["token"],
        token_expiry=doc["token_expiry"],
    )

@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest):
    password_hash = hash_password(payload.password)

    doc = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": password_hash,
        "token": None,
        "token_expiry": None,
        "created_at": utcnow(),
        "updated_at": utcnow(),
    }
    try:
        result = users_col().insert_one(doc)
        updated = rotate_token_for_user(result.inserted_id)
        return doc_to_auth_response(updated)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Email already in use")

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    doc = get_user_by_email(payload.email)
    if not doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    updated = rotate_token_for_user(doc["_id"])
    return doc_to_auth_response(updated)