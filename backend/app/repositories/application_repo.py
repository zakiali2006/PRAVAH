from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.application import Application
from app.models.stage import Stage
from app.schemas.application import ApplicationCreate


class ApplicationRepository(BaseRepository[Application]):
    def get_by_user(self, db: Session, user_id: int) -> List[Application]:
        return (
            db.query(Application)
            .filter(Application.user_id == user_id)
            .order_by(Application.created_at.desc())
            .all()
        )

    def get_pending_for_officer(
        self, db: Session, officer_id: int
    ) -> List[Application]:
        return (
            db.query(Application)
            .filter(
                Application.status.in_(
                    [
                        "submitted",
                        "pending",
                        "scrutiny",
                        "final_approval",
                        "clarification",
                    ]
                )
            )
            .order_by(Application.created_at.desc(), Application.ai_score.desc())
            .all()
        )

    def add_stage(
        self,
        db: Session,
        application_id: str,
        name: str,
        desc: str = None,
        status: str = "pending",
    ) -> Stage:
        stage = Stage(
            application_id=application_id, name=name, desc=desc, status=status
        )
        db.add(stage)
        db.commit()
        db.refresh(stage)
        return stage

    def update_stage(
        self, db: Session, application_id: str, name: str, status: str, desc: str = None
    ) -> Optional[Stage]:
        stage = (
            db.query(Stage)
            .filter(Stage.application_id == application_id, Stage.name == name)
            .first()
        )
        if stage:
            stage.status = status
            if desc:
                stage.desc = desc
            db.commit()
            db.refresh(stage)
        return stage


application_repo = ApplicationRepository(Application)
