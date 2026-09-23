from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.application import Application
from app.models.stage import Stage
from app.schemas.application import ApplicationCreate


class ApplicationRepository:
    def get(self, db: Session, id: str) -> Optional[Application]:
        return db.query(Application).filter(Application.id == id).first()

    def get_multi_by_user(self, db: Session, user_id: int) -> List[Application]:
        return db.query(Application).filter(Application.user_id == user_id).all()

    def get_multi_all(self, db: Session) -> List[Application]:
        return db.query(Application).all()

    def create(
        self,
        db: Session,
        user_id: int,
        app_id: str,
        service_id: int,
        obj_in: ApplicationCreate,
    ) -> Application:
        db_obj = Application(
            id=app_id,
            user_id=user_id,
            business_profile_id=obj_in.business_profile_id,
            factory_unit_id=obj_in.factory_unit_id,
            service_id=service_id,
            applicant_name=obj_in.applicant_name,
            urgency=obj_in.urgency,
            ai_score=obj_in.ai_score,
            status=obj_in.status,
            is_draft=obj_in.is_draft,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_stages(self, db: Session, application_id: str) -> List[Stage]:
        return (
            db.query(Stage)
            .filter(Stage.application_id == application_id)
            .order_by(Stage.id.asc())
            .all()
        )

    def add_stage(self, db: Session, stage: Stage) -> Stage:
        db.add(stage)
        db.commit()
        db.refresh(stage)
        return stage


application_repo = ApplicationRepository()
