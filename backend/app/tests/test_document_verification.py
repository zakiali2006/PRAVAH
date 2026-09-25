"""
Unit tests for Automated OCR Document Verification & Business Profile Matching.
Owner: Kajal (AI & Automated Document Verification)
"""

import pytest
from datetime import datetime, timedelta
from app.schemas.extraction import DocumentExtractionResult
from app.schemas.validation import ValidationStatus
from app.engines.validation_engine import (
    validate_document_data,
    normalize_company_name,
    normalize_identifier,
)
from app.models.business import BusinessProfile


@pytest.fixture
def sample_business_profile():
    return BusinessProfile(
        company_name="Sahyadri Precision Private Limited",
        pan_number="AAACS1234F",
        cin_number="U29253MH2024PTC123456",
        industry_sector="Manufacturing",
        registration_type="Private Limited",
        address="Plot C-14, MIDC Industrial Area, Chakan, Pune, Maharashtra 410501",
    )


def test_normalize_company_name():
    assert normalize_company_name("Sahyadri Precision Pvt. Ltd.") == "sahyadri precision pvt ltd"
    assert normalize_company_name("Sahyadri Precision Private Limited") == "sahyadri precision pvt ltd"
    assert normalize_company_name("Sahyadri Precision Pvt Ltd") == "sahyadri precision pvt ltd"
    assert normalize_company_name("Acme Corporation") == "acme corp"


def test_normalize_identifier():
    assert normalize_identifier("aaacs 1234 f") == "AAACS1234F"
    assert normalize_identifier("U29253-MH-2024-PTC-123456") == "U29253MH2024PTC123456"


def test_valid_document_matching_profile(sample_business_profile):
    future_date = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")
    extracted = DocumentExtractionResult(
        document_type="INCORPORATION_CERTIFICATE",
        business_name="Sahyadri Precision Pvt. Ltd.",
        pan_number="AAACS1234F",
        cin_number="U29253MH2024PTC123456",
        document_number="U29253MH2024PTC123456",
        address="Plot C-14, MIDC Chakan, Pune",
        expiry_date=future_date,
        signatures_present=True,
    )
    result = validate_document_data(extracted, sample_business_profile)
    assert result.status == ValidationStatus.VALID
    assert result.confidence >= 0.90
    assert "business_name" in result.matches
    assert "pan_number" in result.matches
    assert "cin_number" in result.matches
    assert len(result.mismatches) == 0


def test_minor_name_variation(sample_business_profile):
    extracted = DocumentExtractionResult(
        document_type="CERTIFICATE",
        business_name="Sahyadri Precision Ltd",
        pan_number="AAACS1234F",
        document_number="DOC-9988",
        signatures_present=True,
    )
    result = validate_document_data(extracted, sample_business_profile)
    assert result.status == ValidationStatus.VALID
    assert "business_name" in result.matches
    assert result.confidence >= 0.85


def test_wrong_pan_mismatch(sample_business_profile):
    extracted = DocumentExtractionResult(
        document_type="PAN_CARD",
        business_name="Sahyadri Precision Private Limited",
        pan_number="ZZZZZ9999Z",
        document_number="ZZZZZ9999Z",
    )
    result = validate_document_data(extracted, sample_business_profile)
    assert result.status == ValidationStatus.INVALID
    assert any(m.field == "pan_number" for m in result.mismatches)
    assert result.confidence <= 0.40


def test_wrong_company_name_mismatch(sample_business_profile):
    extracted = DocumentExtractionResult(
        document_type="INCORPORATION_CERTIFICATE",
        business_name="Tata Consultancy Services Limited",
        pan_number="AAACS1234F",
        document_number="DOC-12345",
    )
    result = validate_document_data(extracted, sample_business_profile)
    assert result.status == ValidationStatus.INVALID
    assert any(m.field == "business_name" for m in result.mismatches)
    assert result.confidence <= 0.40


def test_expired_document(sample_business_profile):
    extracted = DocumentExtractionResult(
        document_type="FIRE_SAFETY_NOC",
        business_name="Sahyadri Precision Private Limited",
        expiry_date="2021-05-15",
        document_number="NOC-2021-001",
    )
    result = validate_document_data(extracted, sample_business_profile)
    assert result.status == ValidationStatus.INVALID
    assert any(m.field == "expiry_date" for m in result.mismatches)


def test_missing_business_profile():
    extracted = DocumentExtractionResult(
        document_type="CERTIFICATE",
        business_name="Sahyadri Precision Private Limited",
        document_number="DOC-123",
    )
    result = validate_document_data(extracted, business_profile=None)
    assert result.status == ValidationStatus.WARNING
    assert result.confidence == 0.50
    assert any(m.field == "business_profile" for m in result.mismatches)


def test_missing_signatures_warning(sample_business_profile):
    extracted = DocumentExtractionResult(
        document_type="LAYOUT_PLAN",
        business_name="Sahyadri Precision Private Limited",
        document_number="PLAN-99",
        signatures_present=False,
    )
    result = validate_document_data(extracted, sample_business_profile)
    assert result.status == ValidationStatus.WARNING
    assert any(m.field == "signatures" for m in result.mismatches)
