from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.factory_unit import FactoryUnit, MIDCPlot
from app.schemas.factory_unit import FactoryUnitCreate, FactoryUnitUpdate


class FactoryUnitRepository:
    def get(self, db: Session, id: int, user_id: int) -> Optional[FactoryUnit]:
        return (
            db.query(FactoryUnit)
            .filter(
                FactoryUnit.id == id,
                FactoryUnit.user_id == user_id,
                FactoryUnit.is_deleted.is_(False),
            )
            .first()
        )

    def get_multi(self, db: Session, user_id: int) -> List[FactoryUnit]:
        return (
            db.query(FactoryUnit)
            .filter(FactoryUnit.user_id == user_id, FactoryUnit.is_deleted.is_(False))
            .all()
        )

    def create(
        self, db: Session, user_id: int, obj_in: FactoryUnitCreate
    ) -> FactoryUnit:
        # Separate midc_plot from factory unit data
        create_data = obj_in.model_dump(exclude={"midc_plot"})
        db_obj = FactoryUnit(user_id=user_id, **create_data)

        db.add(db_obj)
        db.flush()  # To get db_obj.id

        if obj_in.midc_plot:
            db_midc_plot = MIDCPlot(
                factory_unit_id=db_obj.id, **obj_in.midc_plot.model_dump()
            )
            db.add(db_midc_plot)

        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, db_obj: FactoryUnit, obj_in: FactoryUnitUpdate
    ) -> FactoryUnit:
        update_data = obj_in.model_dump(exclude_unset=True, exclude={"midc_plot"})

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        if obj_in.midc_plot is not None:
            if db_obj.midc_plot:
                plot_update_data = obj_in.midc_plot.model_dump(exclude_unset=True)
                for field, value in plot_update_data.items():
                    setattr(db_obj.midc_plot, field, value)
            else:
                db_midc_plot = MIDCPlot(
                    factory_unit_id=db_obj.id, **obj_in.midc_plot.model_dump()
                )
                db.add(db_midc_plot)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def soft_delete(self, db: Session, db_obj: FactoryUnit) -> FactoryUnit:
        db_obj.is_deleted = True
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


factory_unit_repo = FactoryUnitRepository()
