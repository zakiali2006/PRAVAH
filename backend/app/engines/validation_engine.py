import re
import difflib
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from app.schemas.extraction import DocumentExtractionResult
from app.schemas.validation import ValidationResult, ValidationStatus, FieldMismatch
from app.models.business import BusinessProfile


def normalize_string(val: Optional[str]) -> str:
    """Lowercase, strip non-alphanumeric (except single spaces), and trim."""
    if not val:
        return ""
    cleaned = re.sub(r"[^\w\s]", " ", val.lower())
    return re.sub(r"\s+", " ", cleaned).strip()


def normalize_company_name(name: Optional[str]) -> str:
    """
    Normalizes company names to handle common legal/corporate suffix variations:
    e.g. 'ABC Pvt. Ltd.' vs 'ABC Private Limited' vs 'ABC Pvt Ltd'.
    """
    norm = normalize_string(name)
    if not norm:
        return ""

    # Common corporate entity variations
    suffix_replacements = [
        (r"\bprivate\s+limited\b", "pvt ltd"),
        (r"\bprivate\s+ltd\b", "pvt ltd"),
        (r"\bpvt\s+ltd\b", "pvt ltd"),
        (r"\bpvt\s+limited\b", "pvt ltd"),
        (r"\blimited\b", "ltd"),
        (r"\bcorporation\b", "corp"),
        (r"\bincorporated\b", "inc"),
        (r"\bcompany\b", "co"),
    ]

    for pattern, repl in suffix_replacements:
        norm = re.sub(pattern, repl, norm)

    return re.sub(r"\s+", " ", norm).strip()


def normalize_identifier(identifier: Optional[str]) -> str:
    """Uppercase, remove all spaces and hyphens for strict ID matching (PAN, CIN, GSTIN)."""
    if not identifier:
        return ""
    return re.sub(r"[\s\-_]", "", identifier.upper())


def extract_pan_from_text(text: Optional[str]) -> Optional[str]:
    """Finds Indian Income Tax PAN pattern (5 uppercase letters, 4 digits, 1 letter)."""
    if not text:
        return None
    match = re.search(r"\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b", text.upper())
    return match.group(1) if match else None


def extract_cin_from_text(text: Optional[str]) -> Optional[str]:
    """Finds Corporate Identification Number (CIN: 21 alphanumeric chars starting with L or U)."""
    if not text:
        return None
    match = re.search(
        r"\b([LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6})\b", text.upper()
    )
    return match.group(1) if match else None


