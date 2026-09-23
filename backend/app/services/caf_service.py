from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.caf import CAFForm, CAFService
from app.schemas.caf import CAFFormCreate
from app.repositories.caf_repository import caf_repo
from app.repositories.wizard_repository import wizard_repo
from app.core.exceptions import AppException


class CAFService:
    def create(self, db: Session, user_id: int, obj_in: CAFFormCreate) -> CAFForm:
        caf = caf_repo.create(db, user_id=user_id, wizard_run_id=None, data=obj_in.data)
        for service_id in obj_in.service_ids:
            caf_repo.add_service(db, caf_form_id=caf.id, service_id=service_id)
        db.refresh(caf)
        return caf

    def generate_caf(self, db: Session, user_id: int, wizard_run_id: int) -> CAFForm:
        wizard_run = wizard_repo.get_run(db, wizard_run_id)
        if not wizard_run:
            raise AppException(
                status_code=404,
                error_code="RESOURCE_NOT_FOUND",
                message="Wizard run not found",
            )

        if wizard_run.user_id != user_id:
            raise AppException(
                status_code=403,
                error_code="FORBIDDEN",
                message="Cannot access this wizard run",
            )

        # Map wizard results to CAF form data
        data = {}
        if wizard_run.results:
            result = wizard_run.results[0]
            data = result.answers

        caf = caf_repo.create(
            db, user_id=user_id, wizard_run_id=wizard_run_id, data=data
        )

        # Call extension hook for AI auto-fill
        self.caf_autofill_hook(caf.id)

        return caf

    def caf_autofill_hook(self, caf_id: int):
        # Stub for Niraja's AI auto-fill engine
        pass

    def get(self, db: Session, user_id: int, caf_id: int) -> CAFForm:
        caf = caf_repo.get(db, caf_id)
        if not caf:
            raise AppException(
                status_code=404,
                error_code="RESOURCE_NOT_FOUND",
                message="CAF not found",
            )
        if caf.user_id != user_id:
            raise AppException(
                status_code=403,
                error_code="FORBIDDEN",
                message="Cannot access this CAF",
            )
        return caf

    def get_services(self, db: Session, user_id: int, caf_id: int) -> List[CAFService]:
        self.get(db, user_id, caf_id)  # Verify ownership
        return caf_repo.get_services(db, caf_id)


caf_service = CAFService()
