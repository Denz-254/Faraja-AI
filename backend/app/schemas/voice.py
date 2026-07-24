from typing import Literal

from pydantic import BaseModel, Field

VoiceMode = Literal["proactive", "open", "comfort"]


class VoiceSessionRequest(BaseModel):
    mode: VoiceMode = "proactive"
    mood: Literal["happy", "neutral", "sad"] | None = None
    comfort_text: str | None = Field(default=None, max_length=2000)


class VoiceSessionResponse(BaseModel):
    agent_id: str
    first_message: str
    system_prompt: str
    mode: VoiceMode
    conversation_token: str | None = None
    signed_url: str | None = None
    connection: Literal["webrtc", "websocket"] = "webrtc"
    use_overrides: bool = False


class VoiceStatusResponse(BaseModel):
    configured: bool
    tts_configured: bool
    agent_id_set: bool


class SpeakRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
