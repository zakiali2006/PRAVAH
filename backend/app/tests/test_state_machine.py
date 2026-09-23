import pytest
from app.tests.conftest import client, TestingSessionLocal
from app.repositories.user_repository import user_repo
from app.models.business_profile import BusinessProfile
from app.models.service import Service
from app.models.document import DocumentType
from app.models.rbac import Department
from app.models.application import Application


@pytest.fixture(autouse=True)
def setup_state_machine_db():
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

    # Create department and service
    dept = db.query(Department).filter_by(code="MIDC").first()
    if not dept:
        dept = Department(name="MIDC", code="MIDC")
        db.add(dept)
        db.commit()

    doc_type = db.query(DocumentType).filter_by(name="PAN Card").first()
    if not doc_type:
        doc_type = DocumentType(name="PAN Card")
        db.add(doc_type)
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


def _get_ids():
    db = TestingSessionLocal()
    svc = db.query(Service).first()
    user = user_repo.get_by_email(db, email="investor1@test.com")
    bp = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    db.close()
    return svc.id, bp.id


def _create_app(client, headers, svc_id, bp_id):
    resp = client.post(
        f"/api/services/{svc_id}/apply",
        json={"applicant_name": "Inv1", "business_profile_id": bp_id},
        headers=headers,
    )
    return resp.json()["data"]["id"]


def test_legal_transition_investor_draft_to_submitted(client):
    headers = get_auth_headers("investor1@test.com")
    svc_id, bp_id = _get_ids()
    app_id = _create_app(client, headers, svc_id, bp_id)

    # Investor transitions DRAFT -> SUBMITTED
    resp = client.post(
        f"/api/applications/{app_id}/transition",
        json={"new_status": "SUBMITTED", "desc": "Submitting application"},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "SUBMITTED"


def test_illegal_transition_invalid_state(client):
    headers = get_auth_headers("investor1@test.com")
    svc_id, bp_id = _get_ids()
    app_id = _create_app(client, headers, svc_id, bp_id)

    # Cannot transition DRAFT -> APPROVED (skipped states)
    resp = client.post(
        f"/api/applications/{app_id}/transition",
        json={"new_status": "APPROVED", "desc": "Approval"},
        headers=headers,
    )
    assert resp.status_code == 400
    assert resp.json()["error_code"] == "INVALID_STATE_TRANSITION"


def test_role_restriction_investor_cannot_approve(client):
    inv_headers = get_auth_headers("investor1@test.com")
    off_headers = get_auth_headers("officer@test.com")
    svc_id, bp_id = _get_ids()
    app_id = _create_app(client, inv_headers, svc_id, bp_id)

    # 1. Investor: DRAFT -> SUBMITTED
    client.post(
        f"/api/applications/{app_id}/transition",
        json={"new_status": "SUBMITTED"},
        headers=inv_headers,
    )

    # 2. Officer: SUBMITTED -> UNDER_REVIEW
    client.post(
        f"/api/applications/{app_id}/transition",
        json={"new_status": "UNDER_REVIEW"},
        headers=off_headers,
    )

    # 3. Investor tries to do UNDER_REVIEW -> APPROVED (not allowed)
    resp = client.post(
        f"/api/applications/{app_id}/transition",
        json={"new_status": "APPROVED"},
        headers=inv_headers,
    )
    assert resp.status_code == 403
    assert resp.json()["error_code"] == "FORBIDDEN"

    # 4. Officer: UNDER_REVIEW -> APPROVED (allowed)
    resp = client.post(
        f"/api/applications/{app_id}/transition",
        json={"new_status": "APPROVED"},
        headers=off_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "APPROVED"
