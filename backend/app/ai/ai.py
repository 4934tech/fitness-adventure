from __future__ import annotations
from typing import Dict, Any
from uuid import uuid4
from random import randint
from ..db import users_col, utcnow

def _choose_title_and_target(user: Dict[str, Any]) -> tuple[str, int]: # TODO: REPLACE WITH AI, instead of this strange system
    onboarding = (user.get("onboarding") or {})
    exp = int(onboarding.get("experience_1to5") or 1)
    if exp <= 2:
        candidates = [
            ("Do a 10 minute mobility session", 1),
            ("Walk 3000 steps", 3000),
            ("Do 2 sets of bodyweight squats", 2),
            ("Log your first workout", 1)
        ]
    elif exp == 3:
        candidates = [
            ("Do a 20 minute cardio session", 1),
            ("Walk 6000 steps", 6000),
            ("Do 3 sets of pushups", 3),
            ("Log a strength workout", 1)
        ]
    else:
        candidates = [
            ("Run 3 miles total", 3),
            ("Walk 9000 steps", 9000),
            ("Do 5 working sets today", 5),
            ("Log a HIIT workout", 1)
        ]
    title, target = candidates[randint(0, len(candidates) - 1)]
    return title, target

def _compute_rewards(target: int) -> Dict[str, int]:
    base_xp = 100
    base_coins = 10
    xp = base_xp + min(400, target // 2)
    coins = base_coins + min(40, target // 2500)
    return {"xp": int(xp), "coins": int(coins)}

def generate_personal_quest(user: Dict[str, Any]) -> Dict[str, Any]:
    now = utcnow()
    quest_id = str(uuid4())
    title, target = _choose_title_and_target(user)
    rewards = _compute_rewards(target)
    return {
        "quest_id": quest_id,
        "title": title,
        "type": "counter",
        "target": int(target),
        "progress": 0,
        "rewards": {"xp": int(rewards["xp"]), "coins": int(rewards["coins"])},
        "created_at": now,
        "started_at": now,
        "meta": {
            "source": "ai_v1",
            "seed_inputs": {
                "experience_1to5": (user.get("onboarding") or {}).get("experience_1to5")
            }
        }
    }

def fill_missing_active_quests(user_id, count_to_add=1):
    col = users_col()
    doc = col.find_one({"_id": user_id}, {"quests.active": 1, "onboarding": 1, "progress": 1})
    if not doc:
        return

    n = int(count_to_add) if count_to_add else 0
    if n <= 0:
        return

    now = utcnow()
    new_quests = []
    for _ in range(n):
        q = generate_personal_quest(doc)
        if not q.get("started_at"):
            q["started_at"] = now
        new_quests.append(q)

    col.update_one(
        {"_id": user_id},
        {"$push": {"quests.active": {"$each": new_quests}}, "$set": {"updated_at": now}},
    )
