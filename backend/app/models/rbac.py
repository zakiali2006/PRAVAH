from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import BaseMixin

# Association table for many-to-many relationship between Role and Permission
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column(
        "role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "permission_id",
        Integer,
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Role(Base, BaseMixin):
    __tablename__ = "roles"

    name = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)

    # Relationships
    permissions = relationship(
        "Permission", secondary=role_permissions, back_populates="roles"
    )


class Permission(Base, BaseMixin):
    __tablename__ = "permissions"

    name = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)

    # Relationships
    roles = relationship(
        "Role", secondary=role_permissions, back_populates="permissions"
    )


class Department(Base, BaseMixin):
    __tablename__ = "departments"

    name = Column(String, unique=True, nullable=False, index=True)
    code = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)
