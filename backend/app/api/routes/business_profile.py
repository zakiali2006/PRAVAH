from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.responses import success_response
from app.core.exceptions import AppException
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.business_profile import (
    BusinessProfileCreate,
    BusinessProfileUpdate,
    BusinessProfileOut,
)
from app.services.business_profile_service import business_profile_service

router = APIRouter()


@router.post("", response_model=Any)
def create_business_profile(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    profile_in: BusinessProfileCreate,
) -> Any:
    """
    Create a new business profile for the current user.
    """
    profile = business_profile_service.create(db, current_user, profile_in)
    return success_response(
        data=BusinessProfileOut.model_validate(profile).model_dump(),
        message="Business profile created successfully.",
    )


@router.get("", response_model=Any)
def get_business_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get the business profile for the current user.
    """
    profile = business_profile_service.get_by_user_id(db, current_user.id)
    if not profile:
        raise AppException(
            status_code=404,
            error_code="RESOURCE_NOT_FOUND",
            message="Business profile not found.",
        )
    return success_response(
        data=BusinessProfileOut.model_validate(profile).model_dump(),
        message="Business profile retrieved successfully.",
    )


@router.put("", response_model=Any)
def update_business_profile(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    profile_in: BusinessProfileUpdate,
) -> Any:
    """
    Update the business profile for the current user.
    """
    profile = business_profile_service.update(db, current_user, profile_in)
    return success_response(
        data=BusinessProfileOut.model_validate(profile).model_dump(),
        message="Business profile updated successfully.",
    )
