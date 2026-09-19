from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import BaseMixin


class User(Base, BaseMixin):
    __tablename__ = "users"

    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="investor", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )


class OTPVerification(Base, BaseMixin):
    __tablename__ = "otp_verifications"

    email = Column(String, index=True, nullable=False)
    otp_hash = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    attempts = Column(Integer, default=0, nullable=False)


class RefreshToken(Base, BaseMixin):
    __tablename__ = "refresh_tokens"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token_hash = Column(String, nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="refresh_tokens")
