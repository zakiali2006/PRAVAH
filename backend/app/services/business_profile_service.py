from typing import Optional
from sqlalchemy.orm import Session
from app.models.business_profile import BusinessProfile
from app.schemas.business_profile import BusinessProfileCreate, BusinessProfileUpdate
from app.repositories.business_profile_repository import business_profile_repo
from app.core.exceptions import AppException
from app.services.audit_service import audit_service
from app.models.user import User


class BusinessProfileService:
    def get_by_user_id(self, db: Session, user_id: int) -> Optional[BusinessProfile]:
        return business_profile_repo.get_by_user_id(db, user_id)

    def create(
        self, db: Session, current_user: User, obj_in: BusinessProfileCreate
    ) -> BusinessProfile:
        existing = business_profile_repo.get_by_user_id(db, current_user.id)
        if existing:
            raise AppException(
                status_code=400,
                error_code="RESOURCE_ALREADY_EXISTS",
                message="A business profile already exists for this user.",
            )

        profile = business_profile_repo.create(
            db, user_id=current_user.id, obj_in=obj_in
        )

        audit_service.log(
            db=db,
            actor_id=current_user.id,
            action="CREATE_BUSINESS_PROFILE",
            entity_type="business_profile",
            entity_id=str(profile.id),
            after_data={"company_name": profile.company_name},
        )

        return profile

    def update(
        self, db: Session, current_user: User, obj_in: BusinessProfileUpdate
    ) -> BusinessProfile:
        profile = business_profile_repo.get_by_user_id(db, current_user.id)
        if not profile:
            raise AppException(
                status_code=404,
                error_code="RESOURCE_NOT_FOUND",
                message="Business profile not found.",
            )

        updated_profile = business_profile_repo.update(
            db, db_obj=profile, obj_in=obj_in
        )

        audit_service.log(
            db=db,
            actor_id=current_user.id,
            action="UPDATE_BUSINESS_PROFILE",
            entity_type="business_profile",
            entity_id=str(updated_profile.id),
            after_data={
                "fields_updated": list(obj_in.model_dump(exclude_unset=True).keys())
            },
        )

        return updated_profile


business_profile_service = BusinessProfileService()
