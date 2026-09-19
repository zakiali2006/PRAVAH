from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import RefreshToken, OTPVerification
from app.repositories.base import BaseRepository


class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def get_valid_token(self, db: Session, token_hash: str) -> Optional[RefreshToken]:
        stmt = select(self.model).where(
            self.model.token_hash == token_hash,
            self.model.revoked.is_(False),
            self.model.expires_at > datetime.now(timezone.utc),
        )
        return db.execute(stmt).scalar_one_or_none()

    def revoke_token(self, db: Session, token_hash: str) -> bool:
        token = self.get_valid_token(db, token_hash)
        if token:
            token.revoked = True
            db.commit()
            return True
        return False


class OTPVerificationRepository(BaseRepository[OTPVerification]):
    def get_latest_for_email(
        self, db: Session, email: str
    ) -> Optional[OTPVerification]:
        stmt = (
            select(self.model)
            .where(self.model.email == email)
            .order_by(self.model.created_at.desc())
        )
        return db.execute(stmt).scalars().first()


refresh_token_repo = RefreshTokenRepository(RefreshToken)
otp_repo = OTPVerificationRepository(OTPVerification)
