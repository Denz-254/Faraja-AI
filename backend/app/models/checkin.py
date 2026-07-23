from sqlalchemy import Column, DateTime, ForeignKey, String, func

from app.core.database import Base


class Checkin(Base):
    __tablename__ = "checkins"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    mood = Column(String, nullable=False)
    text_notes = Column(String, nullable=True)
    voice_note_url = Column(String, nullable=True)
    ai_response = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
