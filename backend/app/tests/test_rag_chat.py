"""
Unit and Integration Tests for Kajal's Module:
AI Integration — RAG & Vector Search (PRAVAH).
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal
from app.models.user import User
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.ai.vector_store import (
    search_similar_chunks,
    store_document_chunks,
    _python_cosine_distance,
)
from app.ai.prompts.query_assistant import format_rag_prompt
from app.ai.rag_service import rag_service

client = TestClient(app)


def _get_auth_token(email="rag_test@pravah.gov.in", password="SecurePassword123!"):
    """Helper to register and login a test user, returning the access token and user_id."""
    user_payload = {"email": email, "password": password}
    client.post("/api/auth/register", json=user_payload)
    login_resp = client.post("/api/auth/login", json=user_payload)
    token = login_resp.json()["data"]["access_token"]
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    user_id = me_resp.json()["data"]["id"]
    return token, user_id


# =============================================================================
# 1. API Security & Validation Tests
# =============================================================================


def test_chat_unauthenticated():
    """Unauthenticated requests to /api/chat must be rejected with 401."""
    resp = client.post("/api/chat", json={"message": "What is my approval status?"})
    assert resp.status_code == 401


def test_chat_empty_message():
    """Empty or whitespace-only messages must be rejected."""
    token, _ = _get_auth_token(email="user_val@test.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Empty string fails Pydantic min_length=1
    resp = client.post("/api/chat", json={"message": ""}, headers=headers)
    assert resp.status_code in [400, 422]

    # Whitespace-only string caught by route-level validation
    resp2 = client.post("/api/chat", json={"message": "   "}, headers=headers)
    assert resp2.status_code in [400, 422]


# =============================================================================
# 2. Vector Search & Document Ownership Isolation Tests
# =============================================================================


def test_user_document_isolation():
    """
    CRITICAL SECURITY TEST:
    Verifies that search_similar_chunks strictly enforces Document.uploader_id == user_id.
    User A must NEVER retrieve User B's documents.
    """
    token_a, user_a_id = _get_auth_token(email="investor_a@test.com")
    token_b, user_b_id = _get_auth_token(email="investor_b@test.com")

    # Synthetic 768-d unit vectors for deterministic testing
    vec_a = [0.5] + [0.0] * 767
    vec_b = [0.0, 0.5] + [0.0] * 766
    query_vec = [0.5] + [0.0] * 767  # Identical to vec_a (cosine distance = 0)

    from app.tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        # Create Document for User A
        doc_a = Document(
            filename="user_a_license.pdf",
            original_name="User A Factory License.pdf",
            mime_type="application/pdf",
            size_bytes=1024,
            status="PROCESSED",
            uploader_id=user_a_id,
        )
        # Create Document for User B
        doc_b = Document(
            filename="user_b_confidential.pdf",
            original_name="User B Confidential Tax Audit.pdf",
            mime_type="application/pdf",
            size_bytes=2048,
            status="PROCESSED",
            uploader_id=user_b_id,
        )
        db.add_all([doc_a, doc_b])
        db.commit()
        db.refresh(doc_a)
        db.refresh(doc_b)

        # Add Chunks
        chunk_a = DocumentChunk(
            document_id=doc_a.id,
            chunk_index=0,
            content="User A has factory license approval for plot 42 MIDC Pune.",
            embedding=vec_a,
        )
        chunk_b = DocumentChunk(
            document_id=doc_b.id,
            chunk_index=0,
            content="User B private secret tax records - strictly confidential.",
            embedding=vec_b,
        )
        db.add_all([chunk_a, chunk_b])
        db.commit()

        # Mock embedding generation to return query_vec
        with patch("app.ai.vector_store.generate_embeddings", return_value=[query_vec]):
            # When User A searches:
            results_a = search_similar_chunks(
                db, query="license approval", user_id=user_a_id
            )
            assert len(results_a) == 1
            assert results_a[0].document_id == doc_a.id
            assert "User A" in results_a[0].content
            assert "User B" not in results_a[0].content

            # When User B searches:
            results_b = search_similar_chunks(
                db, query="license approval", user_id=user_b_id
            )
            # Even though query vector matches chunk_a, User B cannot see it!
            for r in results_b:
                assert r.document_id != doc_a.id
                assert "User A" not in r.content

    finally:
        db.close()


def test_distance_threshold_filtering():
    """Verifies that chunks with cosine distance > max_distance (0.65) are rejected."""
    token, user_id = _get_auth_token(email="thresh_test@test.com")

    # Orthogonal vectors: cosine distance is 1.0 > 0.65 threshold
    orthogonal_vec = [1.0] + [0.0] * 767
    query_vec = [0.0, 1.0] + [0.0] * 766

    assert _python_cosine_distance(orthogonal_vec, query_vec) == 1.0

    from app.tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        doc = Document(
            filename="unrelated.pdf",
            original_name="Unrelated.pdf",
            mime_type="application/pdf",
            size_bytes=512,
            status="PROCESSED",
            uploader_id=user_id,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        chunk = DocumentChunk(
            document_id=doc.id,
            chunk_index=0,
            content="Completely irrelevant topic about gardening.",
            embedding=orthogonal_vec,
        )
        db.add(chunk)
        db.commit()

        with patch("app.ai.vector_store.generate_embeddings", return_value=[query_vec]):
            results = search_similar_chunks(
                db, query="factory license", user_id=user_id, max_distance=0.65
            )
            # Should be empty because distance 1.0 > 0.65
            assert len(results) == 0

    finally:
        db.close()


# =============================================================================
# 3. Prompt Engineering & Anti-Injection Verification
# =============================================================================


def test_format_rag_prompt_structure():
    """Verify prompt formatting and delimiter security."""
    context = "[Document: fire_noc.pdf, Chunk: 0]\nFire safety clearance granted."
    question = "Is my fire NOC valid?"

    prompt = format_rag_prompt(context, question)

    assert "<retrieved_context>" in prompt
    assert "</retrieved_context>" in prompt
    assert "<user_question>" in prompt
    assert "</user_question>" in prompt
    assert "CRITICAL SECURITY RULES" in prompt
    assert "Fire safety clearance granted." in prompt
    assert "Is my fire NOC valid?" in prompt


# =============================================================================
# 4. End-to-End Chat API Response Format
# =============================================================================


def test_chat_no_context_response():
    """When a user has no uploaded documents, safe no-context message is returned."""
    token, _ = _get_auth_token(email="empty_docs@test.com")
    headers = {"Authorization": f"Bearer {token}"}

    with patch("app.ai.vector_store.generate_embeddings", return_value=[[0.1] * 768]):
        resp = client.post(
            "/api/chat",
            json={"message": "Do I have a factory license?"},
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert (
            "could not find any relevant information" in data["data"]["reply"].lower()
        )
        assert data["data"]["sources"] == []


def test_chat_end_to_end_with_mocked_llm():
    """End-to-end test verifying /api/chat returns structured answer and genuine source metadata."""
    token, user_id = _get_auth_token(email="e2e_rag@test.com")
    headers = {"Authorization": f"Bearer {token}"}

    sample_vec = [0.1] * 768

    from app.tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        doc = Document(
            filename="fire_noc.pdf",
            original_name="Fire Department NOC.pdf",
            mime_type="application/pdf",
            size_bytes=4096,
            status="PROCESSED",
            uploader_id=user_id,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        chunk = DocumentChunk(
            document_id=doc.id,
            chunk_index=0,
            content="Fire Safety Certificate No. MH-FIRE-2024-8839 is APPROVED on 15-Aug-2024.",
            embedding=sample_vec,
        )
        db.add(chunk)
        db.commit()

        mock_gemini_resp = MagicMock()
        mock_gemini_resp.text = "Your Fire Safety Certificate No. MH-FIRE-2024-8839 was approved on 15-Aug-2024."

        with (
            patch("app.ai.vector_store.generate_embeddings", return_value=[sample_vec]),
            patch("app.core.config.settings.GEMINI_API_KEY", "test-fake-key"),
            patch("google.genai.Client") as mock_client_cls,
        ):

            mock_client_instance = MagicMock()
            mock_client_instance.models.generate_content.return_value = mock_gemini_resp
            mock_client_cls.return_value = mock_client_instance

            resp = client.post(
                "/api/chat",
                json={"message": "What is my fire certificate number?"},
                headers=headers,
            )

            assert resp.status_code == 200
            res_json = resp.json()
            assert res_json["status"] == "success"
            assert "MH-FIRE-2024-8839" in res_json["data"]["reply"]
            assert len(res_json["data"]["sources"]) == 1
            src = res_json["data"]["sources"][0]
            assert src["document_id"] == doc.id
            assert src["filename"] == "Fire Department NOC.pdf"
            assert src["chunk_index"] == 0

    finally:
        db.close()
