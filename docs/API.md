# API Conventions & Guide

PRAVAH uses FastAPI to deliver a high-performance REST API.

## Response Standards

To ensure a unified frontend experience, **all** successful responses must use the `success_response` wrapper, and all errors must be raised using `AppException`.

### Success Response
```python
from app.core.responses import success_response

@router.get("/my-endpoint")
def my_endpoint():
    # ... logic ...
    return success_response(
        data={"some": "data"},
        message="Data retrieved successfully"
    )
```

### Error Response
Do not use FastAPI's raw `HTTPException`.
```python
from app.core.responses import AppException

@router.post("/process")
def process_data():
    if not valid:
        raise AppException(
            status_code=400,
            error_code="INVALID_DATA",
            message="The submitted data is invalid."
        )
```

## Routers & Registration

Do not register routes directly on `app` in `main.py`.
1. Create a router inside `app/api/routes/` (e.g. `app/api/routes/applications.py`).
2. Define your endpoints using `@router.get()`, `@router.post()`, etc.
3. Import and include your router in `app/api/router.py`.

## Core API Map

- `GET /api/health`: General system healthcheck.
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate and receive an Access & Refresh JWT pair.
- `POST /api/auth/logout`: Revoke a refresh token.
- `GET /api/auth/me`: Fetch the current user profile (Requires Auth).
- `GET /api/audit/`: Read-only view of the Audit logs (Requires SYSTEM_ADMIN or POLICY_ADMIN).
