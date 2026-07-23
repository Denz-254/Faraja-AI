from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.checkin import CheckinCreate, CheckinResponse, TodayCheckinResponse
from app.services.checkin_service import checkin_service

router = APIRouter(prefix="/checkin", tags=["checkin"])


@router.post("", response_model=CheckinResponse)
def create_checkin(payload: CheckinCreate, db: Session = Depends(get_db)) -> CheckinResponse:
    return checkin_service.create_checkin(db, payload)


@router.get("/today/{user_id}", response_model=TodayCheckinResponse)
def get_today_checkin(user_id: str, db: Session = Depends(get_db)) -> TodayCheckinResponse:
    return checkin_service.get_today_checkin(db, user_id)
