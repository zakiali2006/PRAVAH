from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.responses import success_response
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationOut,
    DocumentUpload,
    StageOut,
)
from app.schemas.payment import PaymentCreate, PaymentOut
from app.services.application_service import application_service

router = APIRouter()


@router.post("/services/{id}/apply", response_model=Any)
def apply_service(
    id: int,
    obj_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    application = application_service.apply(
        db, user_id=current_user.id, service_id=id, obj_in=obj_in
    )
    return success_response(
        data=ApplicationOut.model_validate(application).model_dump(),
        message="Application submitted successfully as draft.",
    )


@router.get("/applications", response_model=Any)
def get_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    applications = application_service.get_multi(
        db, user_id=current_user.id, role=current_user.role
    )
    return success_response(
        data=[ApplicationOut.model_validate(a).model_dump() for a in applications],
        message="Applications retrieved successfully.",
    )


@router.get("/applications/{id}", response_model=Any)
def get_application(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    application = application_service.get(
        db, user_id=current_user.id, role=current_user.role, application_id=id
    )
    return success_response(
        data=ApplicationOut.model_validate(application).model_dump(),
        message="Application retrieved successfully.",
    )


@router.get("/applications/{id}/track", response_model=Any)
def track_application(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    stages = application_service.track(
        db, user_id=current_user.id, role=current_user.role, application_id=id
    )
    return success_response(
        data=[StageOut.model_validate(s).model_dump() for s in stages],
        message="Application tracking stages retrieved successfully.",
    )


@router.post("/applications/{id}/documents", response_model=Any)
def link_documents(
    id: str,
    documents: List[DocumentUpload],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    doc_ids = [d.document_id for d in documents]
    application_service.link_documents(
        db, user_id=current_user.id, application_id=id, document_ids=doc_ids
    )
    return success_response(message="Documents linked successfully.")


@router.post("/applications/{id}/pay", response_model=Any)
def pay_application(
    id: str,
    obj_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    payment = application_service.pay(
        db, user_id=current_user.id, application_id=id, obj_in=obj_in
    )
    return success_response(
        data=PaymentOut.model_validate(payment).model_dump(),
        message="Payment processed successfully.",
    )
