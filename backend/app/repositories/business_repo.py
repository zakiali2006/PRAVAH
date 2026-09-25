from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.business import BusinessProfile
from app.schemas.business import BusinessProfileCreate


class BusinessProfileRepository(BaseRepository[BusinessProfile]):
    def get_by_user(self, db: Session, user_id: int) -> BusinessProfile:
        return (
            db.query(BusinessProfile).filter(BusinessProfile.user_id == user_id).first()
        )


business_repo = BusinessProfileRepository(BusinessProfile)
