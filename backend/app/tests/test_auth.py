"""
Tests for authentication endpoints.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

TEST_USER = {
    "email": "test@example.com",
    "password": "TestPassword123!",
}


def test_register_success():
    resp = client.post("/api/auth/register", json=TEST_USER)
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "success"


def test_register_duplicate():
    client.post("/api/auth/register", json=TEST_USER)
    resp = client.post("/api/auth/register", json=TEST_USER)
    assert resp.status_code == 400
    assert resp.json()["error_code"] == "USER_EXISTS"


def test_login_success():
    client.post("/api/auth/register", json=TEST_USER)
    resp = client.post("/api/auth/login", json=TEST_USER)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_wrong_password():
    client.post("/api/auth/register", json=TEST_USER)
    resp = client.post(
        "/api/auth/login",
        json={"email": TEST_USER["email"], "password": "wrong"},
    )
    assert resp.status_code == 401
    assert resp.json()["error_code"] == "INVALID_CREDENTIALS"


def test_login_unknown_user():
    resp = client.post(
        "/api/auth/login",
        json={"email": "nobody@test.com", "password": "x"},
    )
    assert resp.status_code == 401
    assert resp.json()["error_code"] == "INVALID_CREDENTIALS"


def test_me_with_token():
    client.post("/api/auth/register", json=TEST_USER)
    login_resp = client.post("/api/auth/login", json=TEST_USER)
    token = login_resp.json()["data"]["access_token"]

    resp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["email"] == TEST_USER["email"]


def test_me_without_token():
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_logout():
    client.post("/api/auth/register", json=TEST_USER)
    login_resp = client.post("/api/auth/login", json=TEST_USER)
    refresh = login_resp.json()["data"]["refresh_token"]

    resp = client.post(
        "/api/auth/logout",
        params={"refresh_token": refresh},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "success"

    # Logout again with same token should fail
    resp2 = client.post(
        "/api/auth/logout",
        params={"refresh_token": refresh},
    )
    assert resp2.status_code == 400
