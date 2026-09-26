from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.api.deps import get_current_user_optional, get_current_user
from app.models.user import User
from app.models.feedback import Feedback
from app.core.responses import success_response
from app.services.audit_service import audit_service

router = APIRouter()


def format_feedback(f: Feedback) -> Dict[str, Any]:
    return {
        "id": f.id,
        "applicantName": f.applicant_name,
        "serviceName": f.service_name,
        "service_name": f.service_name,
        "department": f.department,
        "rating": f.rating,
        "category": f.category,
        "comment": f.comment,
        "createdAt": f.created_at.strftime("%Y-%m-%d") if f.created_at else "",
    }


@router.get("", response_model=dict)
def list_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List submitted feedback entries for the current user."""
    feedbacks = db.query(Feedback).filter(Feedback.user_id == current_user.id).order_by(Feedback.id.desc()).all()
    data = [format_feedback(f) for f in feedbacks]
    return success_response(data=data, message=f"{len(data)} feedback records found")


@router.post("", response_model=dict)
def submit_feedback(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Submit rating and qualitative feedback for a service or department."""
    service_name = payload.get("serviceName") or payload.get("service_name") or "MAITRI Single Window Services"
    department = payload.get("department") or "Industries Department"
    rating = int(payload.get("rating", 5))
    category = payload.get("category", "Overall Experience")
    comment = payload.get("comment", "")
    applicant_name = payload.get("applicantName") or (current_user.email if current_user else "Anonymous Citizen")

    if not 1 <= rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5 stars")

    fb = Feedback(
        user_id=current_user.id if current_user else None,
        applicant_name=applicant_name,
        service_name=service_name,
        department=department,
        rating=rating,
        category=category,
        comment=comment,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)

    if current_user:
        audit_service.log(
            db,
            actor_id=current_user.id,
            action="SUBMIT_FEEDBACK",
            entity_type="feedbacks",
            entity_id=str(fb.id),
            after_data={"rating": rating, "department": department},
        )

    return success_response(data=format_feedback(fb), message="Feedback recorded successfully. Thank you for your review!")
