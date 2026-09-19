from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- DocumentType Schemas ---


class DocumentTypeBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = Field(None, max_length=500)


class DocumentTypeCreate(DocumentTypeBase):
    pass


class DocumentTypeOut(DocumentTypeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Document Schemas ---


class DocumentBase(BaseModel):
    filename: str = Field(..., max_length=255)
    original_name: str = Field(..., max_length=255)
    mime_type: str = Field(..., max_length=100)
    size_bytes: int
    document_type_id: Optional[int] = None
    status: Optional[str] = "UPLOADED"


class DocumentCreate(DocumentBase):
    uploader_id: int


class DocumentOut(DocumentBase):
    id: int
    file_path: Optional[str] = None
    uploader_id: int

    extracted_data: Optional[Dict[str, Any]] = None
    validation_status: Optional[str] = None
    validation_reason: Optional[str] = None

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- ApplicationDocument Schemas ---


class ApplicationDocumentBase(BaseModel):
    application_id: str
    document_id: int


class ApplicationDocumentCreate(ApplicationDocumentBase):
    pass


class ApplicationDocumentOut(ApplicationDocumentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
