from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditLog


class AuditAction:
    USER_REGISTER = "USER_REGISTER"
    USER_LOGIN = "USER_LOGIN"
    USER_LOGOUT = "USER_LOGOUT"
    APPLICATION_STATUS_CHANGE = "APPLICATION_STATUS_CHANGE"
    DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD"
    GRIEVANCE_ACTION = "GRIEVANCE_ACTION"
    RULE_MODIFICATION = "RULE_MODIFICATION"
    OFFICER_ASSIGNMENT = "OFFICER_ASSIGNMENT"
    PAYMENT_UPDATE = "PAYMENT_UPDATE"


class AuditService:
    def log(
        self,
        db: Session,
        actor_id: Optional[int],
        action: str,
        entity_type: str,
        entity_id: str,
        before_data: Optional[Dict[str, Any]] = None,
        after_data: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        """
        Appends an audit log to the active database session.
        This does NOT call db.commit() to ensure the log is committed atomically
        with the surrounding business logic.
        """
        audit = AuditLog(
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            before_data=before_data,
            after_data=after_data,
            ip_address=ip_address,
        )
        db.add(audit)
        return audit


audit_service = AuditService()
