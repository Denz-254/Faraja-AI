from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+psycopg://faraja:faraja@localhost:5432/faraja"
    secret_key: str = "dev-secret-key-change-in-production"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # ElevenLabs — never expose these to the frontend
    elevenlabs_api_key: str = ""
    elevenlabs_agent_id: str = ""
    # Default stock voice (Rachel); replace with your Voice Design ID
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"
    elevenlabs_tts_model: str = "eleven_flash_v2_5"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def elevenlabs_configured(self) -> bool:
        return bool(self.elevenlabs_api_key.strip() and self.elevenlabs_agent_id.strip())

    @property
    def elevenlabs_tts_configured(self) -> bool:
        return bool(self.elevenlabs_api_key.strip() and self.elevenlabs_voice_id.strip())


settings = Settings()
