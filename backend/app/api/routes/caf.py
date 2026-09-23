from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.responses import success_response
from app.models.user import User
from app.schemas.caf import CAFFormCreate, CAFFormOut, CAFServiceOut
from app.services.caf_service import caf_service

router = APIRouter()


@router.post("", response_model=Any)
def create_caf(
    obj_in: CAFFormCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    caf = caf_service.create(db, user_id=current_user.id, obj_in=obj_in)
    return success_response(
        data=CAFFormOut.model_validate(caf).model_dump(),
        message="CAF created successfully.",
    )


@router.get("/{id}", response_model=Any)
def get_caf(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    caf = caf_service.get(db, user_id=current_user.id, caf_id=id)
    return success_response(
        data=CAFFormOut.model_validate(caf).model_dump(),
        message="CAF retrieved successfully.",
    )


@router.get("/{id}/services", response_model=Any)
def get_caf_services(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    services = caf_service.get_services(db, user_id=current_user.id, caf_id=id)
    return success_response(
        data=[CAFServiceOut.model_validate(s).model_dump() for s in services],
        message="CAF services retrieved successfully.",
    )
