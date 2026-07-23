from app.services.ai_service import AIService


def test_ai_service_returns_response_for_each_mood():
    service = AIService()
    for mood in ["happy", "neutral", "sad"]:
        response = service.get_response(mood)
        assert isinstance(response, str)
        assert len(response) > 0


def test_ai_service_defaults_unknown_mood_to_neutral():
    service = AIService()
    response = service.get_response("unknown")
    assert isinstance(response, str)
    assert response in service.responses["neutral"]


def test_comfort_responses_has_50_plus_entries():
    service = AIService()
    total = sum(len(items) for items in service.responses.values())
    assert total >= 50
