from pydantic import BaseModel
from typing import List, Optional


class DepartmentSLA(BaseModel):
    department: str
    total: int
    on_track: int
    at_risk: int
    breached: int
    avg_days_remaining: float


class SLADashboardResponse(BaseModel):
    total_applications: int
    on_track: int
    at_risk: int
    breached: int
    departments: List[DepartmentSLA]


class WorkloadResponse(BaseModel):
    total_assigned: int
    pending: int
    in_review: int
    completed_today: int
    high_risk_count: int
    avg_risk_score: float


class DuplicateCandidate(BaseModel):
    application_id: str
    matched_application_id: str
    applicant_name: str
    matched_applicant_name: str
    match_type: str  # exact_pan, fuzzy_name, address_match
    confidence: float
    details: str


class DuplicateDetectionResponse(BaseModel):
    total_flagged: int
    candidates: List[DuplicateCandidate]


class RecommendAssignmentResponse(BaseModel):
    application_id: str
    recommended_officer_id: Optional[int] = None
    recommended_officer_email: Optional[str] = None
    reason: str
    factors: List[str]
