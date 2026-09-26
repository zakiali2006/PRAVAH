"""
Unit and integration tests for AI-Powered Risk Scoring & Smart Triage.
Owner: Kajal (AI Risk Engine)
"""

import pytest
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.models.application import Application
from app.models.business import BusinessProfile
from app.models.document import Document
from app.models.user import User
from app.models.risk import ApplicationRiskScore
from app.services.risk_scoring_service import risk_scoring_service
from app.core.security import create_access_token


@pytest.fixture
def test_setup_db(client):
    """Provides a fresh database session via TestClient setup."""
    from app.tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        # Create test users
        investor_a = User(
            id=101,
            email="investor_a@example.com",
            hashed_password="pw",
            role="investor",
            is_active=True,
        )
        investor_b = User(
            id=102,
            email="investor_b@example.com",
            hashed_password="pw",
            role="investor",
            is_active=True,
        )
        db.add_all([investor_a, investor_b])
        db.commit()

        # Create business profile for investor A
        profile_a = BusinessProfile(
            id=201,
            user_id=101,
            company_name="Sahyadri Manufacturing Pvt Ltd",
            pan_number="AAACS1234F",
            cin_number="U29253MH2024PTC123456",
            industry_sector="Manufacturing",
            registration_type="Private Limited",
            address="Plot C-14, MIDC Chakan, Pune",
        )
        db.add(profile_a)
        db.commit()

        yield db, investor_a, investor_b, profile_a
    finally:
        db.close()


def test_clean_application_low_risk(test_setup_db):
    db, investor_a, _, profile_a = test_setup_db

    # Clean application with a VALID document
    app = Application(
        id="APP/2026/CLEAN01",
        user_id=investor_a.id,
        business_id=profile_a.id,
        service_name="Factory Licence",
        applicant_name="Sahyadri Manufacturing Pvt Ltd",
        status="submitted",
        is_draft=False,
    )
    doc = Document(
        id=301,
        filename="incorp.pdf",
        original_name="incorp.pdf",
        mime_type="application/pdf",
        size_bytes=1024,
        uploader_id=investor_a.id,
        status="VALIDATED",
        validation_status="VALID",
        extracted_data={"mismatches": []},
    )
    db.add_all([app, doc])
    db.commit()

    result = risk_scoring_service.calculate_risk(db, app.id, persist=True)
    assert result.score <= 30.0
    assert result.risk_level == "LOW"
    assert result.triage_category == "FAST_TRACK"
    assert len(result.factors) == 0
    assert (
        "clean regulatory compliance" in result.summary.lower()
        or "fast_track" in result.summary.lower()
    )


def test_warning_document_increases_risk(test_setup_db):
    db, investor_a, _, profile_a = test_setup_db

    app = Application(
        id="APP/2026/WARN01",
        user_id=investor_a.id,
        business_id=profile_a.id,
        service_name="Factory Licence",
        applicant_name="Sahyadri Manufacturing Pvt Ltd",
        status="submitted",
    )
    doc = Document(
        id=302,
        filename="plan.pdf",
        original_name="plan.pdf",
        mime_type="application/pdf",
        size_bytes=1024,
        uploader_id=investor_a.id,
        status="VALIDATED",
        validation_status="WARNING",
        validation_reason="Minor address variance",
        extracted_data={"mismatches": []},
    )
    db.add_all([app, doc])
    db.commit()

    result = risk_scoring_service.calculate_risk(db, app.id, persist=True)
    assert result.score > 0.0
    assert result.triage_category == "DOCUMENT_REVIEW"
    assert any(
        f.factor == "Document Verification" and f.impact == 15 for f in result.factors
    )


def test_invalid_document_high_risk(test_setup_db):
    db, investor_a, _, profile_a = test_setup_db

    app = Application(
        id="APP/2026/INVAL01",
        user_id=investor_a.id,
        business_id=profile_a.id,
        service_name="Factory Licence",
        applicant_name="Sahyadri Manufacturing Pvt Ltd",
        status="submitted",
    )
    doc = Document(
        id=303,
        filename="fake_pan.pdf",
        original_name="fake_pan.pdf",
        mime_type="application/pdf",
        size_bytes=1024,
        uploader_id=investor_a.id,
        status="VALIDATED",
        validation_status="INVALID",
        validation_reason="PAN mismatch detected",
        extracted_data={
            "mismatches": [
                {
                    "field": "pan_number",
                    "extracted": "ZZZZZ9999Z",
                    "expected": "AAACS1234F",
                }
            ]
        },
    )
    db.add_all([app, doc])
    db.commit()

    result = risk_scoring_service.calculate_risk(db, app.id, persist=True)
    # INVALID (+30) + PAN mismatch (+20) = 50 pts -> MEDIUM, categorized for DOCUMENT_REVIEW
    assert result.score >= 50.0
    assert result.triage_category == "DOCUMENT_REVIEW"
    assert any(f.impact == 30 for f in result.factors)
    assert any("pan mismatch" in f.reason.lower() for f in result.factors)


