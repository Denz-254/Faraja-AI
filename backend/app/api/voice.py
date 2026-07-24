from fastapi import APIRouter, Depends, HTTPException, status
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
    if not elevenlabs_service.is_agent_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Voice companion is not configured. Set ELEVENLABS_API_KEY and "
                "ELEVENLABS_AGENT_ID on the backend."
            ),
        )

    first_message = elevenlabs_service.build_first_message(payload.mode, payload.comfort_text)
    system_prompt = elevenlabs_service.build_system_prompt(payload.mode, payload.mood)

    conversation_token: str | None = None
    signed_url: str | None = None
    connection: str = "webrtc"
    token_error: str | None = None
    url_error: str | None = None

    try:
        conversation_token = await elevenlabs_service.get_conversation_token()
    except HTTPException as exc:
        token_error = str(exc.detail)

    try:
        signed_url = await elevenlabs_service.get_signed_url()
    except HTTPException as exc:
        url_error = str(exc.detail)

    if conversation_token:
        connection = "webrtc"
    elif signed_url:
        connection = "websocket"
    else:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Could not start a voice session. "
                f"Token error: {token_error or 'n/a'}. "
                f"Signed URL error: {url_error or 'n/a'}."
            ),
        )

    return VoiceSessionResponse(
        conversation_token=conversation_token,
        signed_url=signed_url,
        first_message=first_message,
        system_prompt=system_prompt,
        mode=payload.mode,
        agent_id=settings.elevenlabs_agent_id,
        connection=connection,  # type: ignore[arg-type]
        use_overrides=False,
    )


@router.post("/speak")
async def speak_text(
    payload: SpeakRequest,
    _current_user: User = Depends(get_current_user),
) -> Response:
    audio = await elevenlabs_service.synthesize_speech(payload.text)
    return Response(content=audio, media_type="audio/mpeg")
