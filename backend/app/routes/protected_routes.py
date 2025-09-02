from fastapi import APIRouter, Depends
from ..auth import require_auth

router = APIRouter(prefix="/protected", tags=["protected"])

@router.get("")
def protected_hello(user = Depends(require_auth)):
    return {
        "message": f"Hello, {user['name']}. Your token is valid.",
        "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]},
    }

secure_router = APIRouter(prefix="/secure", dependencies=[Depends(require_auth)])

@secure_router.get("/profile")
def profile(user = Depends(require_auth)):
    return {"name": user["name"], "email": user["email"]}

router.include_router(secure_router)
