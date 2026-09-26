from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.application_repo import application_repo
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate
from app.services.audit_service import audit_service
from datetime import datetime
import uuid


class ApplicationService:
    @staticmethod
    def create_application(
        db: Session, application_in: ApplicationCreate, user_id: int
    ):
        app_id = f"APP/{datetime.now().year}/{str(uuid.uuid4())[:8].upper()}"
        app_data = application_in.dict()
        app_data["id"] = app_id
        app_data["user_id"] = user_id
        app_data["status"] = "submitted"
        app_data["is_draft"] = False
        app_data["submitted_at"] = datetime.now()

        application = application_repo.create(db=db, obj_in=app_data)

        # Add realistic standard stages for tracking
        application_repo.add_stage(
            db,
            app_id,
            "Application Submitted",
            "Sent to department for review.",
            "completed",
        )
        application_repo.add_stage(
            db,
            app_id,
            "Document Verification",
            "Verifying submitted incorporation and identity documents.",
            "pending",
        )
        application_repo.add_stage(
            db,
            app_id,
            "Department Scrutiny",
            "Detailed scrutiny by the respective regulatory department.",
            "upcoming",
        )
        application_repo.add_stage(
            db,
            app_id,
            "Final Approval",
            "Awaiting final sign-off from the nodal officer.",
            "upcoming",
        )

        # Log audit
        audit_service.log(
            db,
            actor_id=user_id,
            action="CREATE_APPLICATION",
            entity_type="applications",
            entity_id=app_id,
        )

        # Calculate initial risk score & triage
        try:
            from app.services.risk_scoring_service import risk_scoring_service
            risk_scoring_service.calculate_risk(db, app_id, persist=True)
        except Exception:
            pass

        return application

    @staticmethod
    def submit_application(db: Session, application_id: str, user_id: int):
        application = application_repo.get(db, id=application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        if application.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        application = application_repo.update(
            db,
            db_obj=application,
            obj_in={
                "status": "submitted",
                "is_draft": False,
                "submitted_at": datetime.now(),
            },
        )

        application_repo.update_stage(
            db,
            application_id,
            "Application Submitted",
            "completed",
            "Sent to department for review.",
        )

        audit_service.log(
            db,
            actor_id=user_id,
            action="SUBMIT_APPLICATION",
            entity_type="applications",
            entity_id=application_id,
        )

        # Recalculate risk score upon submission
        try:
            from app.services.risk_scoring_service import risk_scoring_service
            risk_scoring_service.calculate_risk(db, application_id, persist=True)
        except Exception:
            pass

        return application

    @staticmethod
    def update_status(
        db: Session,
        application_id: str,
        status_update: ApplicationStatusUpdate,
        officer_id: int,
    ):
        application = application_repo.get(db, id=application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        # Intelligently update existing stages based on the new status
        if status_update.status.lower() == "approve_documents":
            application_repo.update_stage(
                db,
                application_id,
                "Document Verification",
                "completed",
                status_update.remarks or "Documents successfully verified.",
            )
            application_repo.update_stage(
                db,
                application_id,
                "Department Scrutiny",
                "pending",
                "Detailed scrutiny by the respective regulatory department.",
            )
            application.status = "scrutiny"
        elif status_update.status.lower() == "approve_scrutiny":
            application_repo.update_stage(
                db,
                application_id,
                "Department Scrutiny",
                "completed",
                status_update.remarks or "Scrutiny completed without objections.",
            )
            application_repo.update_stage(
                db,
                application_id,
                "Final Approval",
                "pending",
                "Awaiting final sign-off from the nodal officer.",
            )
            application.status = "final_approval"
        elif status_update.status.lower() == "approve_final":
            application_repo.update_stage(
                db,
                application_id,
                "Final Approval",
                "completed",
                status_update.remarks or "Application approved by the nodal officer.",
            )
            application.status = "approved"
        elif status_update.status.lower() == "rejected":
            application_repo.update_stage(
                db,
                application_id,
                "Final Approval",
                "rejected",
                status_update.remarks or "Application has been rejected.",
            )
            application.status = "rejected"
        elif status_update.status.lower() == "clarification":
            # Just add a new ad-hoc stage for clarification requests
            application_repo.add_stage(
                db,
                application_id,
                "Clarification Requested",
                status_update.remarks or "Officer has requested more information.",
                "pending",
            )
            application.status = "clarification"
        else:
            # Fallback for old "approved" logic or others
            if status_update.status.lower() == "approved":
                application_repo.update_stage(
                    db, application_id, "Document Verification", "completed"
                )
                application_repo.update_stage(
                    db, application_id, "Department Scrutiny", "completed"
                )
                application_repo.update_stage(
                    db,
                    application_id,
                    "Final Approval",
                    "completed",
                    status_update.remarks,
                )
            application.status = status_update.status

        db.commit()
        db.refresh(application)

        audit_service.log(
            db,
            actor_id=officer_id,
            action="UPDATE_APPLICATION_STATUS",
            entity_type="applications",
            entity_id=application_id,
        )
        return application