def validate_document_data(
    extracted_data: DocumentExtractionResult,
    business_profile: Optional[BusinessProfile] = None,
    raw_text: Optional[str] = None,
) -> ValidationResult:
    """
    Phase 6: Automated Verification Engine
    Applies deterministic, rule-based cross-referencing between extracted document data
    and the authenticated investor's real BusinessProfile.
    """
    reasons: List[str] = []
    matches: List[str] = []
    mismatches: List[FieldMismatch] = []
    status = ValidationStatus.VALID

    # Handle scenario where investor has not yet created a BusinessProfile
    if not business_profile:
        reasons.append(
            "No registered Business Profile found for user. Document stored but profile cross-referencing could not be performed."
        )
        return ValidationResult(
            status=ValidationStatus.WARNING,
            confidence=0.50,
            matches=[],
            mismatches=[
                FieldMismatch(
                    field="business_profile",
                    expected="Registered Profile",
                    extracted="None",
                    reason="User has not created a Business Profile yet.",
                )
            ],
            reasons=reasons,
        )

    expected_business_name = business_profile.company_name or ""
    expected_pan = normalize_identifier(business_profile.pan_number)
    expected_cin = normalize_identifier(business_profile.cin_number)
    expected_address = business_profile.address or ""

    name_confidence = 1.0

    # -------------------------------------------------------------------------
    # 1. Business / Company Name Verification (Normalized & Fuzzy Comparison)
    # -------------------------------------------------------------------------
    ext_name = extracted_data.business_name
    if not ext_name:
        reasons.append("Missing business name on document.")
        mismatches.append(
            FieldMismatch(
                field="business_name",
                expected=expected_business_name,
                extracted="None",
                reason="Document does not display a detectable business name.",
            )
        )
        status = ValidationStatus.INVALID
        name_confidence = 0.20
    else:
        norm_expected = normalize_company_name(expected_business_name)
        norm_extracted = normalize_company_name(ext_name)

        if norm_expected == norm_extracted:
            # Exact match after corporate normalization
            matches.append("business_name")
            name_confidence = 1.0
        elif norm_expected in norm_extracted or norm_extracted in norm_expected:
            # Substring containment (e.g. 'Sahyadri Precision' vs 'Sahyadri Precision Pvt Ltd')
            matches.append("business_name")
            name_confidence = 0.95
        else:
            # Fuzzy string similarity ratio
            ratio = difflib.SequenceMatcher(None, norm_expected, norm_extracted).ratio()
            if ratio >= 0.85:
                # Minor name variation (e.g. spelling or punctuation)
                matches.append("business_name")
                name_confidence = round(ratio, 2)
            elif ratio >= 0.70:
                # Substantial variation — flagged as WARNING for officer scrutiny
                mismatches.append(
                    FieldMismatch(
                        field="business_name",
                        expected=expected_business_name,
                        extracted=ext_name,
                        reason=f"Company name variation ({int(ratio * 100)}% match). Expected '{expected_business_name}', found '{ext_name}'.",
                    )
                )
                reasons.append(
                    f"Business name partial match ({int(ratio * 100)}% similarity)."
                )
                if status != ValidationStatus.INVALID:
                    status = ValidationStatus.WARNING
                name_confidence = round(ratio, 2)
            else:
                # Complete mismatch — likely wrong company or forged doc
                mismatches.append(
                    FieldMismatch(
                        field="business_name",
                        expected=expected_business_name,
                        extracted=ext_name,
                        reason=f"Business name mismatch. Expected '{expected_business_name}', found '{ext_name}'.",
                    )
                )
                reasons.append(
                    f"Business name mismatch: Expected '{expected_business_name}', found '{ext_name}'."
                )
                status = ValidationStatus.INVALID
                name_confidence = max(0.1, round(ratio, 2))

    # -------------------------------------------------------------------------
    # 2. PAN Number Verification (Exact Normalized Match)
    # -------------------------------------------------------------------------
    doc_pan = normalize_identifier(extracted_data.pan_number)
    # Fallback to checking document_number or raw text for PAN format
    if not doc_pan:
        doc_pan = extract_pan_from_text(
            extracted_data.document_number
        ) or extract_pan_from_text(raw_text)

    if expected_pan:
        if doc_pan:
            if doc_pan == expected_pan:
                matches.append("pan_number")
            else:
                mismatches.append(
                    FieldMismatch(
                        field="pan_number",
                        expected=expected_pan,
                        extracted=doc_pan,
                        reason=f"PAN number mismatch: Expected '{expected_pan}', found '{doc_pan}'.",
                    )
                )
                reasons.append(
                    f"PAN mismatch: Document contains '{doc_pan}' but registered PAN is '{expected_pan}'."
                )
                status = ValidationStatus.INVALID
        elif "PAN" in (extracted_data.document_type or "").upper():
            # If the document is specifically a PAN Card, PAN must be present
            mismatches.append(
                FieldMismatch(
                    field="pan_number",
                    expected=expected_pan,
                    extracted="None",
                    reason="Document identified as PAN card but valid PAN number was not found.",
                )
            )
            reasons.append("PAN card is missing a readable PAN number.")
            status = ValidationStatus.INVALID

    # -------------------------------------------------------------------------
    # 3. CIN Number Verification (If applicable and present)
    # -------------------------------------------------------------------------
    doc_cin = normalize_identifier(extracted_data.cin_number)
    if not doc_cin:
        doc_cin = extract_cin_from_text(
            extracted_data.document_number
        ) or extract_cin_from_text(raw_text)

    if expected_cin:
        if doc_cin:
            if doc_cin == expected_cin:
                matches.append("cin_number")
            else:
                mismatches.append(
                    FieldMismatch(
                        field="cin_number",
                        expected=expected_cin,
                        extracted=doc_cin,
                        reason=f"CIN number mismatch: Expected '{expected_cin}', found '{doc_cin}'.",
                    )
                )
                reasons.append(
                    f"CIN mismatch: Document contains '{doc_cin}' but registered CIN is '{expected_cin}'."
                )
                status = ValidationStatus.INVALID
        elif "INCORPORATION" in (extracted_data.document_type or "").upper():
            # Incorporation certificates for Pvt Ltd should typically have CIN
            reasons.append(
                "Incorporation certificate does not show a clear CIN number."
            )
            if status != ValidationStatus.INVALID:
                status = ValidationStatus.WARNING

    # -------------------------------------------------------------------------
    # 4. Address Verification (City / District Token Overlap)
    # -------------------------------------------------------------------------
    if expected_address and extracted_data.address:
        norm_exp_addr = normalize_string(expected_address)
        norm_ext_addr = normalize_string(extracted_data.address)

        # Extract tokens with length >= 4 (skip short prepositions like 'at', 'in', 'of')
        exp_tokens = set(w for w in norm_exp_addr.split() if len(w) >= 4)
        ext_tokens = set(w for w in norm_ext_addr.split() if len(w) >= 4)

        overlap = exp_tokens.intersection(ext_tokens)
        if len(overlap) >= 2 or (
            len(exp_tokens) > 0 and len(overlap) / len(exp_tokens) >= 0.4
        ):
            matches.append("address")
        elif len(exp_tokens) > 0 and len(overlap) == 0:
            mismatches.append(
                FieldMismatch(
                    field="address",
                    expected=expected_address,
                    extracted=extracted_data.address,
                    reason="Document address does not match registered business address locality.",
                )
            )
            reasons.append(
                "Document address appears to differ from registered business address."
            )
            if status != ValidationStatus.INVALID:
                status = ValidationStatus.WARNING

    # -------------------------------------------------------------------------
    # 5. Expiry Date Check (Deterministic Date Comparison)
    # -------------------------------------------------------------------------
    if extracted_data.expiry_date:
        try:
            expiry = datetime.strptime(extracted_data.expiry_date, "%Y-%m-%d")
            if expiry < datetime.now():
                mismatches.append(
                    FieldMismatch(
                        field="expiry_date",
                        expected="Future date (Valid)",
                        extracted=extracted_data.expiry_date,
                        reason=f"Document has expired on {extracted_data.expiry_date}.",
                    )
                )
                reasons.append(f"Document has expired on {extracted_data.expiry_date}.")
                status = ValidationStatus.INVALID
            else:
                matches.append("valid_expiry")
        except ValueError:
            reasons.append(
                f"Unrecognized expiry date format: {extracted_data.expiry_date}"
            )
            if status != ValidationStatus.INVALID:
                status = ValidationStatus.WARNING

    # -------------------------------------------------------------------------
    # 6. Signature / Seal Detection
    # -------------------------------------------------------------------------
    if extracted_data.signatures_present is False:
        mismatches.append(
            FieldMismatch(
                field="signatures",
                expected="Authorized signature or stamp",
                extracted="None detected",
                reason="No authorized signatures or digital stamps detected on document.",
            )
        )
        reasons.append("No authorized signatures or digital stamps detected.")
        if status != ValidationStatus.INVALID:
            status = ValidationStatus.WARNING
    elif extracted_data.signatures_present is True:
        matches.append("signatures")

    # -------------------------------------------------------------------------
    # 7. Document Identifier Presence
    # -------------------------------------------------------------------------
    if not extracted_data.document_number and not doc_pan and not doc_cin:
        reasons.append("Missing primary document identification number.")
        if status != ValidationStatus.INVALID:
            status = ValidationStatus.WARNING
    else:
        matches.append("document_number")

    # -------------------------------------------------------------------------
    # Finalize Overall Confidence & Reasons
    # -------------------------------------------------------------------------
    if status == ValidationStatus.INVALID:
        final_confidence = min(0.40, name_confidence)
    elif status == ValidationStatus.WARNING:
        final_confidence = max(0.60, min(0.85, name_confidence))
    else:
        final_confidence = max(0.90, name_confidence)
        if not reasons:
            reasons.append(
                "Document passed all automated verifications against business profile."
            )

    return ValidationResult(
        status=status,
        confidence=round(final_confidence, 2),
        matches=matches,
        mismatches=mismatches,
        reasons=reasons,
    )
