# PRAVAH — Core Infrastructure Team Handover

Welcome to the PRAVAH backend! Our foundational sprint (Phases 0-8) is officially complete. 

The core infrastructure is now wired up and ready for you to build your specific domains (Applications, Services, AI features, Dashboards, etc.) on top of it.

This document serves as your **quick-start guide** to understanding what was built and how you should interact with it.

---

## 1. What Has Been Built (The Foundation)

We have successfully migrated the frontend mock data to a full-stack Postgres-backed reality. The following systems are fully operational:

- **PostgreSQL + pgvector**: Database layer managed by Alembic.
- **JWT Authentication Layer**: Complete login/registration/logout cycle with secure password hashing.
- **Role-Based Access Control (RBAC)**: A dynamic `Role` & `Permission` engine to protect routes based on the user's role.
- **Atomic Audit Logging**: A centralized logger (`audit_service`) that safely records mutations and drops them if the database transaction rolls back.
- **Seed Framework**: An idempotent, registry-based seed system that allows each of you to mock your own data safely.
- **CI/CD Pipeline**: GitHub Actions are guarding `main` and `develop` to ensure code formatting, testing, and builds succeed.

---

## 2. How to Run the Project on Your Machine

Before you start writing code, you need to spin up the local environment.

**Detailed guide:** Please read the [**SETUP.md**](SETUP.md) document.

**Quick Summary:**
1. Ensure Docker Desktop is running.
2. Run `docker compose up -d postgres` to start the database.
3. In `/backend`, run:
   - `python -m venv venv` and activate it.
   - `pip install -r requirements.txt`
   - `alembic upgrade head`
   - `python -m app.seed.seed`
   - `uvicorn app.main:app --reload --port 8000`
4. The backend is alive at `http://localhost:8000`. You can log in using `demo@gmail.com` / `demo123`.

---

## 3. How to Develop Your Features

As you build out your modules, you must follow the conventions we've established.

### 🛡️ Protecting Your Routes (RBAC)
Never write raw SQL to check permissions. Use our dependency injection wrappers in your FastAPI routes.
```python
from app.api.deps import RoleChecker, PermissionChecker

# Restrict to specific roles
@router.post("/approve", dependencies=[Depends(RoleChecker(["SYSTEM_ADMIN", "OFFICER"]))])

# Or restrict by explicit permission
@router.post("/process", dependencies=[Depends(PermissionChecker(["approve_application"]))])
```

### 📋 Logging Actions (Audit)
If your route mutates state (e.g. changing an application status), you *must* log it before committing.
```python
from app.services.audit_service import audit_service, AuditAction

# Inside your route:
app_obj.status = "APPROVED"

audit_service.log(
    db=db,
    actor_id=current_user.id,
    action=AuditAction.APPLICATION_STATUS_CHANGE,
    entity_type="application",
    entity_id=str(app_obj.id),
    after_data={"status": "APPROVED"}
)
db.commit() # The log is committed atomically with your change!
```
*Note: If your transaction throws an error and rolls back, the audit log will safely roll back too.*

### 🌱 Mocking Your Data (Seed Framework)
Need to add mock data for your specific domain so the frontend works? 
**DO NOT** edit the core mock files! Instead:
1. Create `app/seed/seed_<your-domain>.py`.
2. Write a function that creates your data (make sure to check if it already exists so it doesn't duplicate).
3. Open `app/seed/seed.py` and register your file in the `SEED_REGISTRY` array.
*For full instructions, read [**DATABASE.md**](DATABASE.md).*

### 🔄 Modifying the Database (Alembic)
If you add a new model in `app/models/`:
1. Make sure it's imported in `app/models/__init__.py`.
2. Generate the migration: `alembic revision --autogenerate -m "added my feature"`
3. Apply it: `alembic upgrade head`

---

## 4. Before Opening a Pull Request

The CI pipeline is strict and will fail your branch if you skip steps. Before pushing:
1. Run `pytest app/tests/`
2. Run `black app/`
3. Run `flake8 app/`
4. Do **not** commit your `.env` file!

When you open a PR on GitHub, a template will automatically appear. Check off the boxes, tag a teammate for review, and wait for the CI to go green.

**Good luck! The foundation is solid — go build something amazing!**
