"""Health-check endpoint."""

from fastapi import APIRouter

from app.core.responses import success_response

router = APIRouter()


@router.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    """Return a simple health-check in the universal success format."""
    return success_response(
        data={"service": "PRAVAH API", "version": "1.0.0"},
        message="Service is healthy.",
    )
