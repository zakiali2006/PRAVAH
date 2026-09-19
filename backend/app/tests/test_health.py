"""
Tests for the health-check endpoint.
"""

from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Verify that the health check endpoint returns the correct format."""
    response = client.get("/api/health")

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert "data" in data
    assert data["data"]["service"] == "PRAVAH API"
    assert "version" in data["data"]
    assert "message" in data
