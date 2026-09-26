from pydantic import BaseModel
from typing import Optional, List, Any, Dict
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
    fee_amount: Optional[float] = 0.0
    service_code: Optional[str] = None
    factory_unit_id: Optional[int] = None
    caf_data: Optional[Dict[str, Any]] = None


class ApplicationCreate(BaseModel):
    service_name: str
    applicant_name: str
    business_id: Optional[int] = None
    factory_unit_id: Optional[int] = None
    service_code: Optional[str] = None
    fee_amount: Optional[float] = 0.0
    caf_data: Optional[Dict[str, Any]] = None
    status: Optional[str] = "draft"


class ApplicationStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None


class ApplicationResponse(ApplicationBase):
    id: str
    user_id: int
    business_id: Optional[int] = None
    factory_unit_id: Optional[int] = None
    assigned_officer_id: Optional[int] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime
    stages: List[ApplicationStageResponse] = []
    risk_score: Optional[RiskAssessmentResponse] = None

    class Config:
        from_attributes = True
