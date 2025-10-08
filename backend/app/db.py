from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime, timezone
from .config import get_settings

_settings = get_settings()
_client = MongoClient(_settings.MONGO_URI, tz_aware=True, tzinfo=timezone.utc)
_db = _client[_settings.DB_NAME]

def utcnow():
    return datetime.now(timezone.utc)

def users_col():
    col = _db["users"]
    col.create_index([("email", ASCENDING)], unique=True, name="uniq_email")
    col.create_index([("token", ASCENDING)], name="idx_token")
    col.create_index([("verified", ASCENDING)], name="idx_verified")
    col.create_index([("quests.active.quest_id", ASCENDING)], name="idx_active_qid")
    col.create_index([("quests.backlog.quest_id", ASCENDING)], name="idx_backlog_qid")
    col.create_index([("quests.completed.quest_id", ASCENDING)], name="idx_completed_qid")
    col.create_index([("progress.level", DESCENDING)], name="idx_progress_level")
    col.create_index([("wallet.coins_balance", DESCENDING)], name="idx_wallet_coins")
    return col

def email_verifications_col():
    col = _db["email_verifications"]
    col.create_index([("email", ASCENDING)], name="idx_ev_email")
    col.create_index([("user_id", ASCENDING)], name="idx_ev_user")
    col.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0, name="ttl_ev_expires")
    col.create_index([("email", ASCENDING), ("created_at", DESCENDING)], name="idx_ev_email_created")
    return col

def workout_logs_col():
    col = _db["workout_logs"]
    col.create_index([("user_id", ASCENDING), ("performed_at", DESCENDING)], name="idx_user_performed")
    col.create_index([("tags", ASCENDING)], name="idx_tags")
    col.create_index([("created_at", DESCENDING)], name="idx_created")
    return col