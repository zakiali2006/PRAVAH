from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.schemas.risk import RiskAssessmentResponse
from app.services.application_service import ApplicationService
from app.repositories.application_repo import application_repo
from typing import List

router = APIRouter()


@router.post("/", response_model=ApplicationResponse)
def create_application(
    application_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.create_application(db, application_in, current_user.id)


@router.get("/me", response_model=List[ApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return application_repo.get_by_user(db, current_user.id)


@router.post("/{application_id:path}/submit", response_model=ApplicationResponse)
def submit_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.submit_application(db, application_id, current_user.id)


@router.get("/{application_id:path}/track", response_model=ApplicationResponse)
def track_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = application_repo.get(db, id=application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.user_id != current_user.id and current_user.role.name != "OFFICER":
        raise HTTPException(
            status_code=403, detail="Not authorized to view this application"
        )

    return app


@router.get("/{application_id:path}/risk", response_model=RiskAssessmentResponse)
def get_my_application_risk(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = application_repo.get(db, id=application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    user_role = (
        getattr(current_user.role, "name", None) or str(current_user.role or "")
    ).upper()
    if app.user_id != current_user.id and user_role not in ["OFFICER", "SYSTEM_ADMIN"]:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view risk assessment for this application",
        )
    from app.services.risk_scoring_service import risk_scoring_service

    return risk_scoring_service.get_or_calculate_risk(db, application_id)


@router.get("/roadmap")
def get_clearance_roadmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Stub for Clearance Roadmap (Will connect to Niraja's Dependency Engine in Phase 2)
    return {
        "roadmap": [
            {"step": 1, "name": "Company Registration", "status": "completed"},
            {"step": 2, "name": "Fire NOC", "status": "pending", "dependency": []},
            {
                "step": 3,
                "name": "Water Connection",
                "status": "locked",
                "dependency": ["Fire NOC"],
            },
        ]
    }


@router.delete("/{application_id:path}")
def delete_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = application_repo.get(db, id=application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this application"
        )

    # Manually delete related data to avoid foreign key errors
    from app.models.document import ApplicationDocument

    db.query(ApplicationDocument).filter(
        ApplicationDocument.application_id == application_id
    ).delete()

    from app.models.stage import Stage

    db.query(Stage).filter(Stage.application_id == application_id).delete()

    from app.models.risk import ApplicationRiskScore

    db.query(ApplicationRiskScore).filter(
        ApplicationRiskScore.application_id == application_id
    ).delete()

    # Delete the application
    application_repo.delete(db, id=application_id)
    return {"message": "Application deleted successfully"}
