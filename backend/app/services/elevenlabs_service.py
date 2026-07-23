from __future__ import annotations

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.voice import VoiceMode

ELEVEN_BASE = "https://api.elevenlabs.io/v1"

FARAJA_SYSTEM_PROMPT = """
You are Faraja, a warm voice companion for older adults.
Faraja means "comfort" in Swahili.

Personality:
- Warm, patient, gentle, and dignified
- Speak slowly and clearly in short sentences
- Never rush or interrupt
- Sound like a trusted friend, not a robot or a doctor

Hard rules:
- You are an AI companion. If asked, say so honestly and kindly.
- Do NOT give medical, legal, or financial advice.
- Do NOT diagnose conditions or recommend changing medication.
- If the user may be in danger, urge them to contact a family member or emergency services.
- Prefer English; you may use a short Swahili greeting or comfort phrase when it feels natural.
- Keep replies brief (1–3 sentences) unless the user wants to talk longer.
""".strip()


FIRST_MESSAGES: dict[VoiceMode, str] = {
    "proactive": (
        "Hello, my dear. I'm Faraja — it means comfort in Swahili. "
        "I wanted to check in with you. How are you feeling today?"
    ),
    "open": (
        "Hello. I'm Faraja. I'm here to listen whenever you're ready. "
        "What's on your mind?"
    ),
    "comfort": (
        "I'm here with you. Take your time — I'm listening."
    ),
}


class ElevenLabsService:
    def is_agent_ready(self) -> bool:
        return settings.elevenlabs_configured

    def is_tts_ready(self) -> bool:
        return settings.elevenlabs_tts_configured

    def build_first_message(self, mode: VoiceMode, comfort_text: str | None = None) -> str:
        if mode == "comfort" and comfort_text:
            return comfort_text.strip()[:500]
        return FIRST_MESSAGES[mode]

    def build_system_prompt(self, mode: VoiceMode, mood: str | None = None) -> str:
        extra = ""
        if mode == "proactive":
            extra = (
                "\nYou initiated this check-in. Gently ask how their day is going, "
                "listen carefully, and offer comfort without probing for medical details."
            )
        if mood:
            extra += f"\nThe user's latest mood check-in was: {mood}."
        return f"{FARAJA_SYSTEM_PROMPT}{extra}"

    async def get_signed_url(self) -> str:
        if not settings.elevenlabs_configured:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "Voice companion is not configured. Set ELEVENLABS_API_KEY and "
                    "ELEVENLABS_AGENT_ID on the backend."
                ),
            )

        url = (
            f"{ELEVEN_BASE}/convai/conversation/get-signed-url"
            f"?agent_id={settings.elevenlabs_agent_id}"
        )
        headers = {"xi-api-key": settings.elevenlabs_api_key}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers)
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Could not reach ElevenLabs: {exc}",
            ) from exc

        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    f"ElevenLabs signed URL failed ({response.status_code}): "
                    f"{response.text[:300]}"
                ),
            )

        data = response.json()
        signed = data.get("signed_url")
        if not signed:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="ElevenLabs did not return a signed_url",
            )
        return str(signed)

    async def synthesize_speech(self, text: str) -> bytes:
        if not settings.elevenlabs_tts_configured:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="TTS is not configured. Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID.",
            )

        url = f"{ELEVEN_BASE}/text-to-speech/{settings.elevenlabs_voice_id}"
        headers = {
            "xi-api-key": settings.elevenlabs_api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        }
        payload = {
            "text": text,
            "model_id": settings.elevenlabs_tts_model,
            "voice_settings": {
                "stability": 0.55,
                "similarity_boost": 0.75,
                "style": 0.25,
                "use_speaker_boost": True,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, headers=headers, json=payload)
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Could not reach ElevenLabs TTS: {exc}",
            ) from exc

        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"ElevenLabs TTS failed ({response.status_code}): {response.text[:300]}",
            )

        return response.content


elevenlabs_service = ElevenLabsService()
