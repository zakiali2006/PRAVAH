from typing import List
from sqlalchemy.orm import Session
from app.models.wizard import WizardRun
from app.schemas.wizard import WizardRunCreate
from app.repositories.wizard_repository import wizard_repo
from app.core.exceptions import AppException


class WizardService:
    def create_run(
        self, db: Session, user_id: int, obj_in: WizardRunCreate
    ) -> WizardRun:
        run = wizard_repo.create_run(db, user_id=user_id)
        wizard_repo.create_result(
            db, wizard_run_id=run.id, answers=obj_in.answers.model_dump()
        )
        db.refresh(run)
        return run

    def get_runs(self, db: Session, user_id: int) -> List[WizardRun]:
        return wizard_repo.get_runs_by_user(db, user_id)

    def get_run(self, db: Session, user_id: int, run_id: int) -> WizardRun:
        run = wizard_repo.get_run(db, run_id)
        if not run:
            raise AppException(
                status_code=404,
                error_code="RESOURCE_NOT_FOUND",
                message="Wizard run not found",
            )
        if run.user_id != user_id:
            raise AppException(
                status_code=403,
                error_code="FORBIDDEN",
                message="Cannot access this wizard run",
            )
        return run


wizard_service = WizardService()
