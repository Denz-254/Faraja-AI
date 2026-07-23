from sqlalchemy import Column, ForeignKey, String

from app.core.database import Base


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    email = Column(String, nullable=False)
    notification_preferences = Column(String, nullable=True)
