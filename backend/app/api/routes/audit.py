from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.responses import success_response
from app.api.deps import get_current_user
from app.models.audit import AuditLog
from app.models.user import User

router = APIRouter()


@router.get("/")
def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve tamper-evident audit logs under Maharashtra Right to Services (RTS) Act.
    Investors see their personal account and application audit trail.
    Officers and Admins see full system and workflow logs.
    """
    stmt = select(AuditLog).order_by(desc(AuditLog.created_at))

    user_role = (getattr(current_user.role, "name", None) or str(current_user.role or "")).upper()
    if user_role not in ["SYSTEM_ADMIN", "POLICY_ADMIN", "OFFICER"]:
        stmt = stmt.where(AuditLog.actor_id == current_user.id)

    if action:
        stmt = stmt.where(AuditLog.action.ilike(f"%{action}%"))
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type.ilike(f"%{entity_type}%"))

    stmt = stmt.offset(skip).limit(limit)
    logs = db.execute(stmt).scalars().all()

    data = [
        {
            "id": f"LOG-MH-{log.id:06d}",
            "raw_id": log.id,
            "actor_id": log.actor_id,
            "actor": current_user.email if log.actor_id == current_user.id else f"User #{log.actor_id}",
            "role": user_role,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": f"{log.action.replace('_', ' ').title()} on {log.entity_type} ({log.entity_id})",
            "before_data": log.before_data,
            "after_data": log.after_data,
            "ipAddress": log.ip_address or "127.0.0.1 (Localhost Node)",
            "timestamp": log.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if log.created_at else "",
        }
        for log in logs
    ]

    return success_response(data=data, message="Audit logs retrieved")
