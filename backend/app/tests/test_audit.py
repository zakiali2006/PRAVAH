import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timezone

from app.core.database import Base, get_db
import app.models  # noqa: F401
from app.seed.seed_rbac import seed_rbac
from app.repositories.user_repository import user_repo
from app.services.audit_service import audit_service, AuditAction
from app.models.audit import AuditLog
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_audit_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_rbac(db)

    # Create test users
    user_repo.create(
        db,
        obj_in={
            "email": "investor@test.com",
            "hashed_password": "hash",
            "role": "INVESTOR",
            "is_active": True,
        },
    )
    user_repo.create(
        db,
        obj_in={
            "email": "admin@test.com",
            "hashed_password": "hash",
            "role": "SYSTEM_ADMIN",
            "is_active": True,
        },
    )

    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


def get_auth_headers(email: str) -> dict:
    from app.core.security import create_access_token

    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, email=email)
    token = create_access_token(subject=user.id)
    db.close()
    return {"Authorization": f"Bearer {token}"}


def test_audit_atomicity_commit():
    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, "investor@test.com")

    # Action
    audit_service.log(
        db=db,
        actor_id=user.id,
        action=AuditAction.USER_LOGIN,
        entity_type="user",
        entity_id=str(user.id),
    )
    db.commit()

    # Verify
    logs = db.query(AuditLog).all()
    assert len(logs) == 1
    assert logs[0].action == AuditAction.USER_LOGIN
    db.close()


def test_audit_atomicity_rollback():
    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, "investor@test.com")

    # Action that fails
    try:
        audit_service.log(
            db=db,
            actor_id=user.id,
            action="SHOULD_NOT_SAVE",
            entity_type="user",
            entity_id=str(user.id),
        )
        raise ValueError("Simulated failure")
    except ValueError:
        db.rollback()

    # Verify log was not saved
    logs = db.query(AuditLog).all()
    assert len(logs) == 0
    db.close()


def test_audit_endpoint_investor_forbidden():
    headers = get_auth_headers("investor@test.com")
    resp = client.get("/api/audit/", headers=headers)
    assert resp.status_code == 403


def test_audit_endpoint_admin_allowed():
    # Insert a dummy log
    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, "admin@test.com")
    audit_service.log(
        db=db,
        actor_id=user.id,
        action=AuditAction.USER_LOGIN,
        entity_type="user",
        entity_id=str(user.id),
    )
    db.commit()
    db.close()

    headers = get_auth_headers("admin@test.com")
    resp = client.get("/api/audit/", headers=headers)

    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data) >= 1
    assert data[0]["action"] == AuditAction.USER_LOGIN
