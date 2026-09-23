import pytest
from app.tests.conftest import client, TestingSessionLocal
from app.repositories.user_repository import user_repo


@pytest.fixture(autouse=True)
def setup_wizard_db():
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
    db.close()


def get_auth_headers(email: str) -> dict:
    from app.core.security import create_access_token

    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, email=email)
    token = create_access_token(subject=user.id)
    db.close()
    return {"Authorization": f"Bearer {token}"}


def test_create_wizard_run_success(client):
    headers = get_auth_headers("investor1@test.com")
    payload = {
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

    resp = client.post("/api/wizard/run", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["data"]["results"][0]["answers"]["sector"] == "Manufacturing"
    assert "id" in data["data"]


def test_create_wizard_run_validation_error(client):
    headers = get_auth_headers("investor1@test.com")
    # Missing required field "sector"
    payload = {
        "answers": {
            "location": "Pune",
            "investment": 1000000.0,
            "capacity": "100 units/day",
            "employment": 50,
            "land_status": "Acquired",
            "project_stage": "Planning",
        }
    }

    resp = client.post("/api/wizard/run", json=payload, headers=headers)
    assert resp.status_code == 422
    assert resp.json()["status"] == "error"
    assert resp.json()["error_code"] == "VALIDATION_ERROR"


def test_get_wizard_runs_scoped_to_owner(client):
    headers1 = get_auth_headers("investor1@test.com")
    headers2 = get_auth_headers("investor2@test.com")

    payload = {
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

    client.post("/api/wizard/run", json=payload, headers=headers1)

    # User 1 should see 1 run
    resp1 = client.get("/api/wizard/runs", headers=headers1)
    assert resp1.status_code == 200
    assert len(resp1.json()["data"]) == 1

    # User 2 should see 0 runs
    resp2 = client.get("/api/wizard/runs", headers=headers2)
    assert resp2.status_code == 200
    assert len(resp2.json()["data"]) == 0


def test_get_wizard_run_by_id(client):
    headers1 = get_auth_headers("investor1@test.com")
    headers2 = get_auth_headers("investor2@test.com")

    payload = {
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

    create_resp = client.post("/api/wizard/run", json=payload, headers=headers1)
    run_id = create_resp.json()["data"]["id"]

    # User 1 can get their run
    resp = client.get(f"/api/wizard/runs/{run_id}", headers=headers1)
    assert resp.status_code == 200
    assert resp.json()["data"]["id"] == run_id

    # User 2 cannot get user 1's run
    resp_forbidden = client.get(f"/api/wizard/runs/{run_id}", headers=headers2)
    assert resp_forbidden.status_code == 403
    assert resp_forbidden.json()["error_code"] == "FORBIDDEN"
