from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.rbac import Role, Permission
from app.models.user import User


class RBACRepository:
    def get_role_by_name(self, db: Session, name: str) -> Optional[Role]:
        stmt = select(Role).where(Role.name == name)
        return db.execute(stmt).scalar_one_or_none()

    def get_permission_by_name(self, db: Session, name: str) -> Optional[Permission]:
        stmt = select(Permission).where(Permission.name == name)
        return db.execute(stmt).scalar_one_or_none()

    def get_user_permissions(self, db: Session, user: User) -> List[str]:
        # Fast path if using simple role column
        if not user.role:
            return []

        role_obj = self.get_role_by_name(db, user.role)
        if not role_obj:
            return []

        # Using relationship directly
        return [perm.name for perm in role_obj.permissions]

    def has_role(self, user: User, allowed_roles: List[str]) -> bool:
        if not user.role:
            return False
        return user.role in allowed_roles

    def has_permissions(
        self, db: Session, user: User, required_permissions: List[str]
    ) -> bool:
        if not user.role:
            return False
        # SYSTEM_ADMIN role inherently has all permissions
        if user.role == "SYSTEM_ADMIN":
            return True

        user_perms = self.get_user_permissions(db, user)
        # Check if all required permissions exist in user's permissions
        return all(p in user_perms for p in required_permissions)


rbac_repo = RBACRepository()
