from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class StageBase(BaseModel):
    name: str
    desc: Optional[str] = None
    status: str
    days: int
    statutory_limit: int


class StageOut(StageBase):
    id: int
    application_id: str

    class Config:
        from_attributes = True


class ApplicationBase(BaseModel):
    applicant_name: str
    business_profile_id: int
    factory_unit_id: Optional[int] = None
    urgency: Optional[str] = "normal"
    ai_score: Optional[float] = 0.0
    status: Optional[str] = "draft"
    is_draft: Optional[bool] = True


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationOut(ApplicationBase):
    id: str
    user_id: int
    service_id: int
    submitted_at: Optional[datetime] = None
    created_at: datetime
    current_stage: Optional[StageOut] = None

    class Config:
        from_attributes = True


class DocumentUpload(BaseModel):
    document_type_id: int
    document_id: int
