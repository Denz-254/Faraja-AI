from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.user import User
from app.services.ai_service import ai_service

router = APIRouter(prefix="/responses", tags=["responses"])


@router.get("")
def list_responses(_current_user: User = Depends(get_current_user)) -> dict[str, list[str]]:
    return ai_service.responses
