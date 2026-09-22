from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.responses import success_response
from app.api.deps import RoleChecker
from app.models.audit import AuditLog

router = APIRouter()


@router.get("/")
def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    current_user=Depends(RoleChecker(["POLICY_ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Retrieve audit logs.
    Restricted to POLICY_ADMIN.
    """
    stmt = select(AuditLog).order_by(desc(AuditLog.created_at))

    if action:
        stmt = stmt.where(AuditLog.action == action)
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type == entity_type)

    stmt = stmt.offset(skip).limit(limit)
    logs = db.execute(stmt).scalars().all()

    # We dump to dicts since we don't have a Pydantic schema for AuditLog yet
    data = [
        {
            "id": log.id,
            "actor_id": log.actor_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "before_data": log.before_data,
            "after_data": log.after_data,
            "ip_address": log.ip_address,
            "timestamp": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]

    return success_response(data=data, message="Audit logs retrieved")
