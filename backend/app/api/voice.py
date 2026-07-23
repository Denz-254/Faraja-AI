from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.voice import (
    SpeakRequest,
    VoiceSessionRequest,
    VoiceSessionResponse,
    VoiceStatusResponse,
)
from app.services.elevenlabs_service import elevenlabs_service

router = APIRouter(prefix="/voice", tags=["voice"])


@router.get("/status", response_model=VoiceStatusResponse)
def voice_status(_current_user: User = Depends(get_current_user)) -> VoiceStatusResponse:
    return VoiceStatusResponse(
        configured=elevenlabs_service.is_agent_ready(),
        tts_configured=elevenlabs_service.is_tts_ready(),
        agent_id_set=bool(settings.elevenlabs_agent_id.strip()),
    )


@router.post("/session", response_model=VoiceSessionResponse)
async def create_voice_session(
    payload: VoiceSessionRequest,
    _current_user: User = Depends(get_current_user),
) -> VoiceSessionResponse:
    signed_url = await elevenlabs_service.get_signed_url()
    first_message = elevenlabs_service.build_first_message(payload.mode, payload.comfort_text)
    system_prompt = elevenlabs_service.build_system_prompt(payload.mode, payload.mood)

    return VoiceSessionResponse(
        signed_url=signed_url,
        first_message=first_message,
        system_prompt=system_prompt,
        mode=payload.mode,
        agent_id=settings.elevenlabs_agent_id,
    )


@router.post("/speak")
async def speak_text(
    payload: SpeakRequest,
    _current_user: User = Depends(get_current_user),
) -> Response:
    audio = await elevenlabs_service.synthesize_speech(payload.text)
    return Response(content=audio, media_type="audio/mpeg")
