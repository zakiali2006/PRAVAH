from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.business import BusinessProfile, FactoryUnit
from app.schemas.business import BusinessProfileCreate


class BusinessProfileRepository(BaseRepository[BusinessProfile]):
    def get_by_user(self, db: Session, user_id: int) -> BusinessProfile:
        return (
            db.query(BusinessProfile).filter(BusinessProfile.user_id == user_id).first()
        )


class FactoryUnitRepository(BaseRepository[FactoryUnit]):
    def get_by_business(self, db: Session, business_id: int):
        return (
            db.query(FactoryUnit).filter(FactoryUnit.business_id == business_id).all()
        )


business_repo = BusinessProfileRepository(BusinessProfile)
factory_unit_repo = FactoryUnitRepository(FactoryUnit)
