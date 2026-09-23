import pytest
from app.tests.conftest import client, TestingSessionLocal
from app.repositories.user_repository import user_repo
from app.models.service import Service
from app.models.rbac import Department


@pytest.fixture(autouse=True)
def setup_caf_db():
    db = TestingSessionLocal()
    from app.seed.seed_rbac import seed_rbac

    seed_rbac(db)

    # Create investor user 1
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

    # Create investor user 2
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

    dept = db.query(Department).filter_by(code="MIDC").first()
    if not dept:
        dept = Department(name="MIDC", code="MIDC")
        db.add(dept)
        db.commit()

    svc = db.query(Service).filter_by(name="Land Allotment").first()
    if not svc:
        svc = Service(
            name="Land Allotment",
            department_id=dept.id,
            sector="Manufacturing",
            fee_amount=1000.0,
            processing_time_days=30,
        )
        db.add(svc)
        db.commit()

    db.close()


def get_auth_headers(email: str) -> dict:
    from app.core.security import create_access_token

    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, email=email)
    token = create_access_token(subject=user.id)
    db.close()
    return {"Authorization": f"Bearer {token}"}


def _get_service_id():
    db = TestingSessionLocal()
    svc = db.query(Service).filter_by(name="Land Allotment").first()
    db.close()
    return svc.id


def test_generate_caf_from_wizard_run(client):
    headers = get_auth_headers("investor1@test.com")

    # 1. Create a wizard run
    wizard_payload = {
        "answers": {
            "sector": "Manufacturing",
            "location": "Pune",
            "investment": 1000000.0,
            "capacity": "100 units/day",
            "employment": 50,
            "land_status": "Acquired",
            "project_stage": "Planning",
        }
    }
    create_resp = client.post("/api/wizard/run", json=wizard_payload, headers=headers)
    run_id = create_resp.json()["data"]["id"]

    # 2. Generate CAF from the run
    caf_resp = client.post(f"/api/wizard/runs/{run_id}/generate-caf", headers=headers)
    assert caf_resp.status_code == 200
    data = caf_resp.json()["data"]
    assert data["wizard_run_id"] == run_id
    assert data["data"]["sector"] == "Manufacturing"


def test_create_caf_manually(client):
    headers = get_auth_headers("investor1@test.com")
    svc_id = _get_service_id()

    payload = {
        "data": {"project_name": "Test Project", "company": "Test Company"},
        "service_ids": [svc_id],
    }

    resp = client.post("/api/caf", json=payload, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["data"]["project_name"] == "Test Project"

    caf_id = resp.json()["data"]["id"]

    # Verify services attached
    svc_resp = client.get(f"/api/caf/{caf_id}/services", headers=headers)
    assert svc_resp.status_code == 200
    services = svc_resp.json()["data"]
    assert len(services) == 1
    assert services[0]["service_id"] == svc_id


def test_get_caf_scoped_to_owner(client):
    headers1 = get_auth_headers("investor1@test.com")
    headers2 = get_auth_headers("investor2@test.com")

    payload = {"data": {"field": "value"}, "service_ids": []}

    resp = client.post("/api/caf", json=payload, headers=headers1)
    caf_id = resp.json()["data"]["id"]

    # User 1 can get
    get_resp = client.get(f"/api/caf/{caf_id}", headers=headers1)
    assert get_resp.status_code == 200

    # User 2 gets FORBIDDEN
    forbidden_resp = client.get(f"/api/caf/{caf_id}", headers=headers2)
    assert forbidden_resp.status_code == 403
    assert forbidden_resp.json()["error_code"] == "FORBIDDEN"


def test_missing_wizard_run_generates_404(client):
    headers = get_auth_headers("investor1@test.com")

    # Attempt to generate CAF from non-existent wizard run
    caf_resp = client.post(f"/api/wizard/runs/99999/generate-caf", headers=headers)
    assert caf_resp.status_code == 404
    assert caf_resp.json()["error_code"] == "RESOURCE_NOT_FOUND"
