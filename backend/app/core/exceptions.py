"""
Custom exception classes for PRAVAH.

These exceptions carry an ``error_code`` that maps to the universal
error response format.  They are caught by the global exception
handlers registered in ``app.main`` and converted into JSON responses.

Usage:
    from app.core.exceptions import NotFoundException
    raise NotFoundException("User not found")
"""

from app.core.responses import ErrorCode


class AppException(Exception):
    """Base exception for all application-level errors."""

    def __init__(
        self,
        message: str = "An unexpected error occurred.",
        error_code: str | ErrorCode = ErrorCode.INTERNAL_ERROR,
        status_code: int = 500,
    ):
        self.message = message
        self.error_code = (
            error_code.value
            if isinstance(error_code, ErrorCode)
            else error_code
        )
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AppException):
    """Raised when a requested resource does not exist."""

    def __init__(self, message: str = "The requested resource was not found."):
        super().__init__(
            message=message,
            error_code=ErrorCode.RESOURCE_NOT_FOUND,
            status_code=404,
        )


class UnauthorizedException(AppException):
    """Raised when authentication is missing or invalid."""

    def __init__(self, message: str = "Authentication required."):
        super().__init__(
            message=message,
            error_code=ErrorCode.UNAUTHORIZED,
            status_code=401,
        )


class ForbiddenException(AppException):
    """Raised when the user lacks permission for the action."""

    def __init__(self, message: str = "You do not have permission."):
        super().__init__(
            message=message,
            error_code=ErrorCode.FORBIDDEN,
            status_code=403,
        )


class ValidationException(AppException):
    """Raised for business-logic validation failures."""

    def __init__(self, message: str = "Validation failed."):
        super().__init__(
            message=message,
            error_code=ErrorCode.VALIDATION_ERROR,
            status_code=422,
        )


class ConflictException(AppException):
    """Raised when an operation conflicts with existing state."""

    def __init__(self, message: str = "Resource already exists."):
        super().__init__(
            message=message,
            error_code=ErrorCode.CONFLICT,
            status_code=409,
        )
