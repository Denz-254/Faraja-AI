from app.services.elevenlabs_service import FIRST_MESSAGES, elevenlabs_service


def test_first_message_proactive():
    message = elevenlabs_service.build_first_message("proactive")
    assert "Faraja" in message
    assert message == FIRST_MESSAGES["proactive"]


def test_first_message_comfort_override():
    message = elevenlabs_service.build_first_message("comfort", "You are not alone today.")
    assert message == "You are not alone today."


def test_system_prompt_includes_safety():
    prompt = elevenlabs_service.build_system_prompt("proactive", mood="sad")
    assert "Do NOT give medical" in prompt
    assert "sad" in prompt


def test_voice_status_requires_auth(client):
    response = client.get("/voice/status")
    assert response.status_code == 401


def test_voice_status_ok(client, auth_headers):
    response = client.get("/voice/status", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "configured" in data
    assert "tts_configured" in data


def test_voice_session_unavailable_without_keys(client, auth_headers):
    response = client.post("/voice/session", json={"mode": "proactive"}, headers=auth_headers)
    assert response.status_code == 503
