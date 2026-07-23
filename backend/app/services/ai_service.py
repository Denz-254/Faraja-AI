import random

from app.utils.json_loader import load_json_file


class AIService:
    def __init__(self) -> None:
        self.responses = self._load_responses()

    def _load_responses(self) -> dict[str, list[str]]:
        return load_json_file("data/comfort_responses.json")

    def get_response(self, mood: str) -> str:
        mood_key = mood.lower()
        if mood_key not in self.responses:
            mood_key = "neutral"
        return random.choice(self.responses[mood_key])


ai_service = AIService()
