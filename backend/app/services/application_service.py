import random
from typing import List
from sqlalchemy.orm import Session
from app.models.application import Application
from app.models.stage import Stage
from app.models.payment import Payment
from app.models.document import ApplicationDocument
from app.schemas.application import ApplicationCreate
from app.schemas.payment import PaymentCreate
from app.repositories.application_repository import application_repo
from app.services.payment_adapter import payment_adapter
from app.core.exceptions import AppException
from app.services.state_machine import state_machine
from app.services.audit_service import audit_service


class ApplicationService:
    def _generate_app_id(self, service_id: int) -> str:
        # e.g., SRV1-2026-001
        rand = random.randint(100, 999)
        return f"SRV{service_id}-2026-{rand}"

    def apply(
        self, db: Session, user_id: int, service_id: int, obj_in: ApplicationCreate
    ) -> Application:
        app_id = self._generate_app_id(service_id)

        # Create application
        application = application_repo.create(
            db, user_id=user_id, app_id=app_id, service_id=service_id, obj_in=obj_in
        )

        # Create initial stage
        stage = Stage(
            application_id=application.id,
            name="Draft Created",
            desc="Application drafted by investor.",
            status="DRAFT",
            days=0,
        )
        application_repo.add_stage(db, stage)

        # Update current stage
        application.current_stage_id = stage.id
        application.status = "DRAFT"
        db.add(application)
        db.commit()
        db.refresh(application)

        audit_service.log(
            db=db,
            actor_id=user_id,
            action="CREATE_APPLICATION",
            entity_type="application",
            entity_id=application.id,
            after_data={"status": "DRAFT"},
        )

        return application

    def link_documents(
        self, db: Session, user_id: int, application_id: str, document_ids: List[int]
    ):
        application = application_repo.get(db, application_id)
        if not application:
            raise AppException(
                status_code=404,
                error_code="RESOURCE_NOT_FOUND",
                message="Application not found",
            )

        if application.user_id != user_id:
            raise AppException(
                status_code=403,
                error_code="ACCESS_DENIED",
                message="Cannot modify this application",
            )

        for doc_id in document_ids:
            link = ApplicationDocument(
                application_id=application.id, document_id=doc_id
            )
            db.add(link)

        db.commit()

    def pay(
        self, db: Session, user_id: int, application_id: str, obj_in: PaymentCreate
    ) -> Payment:
        application = application_repo.get(db, application_id)
        if not application:
            raise AppException(
                status_code=404,
                error_code="RESOURCE_NOT_FOUND",
                message="Application not found",
            )

        if application.user_id != user_id:
            raise AppException(
                status_code=403,
                error_code="ACCESS_DENIED",
                message="Cannot modify this application",
            )

        # Process payment via adapter
        result = payment_adapter.process_payment(application_id, obj_in.amount)

        # Record payment
        payment = Payment(
            application_id=application.id,
            amount=result["amount"],
            status=result["status"],
            reference_id=result["reference_id"],
        )
        db.add(payment)

        # Update stage to submitted if payment completed
        if result["status"] == "completed":
            self.transition_status(
                db=db,
                user_id=user_id,
                role="INVESTOR",
                application_id=application.id,
                new_status="SUBMITTED",
                desc="Payment received and application submitted.",
            )

        db.commit()
        db.refresh(payment)
        return payment

    def track(
        self, db: Session, user_id: int, role: str, application_id: str
    ) -> List[Stage]:
        application = application_repo.get(db, application_id)
        if not application:
            raise AppException(
                status_code=404,
                error_code="RESOURCE_NOT_FOUND",
                message="Application not found",
            )

        if role == "INVESTOR" and application.user_id != user_id:
            raise AppException(
                status_code=403,
                error_code="ACCESS_DENIED",
                message="Cannot view this application",
            )

        return application_repo.get_stages(db, application_id)

    def get_multi(self, db: Session, user_id: int, role: str) -> List[Application]:
        if role in ["OFFICER", "POLICY_ADMIN"]:
            return application_repo.get_multi_all(db)
        return application_repo.get_multi_by_user(db, user_id)

    def get(
        self, db: Session, user_id: int, role: str, application_id: str
    ) -> Application:
        application = application_repo.get(db, application_id)
        if not application:
            raise AppException(
                status_code=404,
                error_code="RESOURCE_NOT_FOUND",
                message="Application not found",
            )

        if role == "INVESTOR" and application.user_id != user_id:
            raise AppException(
                status_code=403,
                error_code="ACCESS_DENIED",
                message="Cannot view this application",
            )

        return application

    def transition_status(
        self,
        db: Session,
        user_id: int,
        role: str,
        application_id: str,
        new_status: str,
        desc: str = None,
    ) -> Application:
        application = application_repo.get(db, application_id)
        if not application:
            raise AppException(
                status_code=404,
                error_code="RESOURCE_NOT_FOUND",
                message="Application not found",
            )

        current_status = application.status or "DRAFT"

        # Validate transition using state machine
        state_machine.validate_transition(current_status, new_status, role)

        # Update application status
        application.status = new_status
        if new_status == "SUBMITTED":
            application.is_draft = False

        # Add tracking stage
        stage_name = new_status.replace("_", " ").title()
        stage = Stage(
            application_id=application.id,
            name=stage_name,
            desc=desc or f"Application transitioned to {stage_name}",
            status=new_status,
            days=0,
        )
        application_repo.add_stage(db, stage)
        application.current_stage_id = stage.id

        db.add(application)

        # Log audit
        audit_service.log(
            db=db,
            actor_id=user_id,
            action="APPLICATION_STATUS_TRANSITION",
            entity_type="application",
            entity_id=application.id,
            after_data={"status": new_status, "previous_status": current_status},
        )

        db.commit()
        db.refresh(application)

        return application


application_service = ApplicationService()