def test_multiple_factors_accumulate_correctly(test_setup_db):
    db, investor_a, _, profile_a = test_setup_db

    app = Application(
        id="APP/2026/MULTI01",
        user_id=investor_a.id,
        business_id=profile_a.id,
        service_name="Factory Licence",
        applicant_name="Sahyadri Manufacturing Pvt Ltd",
        status="submitted",
    )
    # Expired doc (+25) + INVALID (+30) + CIN mismatch (+15) = 70 pts -> HIGH
    doc = Document(
        id=304,
        filename="expired_doc.pdf",
        original_name="expired_doc.pdf",
        mime_type="application/pdf",
        size_bytes=1024,
        uploader_id=investor_a.id,
        status="VALIDATED",
        validation_status="INVALID",
        validation_reason="Expired certificate",
        extracted_data={
            "is_expired": True,
            "mismatches": [
                {
                    "field": "cin_number",
                    "extracted": "L00000",
                    "expected": "U29253MH2024PTC123456",
                }
            ],
        },
    )
    db.add_all([app, doc])
    db.commit()

    result = risk_scoring_service.calculate_risk(db, app.id, persist=True)
    assert result.score == 70.0
    assert result.risk_level == "HIGH"
    assert result.triage_category == "HIGH_RISK_REVIEW"


def test_score_clamping_boundary(test_setup_db):
    db, investor_a, _, _ = test_setup_db

    # Missing profile (+20), Missing docs (+25)
    app = Application(
        id="APP/2026/NODOCS",
        user_id=investor_a.id,
        business_id=None,
        service_name="Factory Licence",
        applicant_name="Sahyadri Manufacturing Pvt Ltd",
        status="draft",
    )
    db.add(app)
    db.commit()

    result = risk_scoring_service.calculate_risk(db, app.id, persist=False)
    assert 0.0 <= result.score <= 100.0


def test_missing_profile_handled_safely(test_setup_db):
    db, _, investor_b, _ = test_setup_db

    app = Application(
        id="APP/2026/NOPROFILE",
        user_id=investor_b.id,
        business_id=None,
        service_name="NOC",
        applicant_name="Investor B",
        status="submitted",
    )
    db.add(app)
    db.commit()

    result = risk_scoring_service.calculate_risk(db, app.id, persist=False)
    assert any(f.factor == "Business Profile" for f in result.factors)
    assert result.score >= 20.0


def test_unauthorized_user_cannot_access_risk_data(client, test_setup_db):
    db, investor_a, investor_b, profile_a = test_setup_db

    app = Application(
        id="APP/2026/SECURE_APP",
        user_id=investor_a.id,
        business_id=profile_a.id,
        service_name="Clearance",
        applicant_name="Investor A",
        status="submitted",
    )
    db.add(app)
    db.commit()

    # User B token
    token_b = create_access_token(investor_b.id)

    # Investor B tries to access Investor A's risk assessment
    resp = client.get(
        f"/api/applications/{app.id}/risk",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp.status_code == 403


def test_officer_can_access_investor_risk_data(client, test_setup_db):
    db, investor_a, _, profile_a = test_setup_db

    officer = User(
        id=999,
        email="officer@gov.in",
        hashed_password="pw",
        role="OFFICER",
        is_active=True,
    )
    db.add(officer)
    db.commit()

    app = Application(
        id="APP/2026/OFFICER_VIEW",
        user_id=investor_a.id,
        business_id=profile_a.id,
        service_name="Factory Licence",
        applicant_name="Sahyadri Manufacturing Pvt Ltd",
        status="submitted",
    )
    db.add(app)
    db.commit()

    token_officer = create_access_token(officer.id)

    resp = client.get(
        f"/api/officer/applications/{app.id}/risk",
        headers={"Authorization": f"Bearer {token_officer}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "score" in data
    assert "risk_level" in data
    assert "triage_category" in data
