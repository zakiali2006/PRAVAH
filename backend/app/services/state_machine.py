from app.core.exceptions import AppException
from app.core.responses import ErrorCode

VALID_TRANSITIONS = {
    "DRAFT": {"SUBMITTED"},
    "SUBMITTED": {"UNDER_REVIEW"},
    "UNDER_REVIEW": {"QUERY_RAISED", "DOCUMENT_REQUIRED", "APPROVED", "REJECTED"},
    "QUERY_RAISED": {"UNDER_REVIEW"},
    "DOCUMENT_REQUIRED": {"UNDER_REVIEW"},
    "APPROVED": {"COMPLETED"},
    "REJECTED": {"COMPLETED"},
    "COMPLETED": set(),
}

TRANSITION_ROLES = {
    ("DRAFT", "SUBMITTED"): {"INVESTOR"},
    ("SUBMITTED", "UNDER_REVIEW"): {"OFFICER", "POLICY_ADMIN"},
    ("UNDER_REVIEW", "QUERY_RAISED"): {"OFFICER", "POLICY_ADMIN"},
    ("UNDER_REVIEW", "DOCUMENT_REQUIRED"): {"OFFICER", "POLICY_ADMIN"},
    ("QUERY_RAISED", "UNDER_REVIEW"): {"INVESTOR"},
    ("DOCUMENT_REQUIRED", "UNDER_REVIEW"): {"INVESTOR"},
    ("UNDER_REVIEW", "APPROVED"): {"OFFICER", "POLICY_ADMIN"},
    ("UNDER_REVIEW", "REJECTED"): {"OFFICER", "POLICY_ADMIN"},
    ("APPROVED", "COMPLETED"): {"OFFICER", "POLICY_ADMIN"},
    ("REJECTED", "COMPLETED"): {"OFFICER", "POLICY_ADMIN"},
}


class StateMachine:
    @staticmethod
    def validate_transition(
        current_status: str, new_status: str, actor_role: str
    ) -> None:
        if current_status not in VALID_TRANSITIONS:
            raise AppException(
                status_code=400,
                error_code=ErrorCode.INVALID_STATE_TRANSITION,
                message=f"Current status '{current_status}' is invalid.",
            )

        if new_status not in VALID_TRANSITIONS[current_status]:
            raise AppException(
                status_code=400,
                error_code=ErrorCode.INVALID_STATE_TRANSITION,
                message=f"Transition from '{current_status}' to '{new_status}' is not allowed.",
            )

        allowed_roles = TRANSITION_ROLES.get((current_status, new_status))
        if not allowed_roles or actor_role not in allowed_roles:
            raise AppException(
                status_code=403,
                error_code=ErrorCode.FORBIDDEN,
                message=f"Role '{actor_role}' is not authorized to transition from '{current_status}' to '{new_status}'.",
            )


state_machine = StateMachine()
