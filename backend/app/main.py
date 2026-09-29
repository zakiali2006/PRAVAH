import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.exceptions import AppException
from app.core.responses import ErrorCode, error_response

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Backend API for PRAVAH — Predictive Regulatory Approval "
        "Verification & Assistance Hub"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — origins read from settings, never hardcoded
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Global exception handlers — every error returns the universal format
# ---------------------------------------------------------------------------
@app.exception_handler(AppException)
async def app_exception_handler(_request: Request, exc: AppException):
    """Handle custom application exceptions."""
    return error_response(
        error_code=exc.error_code,
        message=exc.message,
        status_code=exc.status_code,
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exc: StarletteHTTPException):
    """Convert standard HTTP exceptions to the universal error format."""
    code_map = {
        400: ErrorCode.BAD_REQUEST,
        401: ErrorCode.UNAUTHORIZED,
        403: ErrorCode.FORBIDDEN,
        404: ErrorCode.RESOURCE_NOT_FOUND,
        422: ErrorCode.VALIDATION_ERROR,
    }
    error_code = code_map.get(exc.status_code, ErrorCode.INTERNAL_ERROR)
    return error_response(
        error_code=error_code,
        message=str(exc.detail),
        status_code=exc.status_code,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    """Convert Pydantic / FastAPI validation errors to the universal format."""
    errors = exc.errors()
    messages = []
    for err in errors:
        loc = " → ".join(str(l) for l in err.get("loc", []))
        messages.append(f"{loc}: {err.get('msg', 'Invalid value')}")
    return error_response(
        error_code=ErrorCode.VALIDATION_ERROR,
        message="; ".join(messages),
        status_code=422,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception):
    """Catch-all for unexpected errors — log and return generic message."""
    logger.exception("Unhandled exception: %s", exc)
    return error_response(
        error_code=ErrorCode.INTERNAL_ERROR,
        message="An unexpected internal error occurred.",
        status_code=500,
    )


# ---------------------------------------------------------------------------
# Router registration — all routers are included under /api
# ---------------------------------------------------------------------------
from app.api.router import api_router  # noqa: E402

app.include_router(api_router, prefix="/api")
