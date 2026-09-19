from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        stmt = select(self.model).where(self.model.email == email)
        return db.execute(stmt).scalar_one_or_none()


user_repo = UserRepository(User)
