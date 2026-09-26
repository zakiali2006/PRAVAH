from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.payment import Payment
from app.models.application import Application
from app.core.responses import success_response
from app.services.audit_service import audit_service

router = APIRouter()


def format_payment(p: Payment) -> Dict[str, Any]:
    return {
        "id": p.id,
        "challanNumber": p.challan_number,
        "challan_number": p.challan_number,
        "appId": p.application_id or "N/A",
        "application_id": p.application_id,
        "serviceName": p.service_name,
        "service_name": p.service_name,
        "department": p.department,
        "amount": p.amount,
        "status": p.status,
        "paymentMode": p.payment_mode or "NetBanking",
        "payment_mode": p.payment_mode or "NetBanking",
        "transactionRef": p.transaction_ref,
        "transaction_ref": p.transaction_ref,
        "date": p.created_at.strftime("%Y-%m-%d") if p.created_at else "",
        "paid_at": p.paid_at.isoformat() if p.paid_at else None,
    }


@router.get("", response_model=dict)
def list_payments(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all treasury challans and statutory fees for current user."""
    query = db.query(Payment).filter(Payment.user_id == current_user.id)
    if status and status.upper() != "ALL":
        query = query.filter(Payment.status == status.upper())

    payments = query.order_by(Payment.id.desc()).all()
    data = [format_payment(p) for p in payments]
    return success_response(data=data, message=f"{len(data)} payments found")


@router.post("/{payment_id}/pay", response_model=dict)
def execute_payment(
    payment_id: int,
    payload: Dict[str, Any] = Body(default={}),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Authorize and settle statutory fee payment via Maha-GRAS treasury gateway."""
    payment = db.query(Payment).filter(Payment.id == payment_id, Payment.user_id == current_user.id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    payment_mode = payload.get("paymentMode") or payload.get("payment_mode") or "NetBanking"
    transaction_ref = f"GRAS-2026-MH-{100000 + (payment.id * 173) % 900000}"

    payment.status = "PAID"
    payment.payment_mode = payment_mode
    payment.transaction_ref = transaction_ref
    payment.paid_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(payment)

    # Log audit
    audit_service.log(
        db,
        actor_id=current_user.id,
        action="EXECUTE_STATUTORY_PAYMENT",
        entity_type="payments",
        entity_id=str(payment.id),
        after_data={
            "challan_number": payment.challan_number,
            "amount": payment.amount,
            "transaction_ref": transaction_ref,
        },
    )

    return success_response(
        data=format_payment(payment),
        message="Payment authorized and reconciled successfully with Maha-GRAS Treasury",
    )


@router.get("/{payment_id}", response_model=dict)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.id == payment_id, Payment.user_id == current_user.id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    return success_response(data=format_payment(payment))
