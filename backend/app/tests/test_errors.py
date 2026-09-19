"""
Tests for the global exception handlers and universal error format.
"""

from fastapi.testclient import TestClient

def test_404_not_found(client: TestClient):
    """Verify that hitting an unknown endpoint returns the universal error format."""
    response = client.get("/api/unknown-endpoint-that-does-not-exist")
    
    assert response.status_code == 404
    data = response.json()
    
    assert data["status"] == "error"
    assert data["error_code"] == "RESOURCE_NOT_FOUND"
    assert "message" in data

def test_validation_error(client: TestClient):
    """Verify that a validation error (422) returns the universal error format.
    We'll trigger this by sending a bad request to the login endpoint since it exists.
    """
    response = client.post("/api/auth/login", json={"invalid": "payload"})
    
    # We might get a 422 if auth route is active, but we commented it out.
    # Let's add a dummy route in the test app temporarily if needed, 
    # but the simplest is to just check the auth route structure or wait for Phase 4.
    # Wait, the auth route is NOT commented out in main.py, oh it IS commented out in router.py.
    # We need a route to test validation. Let's add a temporary one in the test.
    pass

def test_validation_error_with_dummy_route(client: TestClient):
    from app.main import app
    from pydantic import BaseModel

    class DummyModel(BaseModel):
        name: str
        age: int

    @app.post("/api/test-validation")
    def dummy_endpoint(item: DummyModel):
        return item

    # Now make a request with invalid payload (missing 'age')
    response = client.post("/api/test-validation", json={"name": "Test"})
    
    assert response.status_code == 422
    data = response.json()
    
    assert data["status"] == "error"
    assert data["error_code"] == "VALIDATION_ERROR"
    assert "message" in data
    assert "age" in data["message"]
