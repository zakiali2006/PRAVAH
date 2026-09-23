import pytest
from app.tests.conftest import client, TestingSessionLocal
from app.repositories.user_repository import user_repo
from app.models.business_profile import BusinessProfile
from app.models.factory_unit import FactoryUnit
from app.models.service import Service
from app.models.document import DocumentType
from app.models.rbac import Department


@pytest.fixture(autouse=True)
def setup_application_db():
    db = TestingSessionLocal()
    from app.seed.seed_rbac import seed_rbac

    seed_rbac(db)

    # Create investor user
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

    # Create officer user
    officer = user_repo.get_by_email(db, email="officer@test.com")
    if not officer:
        officer = user_repo.create(
            db,
            obj_in={
                "email": "officer@test.com",
                "hashed_password": "hash",
                "role": "OFFICER",
                "is_active": True,
            },
        )

    # Create business profile
    bp = db.query(BusinessProfile).filter(BusinessProfile.user_id == user1.id).first()
    if not bp:
        bp = BusinessProfile(user_id=user1.id, company_name="Acme Corp")
        db.add(bp)
        db.commit()
        db.refresh(bp)

    # Create department and service
    dept = Department(name="MIDC", code="MIDC")
    db.add(dept)
    db.commit()

    doc_type = DocumentType(name="PAN Card")
    db.add(doc_type)
    db.commit()

    svc = Service(
        name="Land Allotment",
        department_id=dept.id,
        sector="Manufacturing",
        fee_amount=1000.0,
        processing_time_days=30,
    )
    svc.required_documents.append(doc_type)
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
    svc = db.query(Service).first()
    svc_id = svc.id
    db.close()
    return svc_id


def _get_bp_id(email="investor1@test.com"):
    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, email=email)
    bp = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    bp_id = bp.id
    db.close()
    return bp_id


def test_apply_for_service(client):
    headers = get_auth_headers("investor1@test.com")
    svc_id = _get_service_id()
    bp_id = _get_bp_id()

    payload = {
        "applicant_name": "Test Investor",
        "business_profile_id": bp_id,
    }
    response = client.post(
        f"/api/services/{svc_id}/apply", json=payload, headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["service_id"] == svc_id
    assert data["data"]["applicant_name"] == "Test Investor"


def test_list_applications_investor(client):
    headers = get_auth_headers("investor1@test.com")
    svc_id = _get_service_id()
    bp_id = _get_bp_id()

    # Create an application first
    client.post(
        f"/api/services/{svc_id}/apply",
        json={"applicant_name": "Inv1", "business_profile_id": bp_id},
        headers=headers,
    )

    response = client.get("/api/applications", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) >= 1


def test_get_application_by_id(client):
    headers = get_auth_headers("investor1@test.com")
    svc_id = _get_service_id()
    bp_id = _get_bp_id()

    create_resp = client.post(
        f"/api/services/{svc_id}/apply",
        json={"applicant_name": "Inv1", "business_profile_id": bp_id},
        headers=headers,
    )
    app_id = create_resp.json()["data"]["id"]

    response = client.get(f"/api/applications/{app_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["id"] == app_id


def test_track_application(client):
    headers = get_auth_headers("investor1@test.com")
    svc_id = _get_service_id()
    bp_id = _get_bp_id()

    create_resp = client.post(
        f"/api/services/{svc_id}/apply",
        json={"applicant_name": "Inv1", "business_profile_id": bp_id},
        headers=headers,
    )
    app_id = create_resp.json()["data"]["id"]

    response = client.get(f"/api/applications/{app_id}/track", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    # Should have at least the initial "Draft Created" stage
    assert len(data["data"]) >= 1
    assert data["data"][0]["name"] == "Draft Created"


def test_pay_application(client):
    headers = get_auth_headers("investor1@test.com")
    svc_id = _get_service_id()
    bp_id = _get_bp_id()

    create_resp = client.post(
        f"/api/services/{svc_id}/apply",
        json={"applicant_name": "Inv1", "business_profile_id": bp_id},
        headers=headers,
    )
    app_id = create_resp.json()["data"]["id"]

    response = client.post(
        f"/api/applications/{app_id}/pay",
        json={"amount": 1000.0},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["status"] == "completed"
    assert data["data"]["reference_id"] is not None

    # After payment, verify application status changed to pending
    app_resp = client.get(f"/api/applications/{app_id}", headers=headers)
    assert app_resp.json()["data"]["status"] == "pending"


def test_officer_can_see_all_applications(client):
    inv_headers = get_auth_headers("investor1@test.com")
    off_headers = get_auth_headers("officer@test.com")
    svc_id = _get_service_id()
    bp_id = _get_bp_id()

    # Investor creates an application
    client.post(
        f"/api/services/{svc_id}/apply",
        json={"applicant_name": "Inv1", "business_profile_id": bp_id},
        headers=inv_headers,
    )

    # Officer should see it
    response = client.get("/api/applications", headers=off_headers)
    assert response.status_code == 200
    assert len(response.json()["data"]) >= 1


def test_unknown_application_returns_404(client):
    headers = get_auth_headers("investor1@test.com")
    response = client.get("/api/applications/NONEXISTENT", headers=headers)
    assert response.status_code == 404
    assert response.json()["error_code"] == "RESOURCE_NOT_FOUND"
