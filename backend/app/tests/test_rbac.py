import pytest
from fastapi import APIRouter, Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
import app.models  # noqa: F401
from app.api.deps import RoleChecker, PermissionChecker, get_current_active_user
from app.seed.seed_rbac import seed_rbac
from app.repositories.user_repository import user_repo

from app.main import app

# Setup test DB
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

# Mount dummy routes for RBAC testing
test_router = APIRouter()


@test_router.get("/protected-role")
def protected_by_role(user=Depends(RoleChecker(["SYSTEM_ADMIN"]))):
    return {"status": "success"}


@test_router.get("/protected-permission")
def protected_by_perm(user=Depends(PermissionChecker(["view_audit"]))):
    return {"status": "success"}


app.include_router(test_router, prefix="/api/test-rbac")

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_rbac_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # 1. Seed RBAC mappings
    seed_rbac(db)

    # 2. Create test users with different roles
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
    # Bypass login endpoint by creating token directly
    from app.core.security import create_access_token

    db = TestingSessionLocal()
    user = user_repo.get_by_email(db, email=email)
    token = create_access_token(subject=user.id)
    db.close()
    return {"Authorization": f"Bearer {token}"}


def test_unauthenticated_returns_401():
    resp = client.get("/api/test-rbac/protected-role")
    assert resp.status_code == 401


def test_investor_fails_role_check():
    headers = get_auth_headers("investor@test.com")
    resp = client.get("/api/test-rbac/protected-role", headers=headers)
    assert resp.status_code == 403
    assert resp.json()["error_code"] == "FORBIDDEN"


def test_admin_passes_role_check():
    headers = get_auth_headers("admin@test.com")
    resp = client.get("/api/test-rbac/protected-role", headers=headers)
    assert resp.status_code == 200


def test_investor_fails_permission_check():
    # view_audit is not in INVESTOR permissions
    headers = get_auth_headers("investor@test.com")
    resp = client.get("/api/test-rbac/protected-permission", headers=headers)
    assert resp.status_code == 403


def test_admin_passes_permission_check():
    # SYSTEM_ADMIN automatically passes all permission checks
    headers = get_auth_headers("admin@test.com")
    resp = client.get("/api/test-rbac/protected-permission", headers=headers)
    assert resp.status_code == 200
