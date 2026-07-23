def test_register_success(client):
    response = client.post("/auth/register", json={"pin": "5678"})
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert data["message"] == "Welcome!"


def test_register_duplicate_pin(client):
    client.post("/auth/register", json={"pin": "1111"})
    response = client.post("/auth/register", json={"pin": "1111"})
    assert response.status_code == 409


def test_register_invalid_pin(client):
    response = client.post("/auth/register", json={"pin": "12"})
    assert response.status_code == 422


def test_login_success(client, registered_user):
    response = client.post("/auth/login", json={"pin": "1234"})
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == registered_user["user_id"]
    assert "session_token" in data


def test_login_invalid_pin(client, registered_user):
    response = client.post("/auth/login", json={"pin": "9999"})
    assert response.status_code == 401
