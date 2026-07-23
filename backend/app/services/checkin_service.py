import uuid
from datetime import UTC, date, datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.checkin import Checkin
from app.models.user import User
from app.schemas.checkin import CheckinCreate, CheckinResponse, TodayCheckinResponse
from app.schemas.history import HistoryItem
from app.services.ai_service import ai_service


def _as_utc_date(value: datetime) -> date:
    if value.tzinfo is None:
        return value.date()
    return value.astimezone(UTC).date()


class CheckinService:
    def create_checkin(self, db: Session, user_id: str, payload: CheckinCreate) -> CheckinResponse:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        ai_response = ai_service.get_response(payload.mood)
        checkin = Checkin(
            id=str(uuid.uuid4()),
            user_id=user_id,
            mood=payload.mood,
            text_notes=payload.text,
            ai_response=ai_response,
        )
        db.add(checkin)
        db.commit()
        db.refresh(checkin)

        return CheckinResponse(checkin_id=checkin.id, ai_response=checkin.ai_response)

    def get_today_checkin(self, db: Session, user_id: str) -> TodayCheckinResponse:
        today = datetime.now(UTC).date()
        checkins = (
            db.query(Checkin)
            .filter(Checkin.user_id == user_id)
            .order_by(Checkin.created_at.desc())
            .limit(20)
            .all()
        )

        for checkin in checkins:
            if checkin.created_at and _as_utc_date(checkin.created_at) == today:
                return TodayCheckinResponse(
                    has_checkin=True,
                    checkin_id=checkin.id,
                    mood=checkin.mood,
                    ai_response=checkin.ai_response,
                )

        return TodayCheckinResponse(has_checkin=False)

    def get_history(self, db: Session, user_id: str) -> list[HistoryItem]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        checkins = (
            db.query(Checkin)
            .filter(Checkin.user_id == user_id)
            .order_by(Checkin.created_at.desc())
            .all()
        )

        return [
            HistoryItem(
                date=checkin.created_at,
                mood=checkin.mood,
                response=checkin.ai_response,
                text=checkin.text_notes,
            )
            for checkin in checkins
        ]


checkin_service = CheckinService()
