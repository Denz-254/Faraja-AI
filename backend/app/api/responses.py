from fastapi import APIRouter

from app.services.ai_service import ai_service

router = APIRouter(prefix="/responses", tags=["responses"])


@router.get("")
def list_responses() -> dict[str, list[str]]:
    return ai_service.responses
