from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.caf import CAFForm, CAFService


class CAFRepository:
    def create(
        self, db: Session, user_id: int, wizard_run_id: Optional[int], data: dict
    ) -> CAFForm:
        caf = CAFForm(user_id=user_id, wizard_run_id=wizard_run_id, data=data)
        db.add(caf)
        db.commit()
        db.refresh(caf)
        return caf

    def add_service(self, db: Session, caf_form_id: int, service_id: int) -> CAFService:
        caf_svc = CAFService(caf_form_id=caf_form_id, service_id=service_id)
        db.add(caf_svc)
        db.commit()
        db.refresh(caf_svc)
        return caf_svc

    def get(self, db: Session, id: int) -> Optional[CAFForm]:
        return db.query(CAFForm).filter(CAFForm.id == id).first()

    def get_services(self, db: Session, caf_form_id: int) -> List[CAFService]:
        return db.query(CAFService).filter(CAFService.caf_form_id == caf_form_id).all()


caf_repo = CAFRepository()
