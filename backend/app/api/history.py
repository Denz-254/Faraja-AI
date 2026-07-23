from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.history import HistoryItem
from app.services.checkin_service import checkin_service

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/{user_id}", response_model=list[HistoryItem])
def get_history(user_id: str, db: Session = Depends(get_db)) -> list[HistoryItem]:
    return checkin_service.get_history(db, user_id)
