from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.business import (
    BusinessProfileCreate,
    BusinessProfileUpdate,
    BusinessProfileResponse,
    FactoryUnitCreate,
    FactoryUnitResponse,
)
from app.services.business_service import BusinessProfileService, FactoryUnitService

router = APIRouter()


@router.get("/me", response_model=BusinessProfileResponse)
def get_my_business_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = BusinessProfileService.get_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found")
    return profile


@router.post("/", response_model=BusinessProfileResponse)
def create_business_profile(
    profile_in: BusinessProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BusinessProfileService.create_profile(db, profile_in, current_user.id)


@router.put("/", response_model=BusinessProfileResponse)
def update_business_profile(
    profile_in: BusinessProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BusinessProfileService.update_profile(db, profile_in, current_user.id)


@router.get("/units", response_model=List[FactoryUnitResponse])
def get_factory_units(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return FactoryUnitService.get_units_by_user(db, current_user.id)


@router.post("/units", response_model=FactoryUnitResponse)
def create_factory_unit(
    unit_in: FactoryUnitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return FactoryUnitService.create_unit(db, unit_in, current_user.id)
