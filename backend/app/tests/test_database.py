"""
Tests for the database models and repositories.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.database import Base
from app.models.user import User
from app.repositories.user_repository import user_repo

# Setup an in-memory SQLite database for testing the repository layer
# This isolates the test from the live PostgreSQL instance
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for a test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_create_and_read_user(db_session):
    """Test creating a user and reading it back."""
    user_data = {
        "email": "test@example.com",
        "hashed_password": "hashedsecret",
        "role": "investor",
        "is_active": True,
    }

    user = user_repo.create(db_session, obj_in=user_data)
    assert user.id is not None
    assert user.email == "test@example.com"

    fetched_user = user_repo.get_by_email(db_session, email="test@example.com")
    assert fetched_user is not None
    assert fetched_user.id == user.id


def test_unique_email_constraint(db_session):
    """Test that creating two users with the same email raises an error."""
    user_data = {
        "email": "duplicate@example.com",
        "hashed_password": "hashedsecret",
        "role": "investor",
    }

    user_repo.create(db_session, obj_in=user_data)

    with pytest.raises(IntegrityError):
        user_repo.create(db_session, obj_in=user_data)
