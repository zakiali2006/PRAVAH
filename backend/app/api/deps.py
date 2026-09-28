from typing import Generator
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.models.user import User
from app.repositories.user_repository import user_repo

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/auth/swagger-login")


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException(message="Could not validate credentials")
    except JWTError:
        raise UnauthorizedException(message="Could not validate credentials")

    user = user_repo.get(db, id=int(user_id))
    if not user:
        raise UnauthorizedException(message="User not found")
    return user


from fastapi.security.utils import get_authorization_scheme_param
from fastapi import Request

def get_optional_user(
    request: Request, db: Session = Depends(get_db)
) -> User | None:
    authorization = request.headers.get("Authorization")
    scheme, token = get_authorization_scheme_param(authorization)
    if not authorization or scheme.lower() != "bearer":
        return None
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None

    user = user_repo.get(db, id=int(user_id))
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise UnauthorizedException(message="Inactive user")
    return current_user


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_active_user)) -> User:
        from app.repositories.rbac_repository import rbac_repo

        if not rbac_repo.has_role(user, self.allowed_roles):
            from app.core.exceptions import AppException

            raise AppException(
                status_code=403,
                error_code="FORBIDDEN",
                message="You do not have the required role to perform this action.",
            )
        return user


class PermissionChecker:
    def __init__(self, required_permissions: list[str]):
        self.required_permissions = required_permissions

    def __call__(
        self,
        user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db),
    ) -> User:
        from app.repositories.rbac_repository import rbac_repo

        if not rbac_repo.has_permissions(db, user, self.required_permissions):
            from app.core.exceptions import AppException

            raise AppException(
                status_code=403,
                error_code="FORBIDDEN",
                message="You do not have the required permissions to perform this action.",
            )
        return user
