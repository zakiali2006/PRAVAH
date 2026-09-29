# Database Architecture & Management

PRAVAH uses **PostgreSQL 16** with the **pgvector** extension to power both relational data and our upcoming AI similarity matching.

## Migrations (Alembic)

We use SQLAlchemy 2.0 ORM and Alembic for schema migrations.

- **Creating a new migration:**
  After updating or adding a model in `app/models/`, generate a new migration script:
  ```bash
  alembic revision --autogenerate -m "added new feature table"
  ```
- **Applying migrations:**
  ```bash
  alembic upgrade head
  ```
- **Reverting a migration:**
  ```bash
  alembic downgrade -1
  ```

> [!IMPORTANT]
> Never manually edit the database schema outside of Alembic. Ensure `import app.models` is present in `alembic/env.py` (via `__init__.py`) so Alembic detects your models.

## Seed Framework

PRAVAH uses a registry-based seed framework located at `app/seed/seed.py`.

### How to Seed the Database
```bash
python -m app.seed.seed
```
The seed framework is **idempotent**, meaning it checks if records exist before inserting them. It is always safe to run.

### Creating Your Own Seed Module
1. Create `backend/app/seed/seed_<your_feature>.py`.
2. Write a function that accepts an active `Session` and creates your mock data. Ensure you check for existence first to preserve idempotency!
3. Add your function to the `SEED_REGISTRY` inside `app/seed/seed.py`.

### Reset & Seed (Dev Only)
If you corrupt your local database during development, you can wipe it completely and restart:
```bash
python -m app.seed.reset_and_seed
```
*Note: This script enforces `ENV=development` and will refuse to run in production.*

## Connecting via GUI
You can connect DBeaver, pgAdmin, or TablePlus to the local Docker database using:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `pravah_db`
- **User**: `pravah_user`
- **Password**: `pravah_password`
