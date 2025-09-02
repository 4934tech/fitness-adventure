from pymongo import MongoClient, ASCENDING
from datetime import datetime, timezone
from .config import get_settings

_settings = get_settings()
_client = MongoClient(_settings.MONGO_URI)
_db = _client[_settings.DB_NAME]

def utcnow():
    return datetime.now(timezone.utc)

def users_col():
    col = _db["users"]
    col.create_index([("email", ASCENDING)], unique=True, name="uniq_email")
    col.create_index([("token", ASCENDING)], name="idx_token")
    return col
