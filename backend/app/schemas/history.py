from datetime import datetime

from pydantic import BaseModel


class HistoryItem(BaseModel):
    date: datetime
    mood: str
    response: str
    text: str | None = None
