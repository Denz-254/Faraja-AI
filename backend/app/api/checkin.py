from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.checkin import CheckinCreate, CheckinResponse, TodayCheckinResponse
from app.services.checkin_service import checkin_service

router = APIRouter(prefix="/checkin", tags=["checkin"])


@router.post("", response_model=CheckinResponse)
def create_checkin(
    payload: CheckinCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CheckinResponse:
    return checkin_service.create_checkin(db, current_user.id, payload)


@router.get("/today", response_model=TodayCheckinResponse)
def get_today_checkin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TodayCheckinResponse:
    return checkin_service.get_today_checkin(db, current_user.id)
