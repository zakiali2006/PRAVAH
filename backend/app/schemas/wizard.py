from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class WizardAnswers(BaseModel):
    sector: str = Field(..., min_length=2)
    location: str = Field(..., min_length=2)
    investment: float = Field(..., gt=0)
    capacity: str = Field(..., min_length=1)
    employment: int = Field(..., ge=0)
    land_status: str = Field(..., min_length=2)
    project_stage: str = Field(..., min_length=2)
    other_parameters: Optional[Dict[str, Any]] = None


class WizardRunCreate(BaseModel):
    answers: WizardAnswers


class WizardResultOut(BaseModel):
    id: int
    answers: Dict[str, Any]

    class Config:
        from_attributes = True


class WizardRunOut(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    results: list[WizardResultOut] = []

    class Config:
        from_attributes = True
