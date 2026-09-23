from typing import Optional
from sqlalchemy.orm import Session
from app.models.business_profile import BusinessProfile
from app.schemas.business_profile import BusinessProfileCreate, BusinessProfileUpdate


class BusinessProfileRepository:
    def get_by_user_id(self, db: Session, user_id: int) -> Optional[BusinessProfile]:
        return (
            db.query(BusinessProfile).filter(BusinessProfile.user_id == user_id).first()
        )

    def create(
        self, db: Session, user_id: int, obj_in: BusinessProfileCreate
    ) -> BusinessProfile:
        db_obj = BusinessProfile(user_id=user_id, **obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, db_obj: BusinessProfile, obj_in: BusinessProfileUpdate
    ) -> BusinessProfile:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


business_profile_repo = BusinessProfileRepository()
