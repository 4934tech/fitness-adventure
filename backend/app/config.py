from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional, List

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "db_name"
    TOKEN_EXPIRY_DAYS: int = 2
    CORS_ALLOW_ORIGINS: List[str] = ["*"]

    EMAIL_FROM: str = "noreply@example.com"
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 25
    SMTP_STARTTLS: bool = False
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None

    VERIFICATION_TTL_MIN: int = 15
    VERIFICATION_RESEND_COOLDOWN_SEC: int = 60
    VERIFICATION_MAX_ATTEMPTS: int = 10
    VERIFICATION_PEPPER: str = "change-me"
    REQUIRE_VERIFIED_FOR_LOGIN: bool = True
    API_TOKEN: str = "change-me"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

@lru_cache
def get_settings() -> Settings:
    return Settings()
