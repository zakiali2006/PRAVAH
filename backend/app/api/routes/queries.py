from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.query import DepartmentQuery
from app.models.application import Application
from app.core.responses import success_response
from app.services.audit_service import audit_service

router = APIRouter()


def format_query(q: DepartmentQuery) -> Dict[str, Any]:
    return {
        "id": q.query_id,
        "query_id": q.query_id,
        "raw_id": q.id,
        "appId": q.application_id,
        "application_id": q.application_id,
        "appName": getattr(q.application, "service_name", "Statutory Clearance"),
        "department": q.department,
        "officerName": q.officer_name,
        "officer_name": q.officer_name,
        "querySubject": q.query_subject,
        "query_subject": q.query_subject,
        "queryDetail": q.query_detail,
        "query_detail": q.query_detail,
        "status": q.status,
        "queryDate": q.created_at.strftime("%Y-%m-%d") if q.created_at else "",
        "applicantResponse": q.applicant_reply,
        "applicant_reply": q.applicant_reply,
        "responseDate": q.replied_at.strftime("%Y-%m-%d") if q.replied_at else None,
    }


@router.get("", response_model=dict)
def list_queries(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all official scrutiny queries and clarification requests."""
    query = db.query(DepartmentQuery).filter(DepartmentQuery.user_id == current_user.id)
    if status:
        query = query.filter(DepartmentQuery.status == status)

    queries = query.order_by(DepartmentQuery.id.desc()).all()
    data = [format_query(q) for q in queries]
    return success_response(data=data, message=f"{len(data)} queries found")


@router.post("/{query_id}/reply", response_model=dict)
def reply_to_query(
    query_id: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit applicant clarification / proof in response to official query."""
    # Find either by query_id ("QRY-2026-004") or integer ID
    q = (
        db.query(DepartmentQuery)
        .filter(
            (DepartmentQuery.query_id == query_id) | (DepartmentQuery.id == (int(query_id) if query_id.isdigit() else -1)),
            DepartmentQuery.user_id == current_user.id,
        )
        .first()
    )
    if not q:
        raise HTTPException(status_code=404, detail="Query record not found")

    reply_text = (
        payload.get("reply")
        or payload.get("applicantReply")
        or payload.get("applicantResponse")
        or payload.get("applicant_reply")
    )
    if not reply_text:
        raise HTTPException(status_code=400, detail="Clarification text is required")

    q.applicant_reply = reply_text
    q.status = "replied"
    q.replied_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(q)

    # Log audit
    audit_service.log(
        db,
        actor_id=current_user.id,
        action="SUBMIT_QUERY_CLARIFICATION",
        entity_type="department_queries",
        entity_id=q.query_id,
        after_data={"query_id": q.query_id, "application_id": q.application_id},
    )

    return success_response(data=format_query(q), message="Clarification submitted successfully to reviewing department")
