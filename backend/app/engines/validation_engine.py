from datetime import datetime
from app.schemas.extraction import DocumentExtractionResult
from app.schemas.validation import ValidationResult, ValidationStatus


def validate_document_data(
    extracted_data: DocumentExtractionResult, expected_business_name: str
) -> ValidationResult:
    """
    Phase 6: Validation Engine
    Applies deterministic business rules to the extracted data.
    NO LLM CALLS HERE. This strictly enforces logical validation.
    """
    reasons = []
    status = ValidationStatus.VALID

    # 1. Business Name Check
    if not extracted_data.business_name:
        reasons.append("Missing business name in document.")
        status = ValidationStatus.INVALID
    elif (
        expected_business_name.lower() not in extracted_data.business_name.lower()
        and extracted_data.business_name.lower() not in expected_business_name.lower()
    ):
        # A simple inclusion check to handle minor mismatches (e.g. "Acme Corp" vs "Acme Corp Ltd")
        reasons.append(
            f"Business name mismatch. Expected: '{expected_business_name}', Found: '{extracted_data.business_name}'."
        )
        # Treat as WARNING because OCR might have slightly mangled it, or it could be a trading name
        if status != ValidationStatus.INVALID:
            status = ValidationStatus.WARNING

    # 2. Expiry Date Check
    if extracted_data.expiry_date:
        try:
            # Assumes YYYY-MM-DD
            expiry = datetime.strptime(extracted_data.expiry_date, "%Y-%m-%d")
            if expiry < datetime.now():
                reasons.append(f"Document has expired on {extracted_data.expiry_date}.")
                status = ValidationStatus.INVALID
        except ValueError:
            reasons.append(f"Invalid expiry date format: {extracted_data.expiry_date}")
            status = ValidationStatus.INVALID

    # 3. Signature Check
    if extracted_data.signatures_present is False:
        reasons.append("No authorized signatures detected on the document.")
        # Some docs don't need signatures, so it's a WARNING
        if status != ValidationStatus.INVALID:
            status = ValidationStatus.WARNING

    # 4. Document Number Check
    if not extracted_data.document_number:
        reasons.append("Missing primary document ID number.")
        if status != ValidationStatus.INVALID:
            status = ValidationStatus.WARNING

    if not reasons:
        reasons.append("All checks passed.")

    return ValidationResult(status=status, reasons=reasons)
