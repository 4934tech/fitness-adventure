from typing import TypedDict, Literal
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

ExperienceLevel = Literal["beginner", "intermediate", "advanced"]
EquipmentAccess = Literal["none", "limited", "full_gym"]

class Onboarding(BaseModel):
    height_in: float = Field(gt=0, lt=120)
    weight_lb: float = Field(gt=0, lt=2000)
    primary_goal: str = Field(min_length=1, max_length=120)
    experience: ExperienceLevel
    equipment: EquipmentAccess
    preferred_days_per_week: int = Field(ge=1, le=7)
    age: int = Field(ge=13, le=100)

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
