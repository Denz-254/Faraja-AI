from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginResponse, PinRequest, RegisterResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse)
def register(payload: PinRequest, db: Session = Depends(get_db)) -> RegisterResponse:
    return auth_service.register(db, payload.pin)


@router.post("/login", response_model=LoginResponse)
def login(payload: PinRequest, db: Session = Depends(get_db)) -> LoginResponse:
    return auth_service.login(db, payload.pin)
