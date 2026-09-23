"""
Universal API response format helpers.

Every API response in PRAVAH uses this format:

Success: {"status": "success", "data": {}, "message": "..."}
Error:   {"status": "error", "error_code": "...", "message": "..."}

Usage:
    from app.core.responses import success_response, error_response, ErrorCode
"""

from enum import Enum
from typing import Any

from fastapi.responses import JSONResponse


class ErrorCode(str, Enum):
    """Centralized error codes used across all API error responses."""

    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    CONFLICT = "CONFLICT"
    BAD_REQUEST = "BAD_REQUEST"
    INVALID_STATE_TRANSITION = "INVALID_STATE_TRANSITION"


def success_response(
    data: Any = None,
    message: str = "Operation completed successfully.",
) -> dict:
    """Return a dict in the universal success format.

    Use this as the return value from route handlers so FastAPI
    serialises it automatically.
    """
    return {
        "status": "success",
        "data": data if data is not None else {},
        "message": message,
    }


def error_response(
    error_code: str | ErrorCode,
    message: str,
    status_code: int = 400,
) -> JSONResponse:
    """Return a JSONResponse in the universal error format.

    Use this when you need to set a specific HTTP status code
    from within a route handler or exception handler.
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "error",
            "error_code": (
                error_code.value if isinstance(error_code, ErrorCode) else error_code
            ),
            "message": message,
        },
    )
