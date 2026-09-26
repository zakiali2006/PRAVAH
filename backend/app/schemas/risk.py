from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class RiskFactor(BaseModel):
    factor: str
    impact: int
    reason: str


class RiskAssessmentResponse(BaseModel):
    score: float
    risk_level: str
    triage_category: str
    summary: Optional[str] = None
    factors: List[RiskFactor] = []
    calculated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
