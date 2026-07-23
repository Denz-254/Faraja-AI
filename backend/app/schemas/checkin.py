from typing import Literal

from pydantic import BaseModel, Field


MoodType = Literal["happy", "neutral", "sad"]


class CheckinCreate(BaseModel):
    user_id: str
    mood: MoodType
    text: str | None = Field(default=None, max_length=2000)


class CheckinResponse(BaseModel):
    checkin_id: str
    ai_response: str


class TodayCheckinResponse(BaseModel):
    has_checkin: bool
    checkin_id: str | None = None
    mood: MoodType | None = None
    ai_response: str | None = None
