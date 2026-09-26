from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.document import Document, ApplicationDocument
from app.api.deps import get_current_user, get_current_user_optional
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.schemas.risk import RiskAssessmentResponse
from app.services.application_service import ApplicationService
from app.repositories.application_repo import application_repo
from app.core.responses import success_response
from typing import List, Dict, Any

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


@router.get("/public-track/{application_id:path}")
def public_track_application(
    application_id: str,
    db: Session = Depends(get_db),
):
    """
    Public Application Status Tracker (Phase 16).
    Enables citizens and investors to track application milestones and statutory RTS Act limits.
    """
    app = application_repo.get(db, id=application_id)
    if not app:
        # Check without prefix or casing
        app = db.query(application_repo.model).filter(application_repo.model.id.ilike(f"%{application_id}%")).first()

    if not app:
        # Support common demo IDs
        all_apps = db.query(application_repo.model).order_by(application_repo.model.created_at.asc()).all()
        if all_apps:
            if application_id in ["APP-1001", "1", "APP-1"]:
                app = all_apps[0]
            elif application_id in ["APP-1002", "2", "APP-2"] and len(all_apps) > 1:
                app = all_apps[1]
            elif application_id in ["APP-1003", "3", "APP-3"] and len(all_apps) > 2:
                app = all_apps[2]

    if not app:
        raise HTTPException(status_code=404, detail="Application ID not found. Please verify reference format (e.g. APP/2026/XXXXXX)")

    stages_data = [
        {
            "id": s.id,
            "name": s.name,
            "desc": s.desc,
            "status": s.status,
            "statutoryLimit": s.statutory_limit or 15,
        }
        for s in app.stages
    ]

    return success_response(
        data={
            "id": app.id,
            "serviceName": app.service_name,
            "applicantName": app.applicant_name,
            "status": app.status,
            "submittedAt": app.submitted_at.strftime("%Y-%m-%d %H:%M") if app.submitted_at else "Not Submitted",
            "createdAt": app.created_at.strftime("%Y-%m-%d %H:%M") if app.created_at else "",
            "stages": stages_data,
        },
        message="Application tracking details retrieved",
    )


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
    user_role = (getattr(current_user.role, "name", None) or str(current_user.role or "")).upper()
    if app.user_id != current_user.id and user_role not in ["OFFICER", "SYSTEM_ADMIN", "POLICY_ADMIN"]:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this application"
        )

    return app


@router.post("/{application_id:path}/documents")
def link_document_to_application(
    application_id: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Link an uploaded document from the vault to this application (Phase 5)."""
    document_id = payload.get("document_id") or payload.get("documentId")
    if not document_id:
        raise HTTPException(status_code=400, detail="Document ID is required")

    app = application_repo.get(db, id=application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    doc = db.query(Document).filter(Document.id == document_id, Document.uploader_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found in user vault")

    # Check existing link
    existing = db.query(ApplicationDocument).filter(
        ApplicationDocument.application_id == application_id,
        ApplicationDocument.document_id == document_id,
    ).first()

    if not existing:
        link = ApplicationDocument(application_id=application_id, document_id=document_id)
        db.add(link)
        db.commit()

    return success_response(message="Document attached to application successfully")


@router.get("/{application_id:path}/documents")
def get_application_documents(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List documents attached to an application."""
    links = db.query(ApplicationDocument).filter(ApplicationDocument.application_id == application_id).all()
    docs = []
    for l in links:
        if l.document:
            docs.append({
                "id": l.document.id,
                "filename": l.document.filename,
                "originalName": l.document.original_name,
                "mimeType": l.document.mime_type,
                "sizeBytes": l.document.size_bytes,
                "status": l.document.status,
            })
    return success_response(data=docs)


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
