from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.wizard import WizardRun, WizardResult
from app.schemas.wizard import WizardRunCreate


class WizardRepository:
    def create_run(self, db: Session, user_id: int) -> WizardRun:
        run = WizardRun(user_id=user_id)
        db.add(run)
        db.commit()
        db.refresh(run)
        return run

    def create_result(
        self, db: Session, wizard_run_id: int, answers: dict
    ) -> WizardResult:
        result = WizardResult(wizard_run_id=wizard_run_id, answers=answers)
        db.add(result)
        db.commit()
        db.refresh(result)
        return result

    def get_run(self, db: Session, id: int) -> Optional[WizardRun]:
        return db.query(WizardRun).filter(WizardRun.id == id).first()

    def get_runs_by_user(self, db: Session, user_id: int) -> List[WizardRun]:
        return (
            db.query(WizardRun)
            .filter(WizardRun.user_id == user_id)
            .order_by(WizardRun.created_at.desc())
            .all()
        )


wizard_repo = WizardRepository()
