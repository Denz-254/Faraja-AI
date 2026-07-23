import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_session_token, hash_pin, verify_pin
from app.models.user import User
from app.schemas.auth import LoginResponse, RegisterResponse


class AuthService:
    def register(self, db: Session, pin: str) -> RegisterResponse:
        existing_users = db.query(User).all()
        for user in existing_users:
            if verify_pin(pin, user.pin_hash):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This PIN is already in use. Please choose a different PIN.",
                )

        user = User(id=str(uuid.uuid4()), pin_hash=hash_pin(pin))
        db.add(user)
        db.commit()
        db.refresh(user)

        return RegisterResponse(user_id=user.id, message="Welcome!")

    def login(self, db: Session, pin: str) -> LoginResponse:
        users = db.query(User).all()
        for user in users:
            if verify_pin(pin, user.pin_hash):
                token = create_session_token(user.id)
                return LoginResponse(user_id=user.id, session_token=token)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid PIN. Please try again.",
        )


auth_service = AuthService()
