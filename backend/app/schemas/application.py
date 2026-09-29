from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.risk import RiskAssessmentResponse


class ApplicationStageBase(BaseModel):
    name: str
    desc: Optional[str] = None
    status: str = "pending"
    days: Optional[int] = 0
    statutory_limit: Optional[int] = 15


class ApplicationStageResponse(ApplicationStageBase):
    id: int
    application_id: str

    class Config:
        from_attributes = True


class ApplicationBase(BaseModel):
    service_name: str
    applicant_name: str
    status: str = "draft"
    is_draft: bool = True
    urgency: str = "normal"
    ai_score: float = 0.0


class ApplicationCreate(BaseModel):
    service_name: str
    applicant_name: str
    business_id: Optional[int] = None


class ApplicationStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None


class ApplicationResponse(ApplicationBase):
    id: str
    user_id: int
    business_id: Optional[int] = None
    assigned_officer_id: Optional[int] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime
    stages: List[ApplicationStageResponse] = []
    risk_score: Optional[RiskAssessmentResponse] = None

    class Config:
        from_attributes = True
