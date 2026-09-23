import pytest
from app.tests.conftest import client, TestingSessionLocal
from app.repositories.user_repository import user_repo
from app.models.business_profile import BusinessProfile
from app.models.factory_unit import FactoryUnit
from app.models.user import User


@pytest.fixture(autouse=True)
def setup_factory_unit_db():
    db = TestingSessionLocal()
    from app.seed.seed_rbac import seed_rbac

    seed_rbac(db)

    # Create test user 1
    user1 = user_repo.get_by_email(db, email="investor1@test.com")
    if not user1:
        user1 = user_repo.create(
            db,
            obj_in={
                "email": "investor1@test.com",
                "hashed_password": "hash",
                "role": "INVESTOR",
                "is_active": True,
            },
        )

    # Create test user 2 for cross-tenant checks
    user2 = user_repo.get_by_email(db, email="investor2@test.com")
    if not user2:
        user2 = user_repo.create(
            db,
            obj_in={
                "email": "investor2@test.com",
                "hashed_password": "hash",
                "role": "INVESTOR",
                "is_active": True,
            },
        )

    # Create business profiles
    bp1 = db.query(BusinessProfile).filter(BusinessProfile.user_id == user1.id).first()
    if not bp1:
        bp1 = BusinessProfile(user_id=user1.id, company_name="Company 1")
        db.add(bp1)

    bp2 = db.query(BusinessProfile).filter(BusinessProfile.user_id == user2.id).first()
    if not bp2:
        bp2 = BusinessProfile(user_id=user2.id, company_name="Company 2")
        db.add(bp2)

    db.commit()
    db.close()


def get_auth_headers(email: str) -> dict:
    from app.core.security import create_access_token

    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, email=email)
    token = create_access_token(subject=user.id)
    db.close()
    return {"Authorization": f"Bearer {token}"}


def test_create_factory_unit(client):
    headers = get_auth_headers("investor1@test.com")

    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, email="investor1@test.com")
    bp = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    db.close()

    payload = {
        "unit_name": "Test Factory",
        "category": "Red",
        "power_sanctioned_kva": 1000,
        "business_profile_id": bp.id,
        "midc_plot": {"midc_area": "Pune MIDC", "plot_number": "A-1"},
    }

    response = client.post("/api/factory-units", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["unit_name"] == "Test Factory"
    assert data["data"]["midc_plot"]["plot_number"] == "A-1"


def test_get_factory_unit(client):
    headers = get_auth_headers("investor1@test.com")

    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, email="investor1@test.com")
    bp = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    db.close()

    # Create first
    payload = {"unit_name": "Test Factory 2", "business_profile_id": bp.id}
    create_resp = client.post("/api/factory-units", json=payload, headers=headers)
    unit_id = create_resp.json()["data"]["id"]

    # Get single
    response = client.get(f"/api/factory-units/{unit_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["unit_name"] == "Test Factory 2"

    # Get multi
    response_list = client.get("/api/factory-units", headers=headers)
    assert response_list.status_code == 200
    assert len(response_list.json()["data"]) >= 1


def test_cross_tenant_access_denied(client):
    headers1 = get_auth_headers("investor1@test.com")
    headers2 = get_auth_headers("investor2@test.com")

    db = TestingSessionLocal()
    user1 = user_repo.get_by_email(db, email="investor1@test.com")
    bp1 = db.query(BusinessProfile).filter(BusinessProfile.user_id == user1.id).first()
    db.close()

    # User 1 creates unit
    payload = {"unit_name": "User 1 Factory", "business_profile_id": bp1.id}
    create_resp = client.post("/api/factory-units", json=payload, headers=headers1)
    unit_id = create_resp.json()["data"]["id"]

    # User 2 tries to access it
    response = client.get(f"/api/factory-units/{unit_id}", headers=headers2)
    assert (
        response.status_code == 404
    )  # Forbidden or Not Found depending on how get handles it


def test_update_factory_unit(client):
    headers = get_auth_headers("investor1@test.com")

    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, email="investor1@test.com")
    bp = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    db.close()

    payload = {"unit_name": "Update Test Factory", "business_profile_id": bp.id}
    create_resp = client.post("/api/factory-units", json=payload, headers=headers)
    unit_id = create_resp.json()["data"]["id"]

    update_payload = {
        "unit_name": "Updated Factory Name",
        "category": "Green",
        "midc_plot": {"plot_number": "B-2"},
    }
    response = client.put(
        f"/api/factory-units/{unit_id}", json=update_payload, headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["unit_name"] == "Updated Factory Name"
    assert data["data"]["category"] == "Green"
    assert data["data"]["midc_plot"]["plot_number"] == "B-2"


def test_delete_factory_unit(client):
    headers = get_auth_headers("investor1@test.com")

    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, email="investor1@test.com")
    bp = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    db.close()

    payload = {"unit_name": "Delete Test Factory", "business_profile_id": bp.id}
    create_resp = client.post("/api/factory-units", json=payload, headers=headers)
    unit_id = create_resp.json()["data"]["id"]

    # Delete
    response = client.delete(f"/api/factory-units/{unit_id}", headers=headers)
    assert response.status_code == 200

    # Try to get it again
    get_response = client.get(f"/api/factory-units/{unit_id}", headers=headers)
    assert get_response.status_code == 404

    # Direct DB check for soft delete
    db = TestingSessionLocal()
    unit = db.query(FactoryUnit).filter(FactoryUnit.id == unit_id).first()
    assert unit is not None
    assert unit.is_deleted is True
    db.close()
