from datetime import timedelta
from fastapi import APIRouter, HTTPException, BackgroundTasks, status
from pymongo.errors import DuplicateKeyError
from ..config import get_settings
from ..email.email_manager import send_email_sync, email_verification_html
from ..models import SignupRequest, LoginRequest, AuthResponse, ResendVerificationRequest, VerifyEmailRequest
from ..db import users_col, utcnow, email_verifications_col
from ..auth import hash_password, verify_password, rotate_token_for_user, get_user_by_email, normalize_email, generate_code, hash_code, codes_equal

router = APIRouter(prefix="/auth", tags=["auth"])

def doc_to_auth_response(doc) -> AuthResponse:
    return AuthResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        token=doc["token"],
        token_expiry=doc["token_expiry"],
    )

settings = get_settings()

@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest):
    email = normalize_email(payload.email)
    now = utcnow()

    user = users_col().find_one({"email": email})
    if not user or user.get("verified") is True:
        return {"status": "ok"}

    ev = email_verifications_col().find_one(
        {"email": email, "expires_at": {"$gt": now}},
        sort=[("created_at", -1)]
    )
    if not ev:
        raise HTTPException(status_code=400, detail="Code expired or not found")

    if int(ev.get("attempts", 0)) >= settings.VERIFICATION_MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many attempts. Request a new code")

    if not codes_equal(ev.get("code_hash", ""), payload.code):
        email_verifications_col().update_one(
            {"_id": ev["_id"]},
            {"$inc": {"attempts": 1}}
        )
        raise HTTPException(status_code=400, detail="Invalid code")

    users_col().update_one(
        {"_id": user["_id"]},
        {"$set": {"verified": True, "updated_at": now}}
    )
    email_verifications_col().delete_many({"user_id": user["_id"]})

    return {"status": "verified"}


@router.post("/resend-verification")
def resend_verification(payload: ResendVerificationRequest, background_tasks: BackgroundTasks):
    email = normalize_email(payload.email)
    now = utcnow()

    user = users_col().find_one({"email": email})
    if not user or user.get("verified"):
        return {"status": "ok"}

    ev = email_verifications_col().find_one(
        {"email": email},
        sort=[("created_at", -1)]
    )

    if ev and ev.get("last_sent_at") and (now - ev["last_sent_at"]).total_seconds() < settings.VERIFICATION_RESEND_COOLDOWN_SEC:
        raise HTTPException(status_code=429, detail="Please wait before requesting another code")

    code = generate_code()
    email_verifications_col().insert_one({
        "user_id": user["_id"],
        "email": email,
        "code_hash": hash_code(code),
        "created_at": now,
        "last_sent_at": now,
        "expires_at": now + timedelta(minutes=settings.VERIFICATION_TTL_MIN),
        "attempts": 0,
    })

    background_tasks.add_task(
        send_email_sync,
        to_email=email,
        subject=f"Your code is {code}",
        html=email_verification_html(user["name"], code),
        nohtml=f"Your verification code is: {code}"
    )
    return {"status": "ok"}


@router.post("/signup")
def signup(payload: SignupRequest, background_tasks: BackgroundTasks):
    now = utcnow()
    email = normalize_email(payload.email)
    password_hash = hash_password(payload.password)

    try:
        result = users_col().insert_one({
            "name": payload.name,
            "email": email,
            "password_hash": password_hash,
            "verified": False,
            "token": None,
            "token_expiry": None,
            "created_at": now,
            "updated_at": now,
        })
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="This email address is already registered!"
        )

    code = generate_code()
    email_verifications_col().insert_one({
        "user_id": result.inserted_id,
        "email": email,
        "code_hash": hash_code(code),
        "created_at": now,
        "last_sent_at": now,
        "expires_at": now + timedelta(minutes=settings.VERIFICATION_TTL_MIN),
        "attempts": 0,
    })

    background_tasks.add_task(
        send_email_sync,
        to_email=email,
        subject=f"Your code is {code}",
        html=email_verification_html(payload.name, code),
        nohtml=f"Your verification code is: {code}"
    )

    return {"status": "pending_verification"}


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    doc = get_user_by_email(payload.email)
    if not doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not doc.get("verified", False):
        raise HTTPException(status_code=403, detail="Email not verified")

    updated = rotate_token_for_user(doc["_id"])
    return doc_to_auth_response(updated)