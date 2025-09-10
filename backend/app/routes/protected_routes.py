from typing import Annotated
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from ..auth import require_auth

Authed = Annotated[dict, Depends(require_auth)]

class TokenStatus(BaseModel):
    ok: bool

class ProfileOut(BaseModel):
    id: str
    name: str
    email: EmailStr

router = APIRouter(prefix="/protected", tags=["protected"])

@router.get(
    "/token",
    response_model=TokenStatus,
    summary="Check if the provided Bearer token is valid",
)
def check_token(_: Authed):
    return {"ok": True}

secure_router = APIRouter(prefix="/secure", dependencies=[Depends(require_auth)], tags=["protected"])

@secure_router.get(
    "/profile",
    response_model=ProfileOut,
    summary="Get profile for the authed user",
)
def profile(user: Authed):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }

router.include_router(secure_router)
