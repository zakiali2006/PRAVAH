from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user, RoleChecker
from app.schemas.application import ApplicationStatusUpdate, ApplicationResponse
from app.schemas.risk import RiskAssessmentResponse
from app.schemas.officer import (
    SLADashboardResponse,
    WorkloadResponse,
    DuplicateDetectionResponse,
    RecommendAssignmentResponse,
)
from app.services.application_service import ApplicationService
from app.services.officer_analytics_service import officer_analytics_service
from app.repositories.application_repo import application_repo
from typing import List

router = APIRouter()
allow_officers = RoleChecker(["OFFICER", "SYSTEM_ADMIN"])


@router.get("/queue", response_model=List[ApplicationResponse])
def get_officer_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    # Get applications assigned to this officer
    return application_repo.get_pending_for_officer(db, current_user.id)


@router.post(
    "/applications/{application_id:path}/status", response_model=ApplicationResponse
)
def update_application_status(
    application_id: str,
    status_update: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    return ApplicationService.update_status(
        db, application_id, status_update, current_user.id
    )


@router.get(
    "/applications/{application_id:path}/risk", response_model=RiskAssessmentResponse
)
def get_application_risk(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    try:
        from app.services.risk_scoring_service import risk_scoring_service

        return risk_scoring_service.get_or_calculate_risk(db, application_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to load risk score: {str(e)}"
        )


@router.post(
    "/applications/{application_id:path}/recalculate-risk",
    response_model=RiskAssessmentResponse,
)
def recalculate_application_risk(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    try:
        from app.services.risk_scoring_service import risk_scoring_service

        return risk_scoring_service.calculate_risk(db, application_id, persist=True)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to recalculate risk score: {str(e)}"
        )


# -----------------------------------------------------------------------
# NEW: SLA Dashboard
# -----------------------------------------------------------------------
@router.get("/sla-dashboard", response_model=SLADashboardResponse)
def get_sla_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    """Aggregate SLA statistics across all active applications."""
    return officer_analytics_service.get_sla_dashboard(db)


# -----------------------------------------------------------------------
# NEW: Workload Summary
# -----------------------------------------------------------------------
@router.get("/workload", response_model=WorkloadResponse)
def get_workload(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    """Get workload statistics for the current officer."""
    return officer_analytics_service.get_workload(db, current_user.id)


# -----------------------------------------------------------------------
# NEW: Duplicate Detection
# -----------------------------------------------------------------------
@router.get("/duplicates", response_model=DuplicateDetectionResponse)
def get_duplicates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    """Detect potential duplicate applications using exact + fuzzy matching."""
    return officer_analytics_service.detect_duplicates(db)


# -----------------------------------------------------------------------
# NEW: Smart Workload Recommendation
# -----------------------------------------------------------------------
@router.post(
    "/applications/{application_id:path}/recommend-assignment",
    response_model=RecommendAssignmentResponse,
)
def recommend_assignment(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    """AI-powered officer assignment recommendation based on workload."""
    return officer_analytics_service.recommend_assignment(db, application_id)
