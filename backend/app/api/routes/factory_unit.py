from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.responses import success_response
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.factory_unit import (
    FactoryUnitCreate,
    FactoryUnitUpdate,
    FactoryUnitOut,
)
from app.services.factory_unit_service import factory_unit_service

router = APIRouter()


@router.post("", response_model=Any)
def create_factory_unit(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    unit_in: FactoryUnitCreate,
) -> Any:
    """
    Create a new factory unit for the current user.
    """
    unit = factory_unit_service.create(db, current_user, unit_in)
    return success_response(
        data=FactoryUnitOut.model_validate(unit).model_dump(),
        message="Factory unit created successfully.",
    )


@router.get("", response_model=Any)
def list_factory_units(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all factory units for the current user.
    """
    units = factory_unit_service.get_multi(db, current_user)
    return success_response(
        data=[FactoryUnitOut.model_validate(u).model_dump() for u in units],
        message="Factory units retrieved successfully.",
    )


@router.get("/{id}", response_model=Any)
def get_factory_unit(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific factory unit.
    """
    unit = factory_unit_service.get(db, current_user, id)
    return success_response(
        data=FactoryUnitOut.model_validate(unit).model_dump(),
        message="Factory unit retrieved successfully.",
    )


@router.put("/{id}", response_model=Any)
def update_factory_unit(
    *,
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    unit_in: FactoryUnitUpdate,
) -> Any:
    """
    Update a specific factory unit.
    """
    unit = factory_unit_service.update(db, current_user, id, unit_in)
    return success_response(
        data=FactoryUnitOut.model_validate(unit).model_dump(),
        message="Factory unit updated successfully.",
    )


@router.delete("/{id}", response_model=Any)
def delete_factory_unit(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Soft delete a specific factory unit.
    """
    factory_unit_service.soft_delete(db, current_user, id)
    return success_response(data={}, message="Factory unit deleted successfully.")
