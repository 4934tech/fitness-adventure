from __future__ import annotations

import json
from typing import Dict, Any, List, Optional
from uuid import uuid4
from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError

from ..config import get_settings
from ..db import users_col, utcnow

settings = get_settings()
client = OpenAI(api_key=settings.API_TOKEN)

SYSTEM_INSTRUCTIONS = """
You are a game designer for a fitness RPG.
Generate simple daily quests for users.
Return ONLY valid JSON with no extra commentary.
Return a JSON array with exactly ONE object, using this schema:

[
  {
    "title": "string, concise user-facing quest name",
    "type": "counter",
    "target": number (positive integer),
    "rewards": { "xp": number (int), "coins": number (int) }
  }
]
Consider equipment and experience. If equipment is "none", use bodyweight or walking tasks.
Consider preferred_days_per_week for realistic volume.
Align with primary_goal.
Use "type": "counter".
Target must be a positive integer.
rewards.xp and rewards.coins must be non-negative integers.
Return ONLY the JSON array.
"""

def _build_user_prompt(onboarding: Dict[str, Any]) -> str:
    return json.dumps(onboarding or {}, ensure_ascii=False, separators=(",", ":"))

class QuestRewards(BaseModel):
    xp: int = Field(ge=0)
    coins: int = Field(ge=0)

class RawQuest(BaseModel):
    title: str
    type: str
    target: int
    rewards: QuestRewards

def _ask_model_for_quest(client: OpenAI, onboarding: Dict[str, Any], model: str = "gpt-4o-mini") -> list[dict[str, Any]]:
    user_prompt = _build_user_prompt(onboarding)

    completion = client.responses.create(
        model=model,
        instructions=SYSTEM_INSTRUCTIONS,
        input="\nUser data:\n" + user_prompt,
    )

    msg = completion.output_text
    text = msg if isinstance(msg, str) else str(msg or "")

    try:
        data = json.loads(text)
    except Exception as e:
        raise ValueError(f"Invalid JSON from model: {e}")

    if not isinstance(data, list):
        raise ValueError("Top-level response must be a JSON array")

    return data



def _validate_and_normalize(quest_list: List[Dict[str, Any]]) -> RawQuest:
    if not quest_list:
        raise ValueError("Empty quest list.")
    candidate = quest_list[0]
    try:
        return RawQuest.model_validate(candidate)
    except ValidationError as ve:
        raise ValueError(f"Invalid quest shape: {ve}")

def generate_personal_quest(user: Dict[str, Any]) -> Dict[str, Any]:
    attempts = 3
    last_err: Optional[Exception] = None
    onboarding = user.get("onboarding") or {}

    for _ in range(attempts):
        try:
            quest = _ask_model_for_quest(client, onboarding)
            valid = _validate_and_normalize(quest)
            now = utcnow()
            return {
                "quest_id": str(uuid4()),
                "title": valid.title,
                "type": valid.type,
                "target": int(valid.target),
                "progress": 0,
                "rewards": {"xp": int(valid.rewards.xp), "coins": int(valid.rewards.coins)},
                "created_at": now,
                "started_at": now,
            }
        except Exception as e:
            last_err = e
            continue

    raise RuntimeError(f"Failed to generate a valid quest after {attempts} attempts: {last_err}")


def fill_missing_active_quests(user_id, count_to_add=1):
    col = users_col()
    doc = col.find_one({"_id": user_id}, {"quests.active": 1, "onboarding": 1, "progress": 1})
    if not doc:
        return

    n = int(count_to_add) if count_to_add else 0
    if n <= 0:
        return

    now = utcnow()
    new_quests: List[Dict[str, Any]] = []
    for _ in range(n):
        q = generate_personal_quest(doc)
        if not q.get("started_at"):
            q["started_at"] = now
        new_quests.append(q)

    col.update_one(
        {"_id": user_id},
        {"$push": {"quests.active": {"$each": new_quests}}, "$set": {"updated_at": now}},
    )