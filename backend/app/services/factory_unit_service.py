from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.factory_unit import FactoryUnit
from app.models.user import User
from app.schemas.factory_unit import FactoryUnitCreate, FactoryUnitUpdate
from app.repositories.factory_unit_repository import factory_unit_repo
from app.core.exceptions import AppException
from app.services.audit_service import audit_service


class FactoryUnitService:
    def get(self, db: Session, current_user: User, id: int) -> FactoryUnit:
        unit = factory_unit_repo.get(db, id=id, user_id=current_user.id)
        if not unit:
            raise AppException(
                status_code=404,
                error_code="RESOURCE_NOT_FOUND",
                message="Factory unit not found or access forbidden.",
            )
        return unit

    def get_multi(self, db: Session, current_user: User) -> List[FactoryUnit]:
        return factory_unit_repo.get_multi(db, user_id=current_user.id)

    def create(
        self, db: Session, current_user: User, obj_in: FactoryUnitCreate
    ) -> FactoryUnit:
        # Additional check could be to verify business_profile_id belongs to the user,
        # assuming it's already properly enforced or the DB constraints will catch mismatched profiles.
        unit = factory_unit_repo.create(db, user_id=current_user.id, obj_in=obj_in)

        audit_service.log(
            db=db,
            actor_id=current_user.id,
            action="CREATE_FACTORY_UNIT",
            entity_type="factory_unit",
            entity_id=str(unit.id),
            after_data={"unit_name": unit.unit_name, "category": unit.category},
        )
        return unit

    def update(
        self, db: Session, current_user: User, id: int, obj_in: FactoryUnitUpdate
    ) -> FactoryUnit:
        unit = self.get(db, current_user, id)
        updated_unit = factory_unit_repo.update(db, db_obj=unit, obj_in=obj_in)

        audit_service.log(
            db=db,
            actor_id=current_user.id,
            action="UPDATE_FACTORY_UNIT",
            entity_type="factory_unit",
            entity_id=str(updated_unit.id),
            after_data={
                "fields_updated": list(obj_in.model_dump(exclude_unset=True).keys())
            },
        )
        return updated_unit

    def soft_delete(self, db: Session, current_user: User, id: int) -> None:
        unit = self.get(db, current_user, id)
        factory_unit_repo.soft_delete(db, db_obj=unit)

        audit_service.log(
            db=db,
            actor_id=current_user.id,
            action="DELETE_FACTORY_UNIT",
            entity_type="factory_unit",
            entity_id=str(unit.id),
            after_data={"is_deleted": True},
        )


factory_unit_service = FactoryUnitService()
