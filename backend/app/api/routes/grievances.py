from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import uuid
import random

from app.core.database import get_db
from app.api.deps import get_current_user_optional, get_current_user
from app.models.user import User
from app.models.grievance import Grievance
from app.core.responses import success_response
from app.services.audit_service import audit_service

router = APIRouter()


def format_grievance(g: Grievance) -> Dict[str, Any]:
    return {
        "id": g.id,
        "ticketId": g.ticket_id,
        "ticket_id": g.ticket_id,
        "name": g.name,
        "email": g.email,
        "phone": g.phone,
        "department": g.department,
        "appId": g.application_id,
        "application_id": g.application_id,
        "issueType": g.issue_type,
        "issue_type": g.issue_type,
        "detail": g.detail,
        "status": g.status,
        "resolutionNotes": g.resolution_notes,
        "resolution_notes": g.resolution_notes,
        "createdAt": g.created_at.strftime("%Y-%m-%d %H:%M") if g.created_at else "",
    }


@router.get("", response_model=dict)
def list_grievances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List grievances filed by the current investor."""
    grievances = (
        db.query(Grievance)
        .filter((Grievance.user_id == current_user.id) | (Grievance.email == current_user.email))
        .order_by(Grievance.id.desc())
        .all()
    )
    data = [format_grievance(g) for g in grievances]
    return success_response(data=data, message=f"{len(data)} grievances found")


@router.post("", response_model=dict)
def submit_grievance(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Register a statutory RTS grievance against department delays or disputes."""
    name = payload.get("name")
    email = payload.get("email")
    dept = payload.get("dept") or payload.get("department")
    detail = payload.get("detail") or payload.get("issue")
    app_id = payload.get("appId") or payload.get("application_id")
    phone = payload.get("phone")
    issue_type = payload.get("issueType") or payload.get("issue_type") or "Timeline Delay Past RTS Limit"

    if not name or not email or not dept or not detail:
        raise HTTPException(status_code=400, detail="Name, email, department, and detail are required")

    random_digits = random.randint(10000, 99999)
    ticket_id = f"MTR/GRV/2026/{random_digits}"

    grievance = Grievance(
        ticket_id=ticket_id,
        user_id=current_user.id if current_user else None,
        name=name,
        email=email,
        phone=phone,
        department=dept,
        application_id=app_id,
        issue_type=issue_type,
        detail=detail,
        status="Open",
    )
    db.add(grievance)
    db.commit()
    db.refresh(grievance)

    if current_user:
        audit_service.log(
            db,
            actor_id=current_user.id,
            action="SUBMIT_GRIEVANCE",
            entity_type="grievances",
            entity_id=ticket_id,
            after_data={"department": dept, "ticket_id": ticket_id},
        )

    return success_response(
        data=format_grievance(grievance),
        message=f"Grievance registered successfully with reference {ticket_id}",
    )


@router.get("/track/{ticket_id}", response_model=dict)
def track_grievance(ticket_id: str, db: Session = Depends(get_db)):
    """Public or authenticated grievance status lookup."""
    g = db.query(Grievance).filter(Grievance.ticket_id == ticket_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance reference not found")
    return success_response(data=format_grievance(g))
