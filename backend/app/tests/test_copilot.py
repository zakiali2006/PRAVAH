"""
Unit and integration tests for RAG Chatbot -> Application Copilot.
Owner: Kajal (AI Integration: RAG & Application Copilot)
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.models.application import Application
from app.models.business import BusinessProfile
from app.models.document import Document
from app.models.user import User
from app.core.security import create_access_token
from app.ai.rag_service import rag_service


@pytest.fixture
def copilot_test_setup(client):
    from app.tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    try:
        user1 = User(
            id=401,
            email="investor1@pravah.gov.in",
            hashed_password="hashed_secret_pw",
            role="investor",
            is_active=True,
        )
        user2 = User(
            id=402,
            email="investor2@pravah.gov.in",
            hashed_password="hashed_secret_pw2",
            role="investor",
            is_active=True,
        )
        db.add_all([user1, user2])
        db.commit()

        profile1 = BusinessProfile(
            id=501,
            user_id=401,
            company_name="Patil Agro Industries Pvt Ltd",
            pan_number="AABCP1122D",
            cin_number="U01111MH2023PTC998877",
            industry_sector="Agro Processing",
            registration_type="Private Limited",
            address="Plot 55, MIDC Baramati, Pune",
        )
        db.add(profile1)
        db.commit()

        app1 = Application(
            id="APP/2026/COPILOT01",
            user_id=401,
            business_id=501,
            service_name="Factory Licence",
            applicant_name="Patil Agro Industries Pvt Ltd",
            status="submitted",
            urgency="normal",
            ai_score=10.0,
        )
        doc1 = Document(
            id=601,
            filename="pan_card.pdf",
            original_name="pan_card.pdf",
            mime_type="application/pdf",
            size_bytes=2048,
            uploader_id=401,
            status="VALIDATED",
            validation_status="VALID",
            extracted_data={"mismatches": []},
        )
        db.add_all([app1, doc1])
        db.commit()

        yield db, user1, user2, app1, doc1
    finally:
        db.close()


def test_copilot_context_building_facts(copilot_test_setup):
    db, user1, _, app1, doc1 = copilot_test_setup

    facts = rag_service._build_application_facts(
        db=db,
        user_id=user1.id,
        application_id=app1.id,
    )

    assert "APP/2026/COPILOT01" in facts
    assert "Patil Agro Industries Pvt Ltd" in facts
    assert "AABCP1122D" in facts
    assert "pan_card.pdf" in facts
    assert "VALID" in facts
    # Security check: sensitive internal passwords/keys must NOT be in context
    assert "hashed_secret_pw" not in facts
    assert "password" not in facts.lower()


def test_copilot_unauthorized_cross_user_access_blocked(client, copilot_test_setup):
    _, _, user2, app1, _ = copilot_test_setup

    token2 = create_access_token(user2.id)

    # User 2 tries to ask Copilot about User 1's application
    resp = client.post(
        "/api/chat",
        headers={"Authorization": f"Bearer {token2}"},
        json={
            "message": "What is the status of my application?",
            "application_id": app1.id,
        },
    )
    assert resp.status_code == 403
    assert "not authorized" in resp.json().get("message", "").lower()


def test_copilot_missing_application_returns_404(client, copilot_test_setup):
    _, user1, _, _, _ = copilot_test_setup

    token1 = create_access_token(user1.id)

    resp = client.post(
        "/api/chat",
        headers={"Authorization": f"Bearer {token1}"},
        json={
            "message": "Check application status",
            "application_id": "APP/NON_EXISTENT_999",
        },
    )
    assert resp.status_code == 404


def test_copilot_empty_message_returns_400(client, copilot_test_setup):
    _, user1, _, _, _ = copilot_test_setup

    token1 = create_access_token(user1.id)

    resp = client.post(
        "/api/chat",
        headers={"Authorization": f"Bearer {token1}"},
        json={"message": "   "},
    )
    assert resp.status_code == 400


def test_extract_form_suggestions():
    sample_text = (
        "Based on your BusinessProfile, you should enter:\n"
        "[SUGGESTION: business_name -> Patil Agro Industries Pvt Ltd | Reason: Matches Certificate of Incorporation]\n"
        "And for the PAN:\n"
        "[SUGGESTION: pan_number -> AABCP1122D | Reason: Official PAN on record]"
    )
    suggestions = rag_service._extract_suggestions(sample_text)
    assert len(suggestions) == 2
    assert suggestions[0]["field"] == "business_name"
    assert suggestions[0]["suggested_value"] == "Patil Agro Industries Pvt Ltd"
    assert suggestions[1]["field"] == "pan_number"
    assert suggestions[1]["suggested_value"] == "AABCP1122D"


def test_chat_without_application_id_backward_compatible(client, copilot_test_setup):
    _, user1, _, _, _ = copilot_test_setup

    token1 = create_access_token(user1.id)

    # Mock RAG retrieval
    with patch("app.ai.rag_service.search_similar_chunks", return_value=[]):
        resp = client.post(
            "/api/chat",
            headers={"Authorization": f"Bearer {token1}"},
            json={"message": "What documents are required for MIDC?"},
        )
        assert resp.status_code == 200
        data = resp.json().get("data", {})
        assert "reply" in data
        assert "sources" in data
