import logging
from typing import Optional, Dict, Any
from app.engines.ocr_engine import extract_raw_text
from app.engines.extraction_engine import extract_structured_data
from app.engines.validation_engine import validate_document_data
from app.models.business import BusinessProfile

logger = logging.getLogger(__name__)


class OCRService:
    """
    Service adapter for OCR text extraction and automated verification.
    Delegates to the engine layer (ocr_engine, extraction_engine, validation_engine).
    """

    @staticmethod
    def extract_and_verify(
        file_path: str,
        mime_type: str,
        document_type_name: str,
        business_profile: Optional[BusinessProfile] = None,
    ) -> Dict[str, Any]:
        """
        Executes OCR extraction and automated verification against business profile.
        """
        raw_text = extract_raw_text(file_path, mime_type)
        structured_data = extract_structured_data(raw_text, document_type_name)
        validation_result = validate_document_data(
            extracted_data=structured_data,
            business_profile=business_profile,
            raw_text=raw_text,
        )

        return {
            "raw_text": raw_text,
            "structured_data": structured_data.model_dump(),
            "validation_result": validation_result.model_dump(),
        }


ocr_service = OCRService()
