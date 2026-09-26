from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.delegation import UserDelegation
from app.core.responses import success_response
from app.services.audit_service import audit_service

router = APIRouter()


def format_delegation(d: UserDelegation) -> Dict[str, Any]:
    return {
        "id": d.id,
        "delegateEmail": d.delegate_email,
        "delegate_email": d.delegate_email,
        "delegateName": d.delegate_name,
        "delegate_name": d.delegate_name,
        "role": d.role,
        "permissions": d.permissions or [],
        "isActive": d.is_active,
        "is_active": d.is_active,
        "createdAt": d.created_at.strftime("%Y-%m-%d") if d.created_at else "",
    }


@router.get("", response_model=dict)
def list_delegations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all corporate transactional delegations authorized by current investor."""
    delegations = db.query(UserDelegation).filter(UserDelegation.owner_user_id == current_user.id).all()
    data = [format_delegation(d) for d in delegations]
    return success_response(data=data, message=f"{len(data)} delegations found")


@router.post("", response_model=dict)
def create_delegation(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delegate authority to an operations executive, consultant, or finance agent."""
    delegate_email = payload.get("delegateEmail") or payload.get("delegate_email")
    delegate_name = payload.get("delegateName") or payload.get("delegate_name")
    role = payload.get("role", "TRANSACTIONAL_USER")
    permissions = payload.get("permissions", ["applications.read", "documents.upload"])

    if not delegate_email or not delegate_name:
        raise HTTPException(status_code=400, detail="Delegate name and email are required")

    # Check if target user already exists in users table
    delegate_user = db.query(User).filter(User.email == delegate_email).first()

    delegation = UserDelegation(
        owner_user_id=current_user.id,
        delegate_user_id=delegate_user.id if delegate_user else None,
        delegate_email=delegate_email,
        delegate_name=delegate_name,
        role=role,
        permissions=permissions,
        is_active=True,
    )
    db.add(delegation)
    db.commit()
    db.refresh(delegation)

    audit_service.log(
        db,
        actor_id=current_user.id,
        action="GRANT_USER_DELEGATION",
        entity_type="user_delegations",
        entity_id=str(delegation.id),
        after_data={"delegate_email": delegate_email, "role": role},
    )

    return success_response(data=format_delegation(delegation), message="Authority delegated successfully")


@router.delete("/{delegation_id}", response_model=dict)
def revoke_delegation(
    delegation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delegation = (
        db.query(UserDelegation)
        .filter(UserDelegation.id == delegation_id, UserDelegation.owner_user_id == current_user.id)
        .first()
    )
    if not delegation:
        raise HTTPException(status_code=404, detail="Delegation record not found")

    db.delete(delegation)
    db.commit()

    audit_service.log(
        db,
        actor_id=current_user.id,
        action="REVOKE_USER_DELEGATION",
        entity_type="user_delegations",
        entity_id=str(delegation_id),
    )

    return success_response(message="Delegation revoked successfully")
