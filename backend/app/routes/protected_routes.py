from typing import Annotated, Optional, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field, conint, NonNegativeInt, PositiveInt, confloat
from ..auth import require_auth
from ..db import users_col, utcnow
from ..ai.ai import fill_missing_active_quests

Authed = Annotated[dict, Depends(require_auth)]
router = APIRouter(prefix="/protected", tags=["protected"])

def level_from_xp(total_xp: int) -> int:  # TODO: more complex level formula
    return max(1, total_xp // 1000 + 1)

def xp_to_next(total_xp: int) -> int:
    return 1000 - (total_xp % 1000)


class TokenStatus(BaseModel):
    ok: bool

class ProfileOut(BaseModel):
    id: str
    name: str
    email: EmailStr

class OnboardingIn(BaseModel):
    height_in: confloat(ge=48, le=90)
    weight_lb: confloat(ge=70, le=700)
    experience_1to5: conint(ge=1, le=5)

class QuestIdIn(BaseModel):
    quest_id: str

class OnboardingResult(BaseModel):
    ok: bool
    requires_onboarding: bool

class ProgressOut(BaseModel):
    level: PositiveInt
    xp_total: NonNegativeInt
    xp_to_next_level: PositiveInt
    quests_completed_count: NonNegativeInt

class WalletOut(BaseModel):
    coins_balance: NonNegativeInt

class Rewards(BaseModel):
    xp: NonNegativeInt = 0
    coins: NonNegativeInt = 0

class ActiveQuestOut(BaseModel):
    quest_id: str
    title: str
    type: str
    started_at: str
    rewards: Rewards

class QuestsLoadOut(BaseModel):
    active: List[ActiveQuestOut]
    needed: int
    generation_started: bool

class CompleteQuestOut(BaseModel):
    ok: bool
    completed: bool
    xp_awarded: NonNegativeInt
    coins_awarded: NonNegativeInt
    level: PositiveInt
    xp_total: NonNegativeInt
    xp_to_next_level: PositiveInt

class CheckinOut(BaseModel):
    ok: bool
    streak_current: NonNegativeInt
    streak_best: NonNegativeInt


@router.get("/token", response_model=TokenStatus)
def check_token(_: Authed):
    return {"ok": True}

@router.get("/profile", response_model=ProfileOut)
def profile(user: Authed):
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}

@router.put("/onboarding", response_model=OnboardingResult)
def update_onboarding(user: Authed, payload: OnboardingIn):
    now = utcnow()
    users_col().update_one(
        {"_id": user["_id"]},
        {"$set": {
            "onboarding.height_in": float(payload.height_in),
            "onboarding.weight_lb": float(payload.weight_lb),
            "onboarding.experience_1to5": int(payload.experience_1to5),
            "updated_at": now,
        }}
    )
    return {"ok": True, "requires_onboarding": False}

@router.get("/quests/load", response_model=QuestsLoadOut)
def load_quests(user: Authed, background: BackgroundTasks):
    doc = users_col().find_one({"_id": user["_id"]}, {"quests.active": 1}) or {}
    active = (doc.get("quests") or {}).get("active", []) or []
    count = len(active)
    needed = max(0, 3 - count)

    generation_started = False
    if needed > 0:
        background.add_task(fill_missing_active_quests, user["_id"], needed)
        generation_started = True

    out: List[ActiveQuestOut] = []
    for a in active:
        out.append(ActiveQuestOut(
            quest_id=a["quest_id"],
            title=a["title"],
            type=a.get("type", "counter"),
            started_at=(a.get("started_at").isoformat() if a.get("started_at") else ""),
            rewards=Rewards(
                xp=int((a.get("rewards") or {}).get("xp", 0)),
                coins=int((a.get("rewards") or {}).get("coins", 0)),
            ),
        ))
    return QuestsLoadOut(active=out, needed=needed, generation_started=generation_started)

@router.post("/quests/complete", response_model=CompleteQuestOut)
def complete_quest(user: Authed, payload: QuestIdIn, background: BackgroundTasks):
    now = utcnow()

    doc = users_col().find_one(
        {"_id": user["_id"], "quests.active.quest_id": payload.quest_id},
        {"quests.active.$": 1, "progress": 1, "wallet": 1},
    )
    if not doc or "quests" not in doc or not doc["quests"].get("active"):
        raise HTTPException(status_code=404, detail="Quest not active")

    quest = doc["quests"]["active"][0]
    rewards = quest.get("rewards", {}) or {}
    xp_reward = int(rewards.get("xp", 0))
    coin_reward = int(rewards.get("coins", 0))

    users_col().update_one(
        {"_id": user["_id"]},
        {
            "$pull": {"quests.active": {"quest_id": payload.quest_id}},
            "$push": {"quests.completed": {**quest, "completed_at": now}},
            "$inc": {
                "progress.xp_total": xp_reward,
                "progress.quests_completed_count": 1,
                "wallet.coins_balance": coin_reward,
            },
            "$set": {"updated_at": now},
        },
    )

    # Recalculate level
    fresh = users_col().find_one({"_id": user["_id"]}, {"progress": 1})
    total_xp = int((fresh.get("progress") or {}).get("xp_total", 0))
    lvl = level_from_xp(total_xp)
    xp_next = xp_to_next(total_xp)
    users_col().update_one(
        {"_id": user["_id"]},
        {"$set": {"progress.level": lvl, "progress.xp_to_next_level": xp_next}}
    )

    background.add_task(fill_missing_active_quests, user["_id"], 1)

    return {
        "ok": True,
        "completed": True,
        "xp_awarded": xp_reward,
        "coins_awarded": coin_reward,
        "level": lvl,
        "xp_total": total_xp,
        "xp_to_next_level": xp_next,
    }

@router.get("/progress", response_model=ProgressOut)
def get_progress(user: Authed):
    doc = users_col().find_one({"_id": user["_id"]}, {"progress": 1}) or {}
    p = doc.get("progress") or {}
    return {
        "level": int(p.get("level", 1)),
        "xp_total": int(p.get("xp_total", 0)),
        "xp_to_next_level": int(p.get("xp_to_next_level", 1000)),
        "quests_completed_count": int(p.get("quests_completed_count", 0)),
    }

@router.get("/wallet", response_model=WalletOut)
def get_wallet(user: Authed):
    doc = users_col().find_one({"_id": user["_id"]}, {"wallet": 1}) or {}
    w = doc.get("wallet") or {}
    return {"coins_balance": int(w.get("coins_balance", 0))}

from datetime import timedelta

@router.post("/streak/checkin", response_model=CheckinOut)
def streak_checkin(user: Authed):
    now = utcnow().date()
    doc = users_col().find_one({"_id": user["_id"]}, {"streak": 1}) or {}
    s = doc.get("streak") or {"current": 0, "best": 0, "last_checkin_date": None}

    last = s.get("last_checkin_date").date() if s.get("last_checkin_date") else None
    if last == now:
        return {"ok": True, "streak_current": s["current"], "streak_best": s["best"]}

    consecutive = last == (now - timedelta(days=1))
    current = s["current"] + 1 if consecutive else 1
    best = max(s["best"], current)

    users_col().update_one(
        {"_id": user["_id"]},
        {"$set": {
            "streak": {"current": current, "best": best, "last_checkin_date": utcnow()},
            "updated_at": utcnow(),
        }}
    )
    return {"ok": True, "streak_current": current, "streak_best": best}
