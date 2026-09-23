import pytest
from app.tests.conftest import client, TestingSessionLocal
from app.repositories.user_repository import user_repo
from app.models.business_profile import BusinessProfile
from app.models.user import User


@pytest.fixture(autouse=True)
def setup_business_profile_db():
    db = TestingSessionLocal()
    from app.seed.seed_rbac import seed_rbac

    seed_rbac(db)

    # Create a test user if not exists
    user = user_repo.get_by_email(db, email="investor@test.com")
    if not user:
        user_repo.create(
            db,
            obj_in={
                "email": "investor@test.com",
                "hashed_password": "hash",
                "role": "INVESTOR",
                "is_active": True,
            },
        )
    db.close()


def get_auth_headers(email: str) -> dict:
    from app.core.security import create_access_token

    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, email=email)
    token = create_access_token(subject=user.id)
    db.close()
    return {"Authorization": f"Bearer {token}"}


def test_create_business_profile(client):
    headers = get_auth_headers("investor@test.com")

    payload = {
        "company_name": "Test Company",
        "industry": "Software",
        "pan_number": "ABCDE1234F",
        "gstin": "27ABCDE1234F1Z5",
        "district": "Pune",
        "investment_value": "100Cr",
        "employment_count": 50,
        "designation": "Director",
    }

    response = client.post("/api/business-profile", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["company_name"] == "Test Company"


def test_create_duplicate_business_profile(client):
    headers = get_auth_headers("investor@test.com")

    payload = {
        "company_name": "Another Company",
    }

    # First create should succeed
    client.post("/api/business-profile", json=payload, headers=headers)

    # Second create should fail
    response = client.post("/api/business-profile", json=payload, headers=headers)
    assert response.status_code == 400
    data = response.json()
    assert data["error_code"] == "RESOURCE_ALREADY_EXISTS"


def test_get_business_profile(client):
    headers = get_auth_headers("investor@test.com")

    # Create first
    payload = {"company_name": "Test Company"}
    client.post("/api/business-profile", json=payload, headers=headers)

    response = client.get("/api/business-profile", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["company_name"] == "Test Company"


def test_update_business_profile(client):
    headers = get_auth_headers("investor@test.com")

    # Create first
    payload = {"company_name": "Test Company"}
    client.post("/api/business-profile", json=payload, headers=headers)

    update_payload = {"company_name": "Updated Company", "industry": "Hardware"}

    response = client.put("/api/business-profile", json=update_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["company_name"] == "Updated Company"
    assert data["data"]["industry"] == "Hardware"


def test_unauthenticated_access(client):
    response = client.get("/api/business-profile")
    assert response.status_code == 401
