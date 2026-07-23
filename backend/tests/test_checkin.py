def test_create_checkin_requires_auth(client, registered_user):
    response = client.post("/checkin", json={"mood": "happy", "text": "Feeling good"})
    assert response.status_code == 401


def test_create_checkin(client, auth_headers):
    response = client.post(
        "/checkin",
        json={"mood": "happy", "text": "Feeling good today"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "checkin_id" in data
    assert len(data["ai_response"]) > 0


def test_get_today_checkin(client, auth_headers):
    client.post("/checkin", json={"mood": "neutral"}, headers=auth_headers)

    response = client.get("/checkin/today", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["has_checkin"] is True
    assert data["mood"] == "neutral"


def test_get_history(client, auth_headers):
    client.post(
        "/checkin",
        json={"mood": "sad", "text": "Tough day"},
        headers=auth_headers,
    )

    response = client.get("/history", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["mood"] == "sad"
    assert data[0]["text"] == "Tough day"
