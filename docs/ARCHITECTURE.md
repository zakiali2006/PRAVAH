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

## Audit System

PRAVAH maintains a strict, centralized audit log for tracking important user actions and mutations. All team members must log mutations in their domains.

### How to Log an Action

We provide a centralized `audit_service` which atomically attaches a log to your current database session. Because it **does not commit**, if your transaction fails and rolls back, the audit log cleanly rolls back with it.

1. **Import the service and Action constants:**
```python
from app.services.audit_service import audit_service, AuditAction
```

2. **Call `.log()` before your `db.commit()`:**
```python
@router.post("/applications/{id}/approve")
def approve_application(id: int, db: Session = Depends(get_db), user = Depends(get_current_active_user)):
    # 1. Do your business logic...
    app_obj = db.query(Application).get(id)
    old_status = app_obj.status
    app_obj.status = "APPROVED"
    
    # 2. Log the change
    audit_service.log(
        db=db,
        actor_id=user.id,
        action=AuditAction.APPLICATION_STATUS_CHANGE,
        entity_type="application",
        entity_id=str(app_obj.id),
        before_data={"status": old_status},
        after_data={"status": "APPROVED"}
    )
    
    # 3. Commit atomically
    db.commit()
    return {"message": "Approved"}
```

Available `AuditAction` constants (add more to `app/services/audit_service.py` if needed):
- `USER_REGISTER`, `USER_LOGIN`, `USER_LOGOUT`
- `APPLICATION_STATUS_CHANGE`
- `DOCUMENT_UPLOAD`
- `GRIEVANCE_ACTION`
- `RULE_MODIFICATION`
- `OFFICER_ASSIGNMENT`
- `PAYMENT_UPDATE`

## Seed Framework

PRAVAH uses a **registry-based seed framework** for populating the database with demo/test data.

### Running Seeds

```bash
# Seed existing database (idempotent — safe to re-run)
python -m app.seed.seed

# Dev-only: wipe and rebuild the entire database, then seed
python -m app.seed.reset_and_seed
```

### Adding Your Own Seed Module

1. Create a file `app/seed/seed_<your_domain>.py`:
```python
from sqlalchemy.orm import Session
from app.models.your_model import YourModel

def seed_your_domain(db: Session):
    # Check for existence before creating (idempotency)
    existing = db.query(YourModel).filter(YourModel.name == "Example").first()
    if existing:
        return
    obj = YourModel(name="Example")
    db.add(obj)
    db.commit()
```

2. Register it in `app/seed/seed.py` by adding a tuple to `SEED_REGISTRY`:
```python
SEED_REGISTRY = [
    ("RBAC (Roles & Permissions)", "app.seed.seed_rbac", "seed_rbac"),
    ("Demo Users", "app.seed.seed_users", "seed_users"),
    ("Departments", "app.seed.seed_departments", "seed_departments"),
    # Add yours here:
    ("Your Domain", "app.seed.seed_your_domain", "seed_your_domain"),
]
```

### Demo Credentials

| Email | Password | Role |
|---|---|---|
| `demo@gmail.com` | `demo123` | INVESTOR |
| `officer@gov.in` | `admin123` | OFFICER |
| `admin@pravah.gov.in` | `admin123` | SYSTEM_ADMIN |
| `policy@pravah.gov.in` | `admin123` | POLICY_ADMIN |

