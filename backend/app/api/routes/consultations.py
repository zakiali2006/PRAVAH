from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.api.deps import get_current_user_optional
from app.models.user import User
from app.models.consultation import PublicConsultation, ConsultationComment
from app.core.responses import success_response
from app.services.audit_service import audit_service

router = APIRouter()


def format_consultation(c: PublicConsultation) -> Dict[str, Any]:
    return {
        "id": c.code,
        "raw_id": c.id,
        "code": c.code,
        "projectTitle": c.project_title,
        "project_title": c.project_title,
        "applicantName": c.applicant_name,
        "applicant_name": c.applicant_name,
        "department": c.department,
        "eiaSummary": c.eia_summary,
        "eia_summary": c.eia_summary,
        "venue": c.venue,
        "location": c.location,
        "hearingDate": c.hearing_date,
        "hearing_date": c.hearing_date,
        "status": c.status,
        "commentsCount": len(c.comments) if c.comments else 0,
        "comments": [
            {
                "id": cm.id,
                "stakeholderName": cm.stakeholder_name,
                "comment": cm.comment,
                "createdAt": cm.created_at.strftime("%Y-%m-%d") if cm.created_at else "",
            }
            for cm in (c.comments or [])
        ],
    }


@router.get("", response_model=dict)
def list_consultations(db: Session = Depends(get_db)):
    """List all open environmental hearings and public consultation notices."""
    consultations = db.query(PublicConsultation).order_by(PublicConsultation.id.desc()).all()
    data = [format_consultation(c) for c in consultations]
    return success_response(data=data, message=f"{len(data)} consultations found")


@router.get("/{consultation_code}", response_model=dict)
def get_consultation(consultation_code: str, db: Session = Depends(get_db)):
    c = (
        db.query(PublicConsultation)
        .filter(
            (PublicConsultation.code == consultation_code)
            | (PublicConsultation.id == (int(consultation_code) if consultation_code.isdigit() else -1))
        )
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Consultation notice not found")
    return success_response(data=format_consultation(c))


@router.post("/{consultation_code}/comments", response_model=dict)
def add_comment(
    consultation_code: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Submit written citizen / industry representation for an EIA public hearing."""
    c = (
        db.query(PublicConsultation)
        .filter(
            (PublicConsultation.code == consultation_code)
            | (PublicConsultation.id == (int(consultation_code) if consultation_code.isdigit() else -1))
        )
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Consultation notice not found")

    comment_text = payload.get("comment") or payload.get("commentText")
    if not comment_text or not comment_text.strip():
        raise HTTPException(status_code=400, detail="Representation comment cannot be empty")

    stakeholder_name = (
        payload.get("stakeholderName")
        or payload.get("name")
        or (current_user.email if current_user else "Registered Stakeholder")
    )

    cm = ConsultationComment(
        consultation_id=c.id,
        user_id=current_user.id if current_user else None,
        stakeholder_name=stakeholder_name,
        comment=comment_text.strip(),
    )
    db.add(cm)
    db.commit()
    db.refresh(cm)

    if current_user:
        audit_service.log(
            db,
            actor_id=current_user.id,
            action="SUBMIT_CONSULTATION_COMMENT",
            entity_type="public_consultations",
            entity_id=c.code,
            after_data={"consultation_code": c.code, "comment_id": cm.id},
        )

    db.refresh(c)
    return success_response(
        data=format_consultation(c),
        message="Representation submitted successfully to MPCB Public Hearing Committee",
    )
