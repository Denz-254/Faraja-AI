def test_create_checkin(client, registered_user):
    user_id = registered_user["user_id"]
    response = client.post(
        "/checkin",
        json={"user_id": user_id, "mood": "happy", "text": "Feeling good today"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "checkin_id" in data
    assert len(data["ai_response"]) > 0


def test_get_today_checkin(client, registered_user):
    user_id = registered_user["user_id"]
    client.post("/checkin", json={"user_id": user_id, "mood": "neutral"})

    response = client.get(f"/checkin/today/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["has_checkin"] is True
    assert data["mood"] == "neutral"


def test_get_history(client, registered_user):
    user_id = registered_user["user_id"]
    client.post("/checkin", json={"user_id": user_id, "mood": "sad", "text": "Tough day"})

    response = client.get(f"/history/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["mood"] == "sad"
    assert data[0]["text"] == "Tough day"
