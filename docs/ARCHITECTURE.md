# PRAVAH Architecture & Standards

## Role-Based Access Control (RBAC)

PRAVAH utilizes a dual-layer RBAC system: **Roles** and **Permissions**.

### Role Matrix

| Role | Description |
|---|---|
| `INVESTOR` | External users applying for approvals, tracking stages, and paying fees. |
| `TRANSACTIONAL_USER` | Operational delegates under an investor (e.g. CA, legal counsel). |
| `OFFICER` | Internal government officers reviewing applications and uploading compliance. |
| `POLICY_ADMIN` | Configures the rules engine, edits AI prompts, manages department SLAs. |
| `SYSTEM_ADMIN` | Master role. Unrestricted access to all resources and audit logs. |

### How to Protect Your Endpoints

Other team members should use the `RoleChecker` or `PermissionChecker` dependencies provided in `app.api.deps` to restrict access to their specific route handlers.

#### 1. Restricting by Role

```python
from fastapi import APIRouter, Depends
from app.api.deps import RoleChecker

router = APIRouter()

@router.get("/sensitive-data")
def get_sensitive_data(
    current_user = Depends(RoleChecker(["SYSTEM_ADMIN", "POLICY_ADMIN"]))
):
    # Only System Admins and Policy Admins can reach here.
    # Otherwise, a 403 Forbidden is automatically raised.
    return {"message": "Success"}
```

#### 2. Restricting by Specific Permission

If you have a granular action (e.g. `view_audit`), you can restrict by permission instead. Note that `SYSTEM_ADMIN` automatically passes all permission checks.

```python
from fastapi import APIRouter, Depends
from app.api.deps import PermissionChecker

router = APIRouter()

@router.delete("/resource/{id}")
def delete_resource(
    id: int,
    current_user = Depends(PermissionChecker(["delete_resource"]))
):
    # Only users whose role contains the 'delete_resource' permission can reach here.
    return {"message": "Deleted"}
```

## Security Best Practices
- **Do not** write raw SQL `WHERE role = '...'` to check permissions in services. Always enforce it at the router boundary using dependencies.
- Ensure any data you return is properly scoped (e.g. an `INVESTOR` should only see their own applications, even if they have the `view_applications` permission). RBAC handles the *capability*, but your SQL queries must handle the *ownership*.
