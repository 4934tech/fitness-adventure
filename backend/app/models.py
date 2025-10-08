from typing import TypedDict, Optional

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime



class SignupRequest(BaseModel):
    name: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    token: str
    token_expiry: datetime

class Onboarding(TypedDict):
    height_in: float
    weight_lb: float
    experience_1to5: int

class AuthedUser(TypedDict):
    _id: object
    name: str
    email: str
    token_expiry: object
    verified: bool
    onboarding: Onboarding

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


class ResendVerificationRequest(BaseModel):
    email: EmailStr
