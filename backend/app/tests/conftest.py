"""
Shared test fixtures for PRAVAH backend tests.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    """Provide a FastAPI TestClient for the application."""
    with TestClient(app) as c:
        yield c
