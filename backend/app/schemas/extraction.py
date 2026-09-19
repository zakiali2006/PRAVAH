from pydantic import BaseModel, Field
from typing import Optional


class DocumentExtractionResult(BaseModel):
    """
    Standardized schema for Document data extraction.
    Used by the AI to guarantee consistent JSON output.
    """

    document_type: str = Field(
        description="The classification of the document (e.g., PAN, AADHAAR, GST, CERTIFICATE)"
    )
    business_name: Optional[str] = Field(
        None,
        description="The name of the business or individual the document belongs to",
    )
    document_number: Optional[str] = Field(
        None, description="The primary ID number (e.g. GSTIN, PAN number)"
    )
    issue_date: Optional[str] = Field(
        None, description="The date the document was issued (YYYY-MM-DD)"
    )
    expiry_date: Optional[str] = Field(
        None, description="The date the document expires (YYYY-MM-DD)"
    )
    address: Optional[str] = Field(
        None, description="The full address listed on the document"
    )
    signatures_present: Optional[bool] = Field(
        None,
        description="True if human or digital signatures are detected on the document",
    )
    raw_extracted_text: Optional[str] = Field(
        None, description="A subset of the raw text that is most relevant"
    )
