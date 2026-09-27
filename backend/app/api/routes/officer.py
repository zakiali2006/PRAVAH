from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user, RoleChecker
from app.schemas.application import ApplicationStatusUpdate, ApplicationResponse
from app.schemas.risk import RiskAssessmentResponse
from app.services.application_service import ApplicationService
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


@router.get("/documents", response_model=List[dict])
def get_officer_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    from app.models.document import Document

    docs = db.query(Document).all()  # For demo, return all docs
    # Or docs that are tied to applications for this officer, but for demo this is fine
    from app.schemas.document import DocumentOut

    return [DocumentOut.model_validate(d).model_dump() for d in docs]


@router.get("/duplicates")
def get_duplicate_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    from app.models.application import Application
    from app.models.business import BusinessProfile

    apps = db.query(Application).filter(Application.status != "draft").all()

    alerts = []
    seen_user_service = {}
    seen_pan_service = {}

    for app in apps:
        business = None
        if app.business_id:
            business = (
                db.query(BusinessProfile)
                .filter(BusinessProfile.id == app.business_id)
                .first()
            )

        key_user_svc = (app.user_id, app.service_name)
        if key_user_svc in seen_user_service:
            prev_app = seen_user_service[key_user_svc]
            prev_biz = None
            if prev_app.business_id:
                prev_biz = (
                    db.query(BusinessProfile)
                    .filter(BusinessProfile.id == prev_app.business_id)
                    .first()
                )

            alert_id = f"DUP-{app.id[-4:]}"
            alerts.append(
                {
                    "id": alert_id.replace("/", ""),
                    "type": "exact_user_service",
                    "match_score": 100,
                    "app1_id": prev_app.id,
                    "app2_id": app.id,
                    "date": (
                        app.created_at.strftime("%m/%d/%Y") if app.created_at else ""
                    ),
                    "app1_details": {
                        "applicant_name": prev_app.applicant_name,
                        "entity_name": (
                            prev_biz.company_name if prev_biz else "Unknown Entity"
                        ),
                        "pan": prev_biz.pan_number if prev_biz else "...",
                        "address": prev_biz.address if prev_biz else "...",
                    },
                    "app2_details": {
                        "applicant_name": app.applicant_name,
                        "entity_name": (
                            business.company_name if business else "Unknown Entity"
                        ),
                        "pan": business.pan_number if business else "...",
                        "address": business.address if business else "...",
                    },
                }
            )
        else:
            seen_user_service[key_user_svc] = app

        if business and business.pan_number:
            key_pan_svc = (business.pan_number, app.service_name)
            if key_pan_svc in seen_pan_service:
                prev_app = seen_pan_service[key_pan_svc]
                if prev_app.id != app.id and prev_app.user_id != app.user_id:
                    prev_biz = (
                        db.query(BusinessProfile)
                        .filter(BusinessProfile.id == prev_app.business_id)
                        .first()
                    )
                    alert_id = f"DUP-{app.id[-4:]}P"
                    alerts.append(
                        {
                            "id": alert_id.replace("/", ""),
                            "type": "pan_match_different_user",
                            "match_score": 95,
                            "app1_id": prev_app.id,
                            "app2_id": app.id,
                            "date": (
                                app.created_at.strftime("%m/%d/%Y")
                                if app.created_at
                                else ""
                            ),
                            "app1_details": {
                                "applicant_name": prev_app.applicant_name,
                                "entity_name": (
                                    prev_biz.company_name
                                    if prev_biz
                                    else "Unknown Entity"
                                ),
                                "pan": prev_biz.pan_number if prev_biz else "...",
                                "address": prev_biz.address if prev_biz else "...",
                            },
                            "app2_details": {
                                "applicant_name": app.applicant_name,
                                "entity_name": (
                                    business.company_name
                                    if business
                                    else "Unknown Entity"
                                ),
                                "pan": business.pan_number if business else "...",
                                "address": business.address if business else "...",
                            },
                        }
                    )
            else:
                seen_pan_service[key_pan_svc] = app

    return alerts


from pydantic import BaseModel


class ResolveDuplicateRequest(BaseModel):
    action: str


@router.post("/duplicates/{alert_id}/resolve")
def resolve_duplicate_alert(
    alert_id: str,
    req: ResolveDuplicateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    # In a real app, update the database alert status.
    # We'll just return success for the demo.
    return {"status": "success", "action": req.action, "alert_id": alert_id}


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
