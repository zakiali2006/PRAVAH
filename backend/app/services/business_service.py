from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.business_repo import business_repo, factory_unit_repo
from app.schemas.business import (
    BusinessProfileCreate,
    BusinessProfileUpdate,
    FactoryUnitCreate,
)
from app.services.audit_service import audit_service


class BusinessProfileService:
    @staticmethod
    def get_profile(db: Session, user_id: int):
        return business_repo.get_by_user(db, user_id=user_id)

    @staticmethod
    def create_profile(db: Session, profile_in: BusinessProfileCreate, user_id: int):
        existing = business_repo.get_by_user(db, user_id=user_id)
        if existing:
            raise HTTPException(status_code=400, detail="Profile already exists")

        profile_data = profile_in.dict()
        profile_data["user_id"] = user_id
        profile = business_repo.create(db=db, obj_in=profile_data)

        audit_service.log(
            db,
            actor_id=user_id,
            action="CREATE_BUSINESS_PROFILE",
            entity_type="business_profiles",
            entity_id=str(profile.id),
        )
        return profile

    @staticmethod
    def update_profile(db: Session, profile_in: BusinessProfileUpdate, user_id: int):
        profile = business_repo.get_by_user(db, user_id=user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        profile = business_repo.update(
            db=db, db_obj=profile, obj_in=profile_in.dict(exclude_unset=True)
        )

        audit_service.log(
            db,
            actor_id=user_id,
            action="UPDATE_BUSINESS_PROFILE",
            entity_type="business_profiles",
            entity_id=str(profile.id),
        )
        return profile


class FactoryUnitService:
    @staticmethod
    def get_units_by_user(db: Session, user_id: int):
        profile = business_repo.get_by_user(db, user_id=user_id)
        if not profile:
            return []
        return factory_unit_repo.get_by_business(db, business_id=profile.id)

    @staticmethod
    def create_unit(db: Session, unit_in: FactoryUnitCreate, user_id: int):
        profile = business_repo.get_by_user(db, user_id=user_id)
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Business profile not found. Please setup profile first.",
            )

        unit_data = unit_in.dict()
        unit_data["business_id"] = profile.id
        unit = factory_unit_repo.create(db=db, obj_in=unit_data)

        audit_service.log(
            db,
            actor_id=user_id,
            action="CREATE_FACTORY_UNIT",
            entity_type="factory_units",
            entity_id=str(unit.id),
        )
        return unit
