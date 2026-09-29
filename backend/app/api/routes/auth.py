from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    hash_token,
    generate_otp,
)
from app.core.responses import success_response
from app.core.exceptions import AppException
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    OTPRequest,
    OTPVerify,
    PasswordResetConfirm,
)
from app.api.deps import get_current_active_user
from app.repositories.user_repository import user_repo
from app.repositories.auth_repository import refresh_token_repo, otp_repo

router = APIRouter()


@router.post("/register")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = user_repo.get_by_email(db, email=user_in.email)
    if existing:
        raise AppException(
            status_code=400,
            error_code="USER_EXISTS",
            message="User with this email already exists",
        )

    user = user_repo.create(
        db,
        obj_in={
            "email": user_in.email,
            "phone": user_in.phone,
            "hashed_password": get_password_hash(user_in.password),
            "role": user_in.role or "investor",
            "is_active": True,
        },
    )

    from app.services.audit_service import audit_service, AuditAction

    audit_service.log(
        db=db,
        actor_id=user.id,
        action=AuditAction.USER_REGISTER,
        entity_type="user",
        entity_id=str(user.id),
        after_data={"email": user.email, "role": user.role},
    )
    db.commit()

    return success_response(message="User registered successfully")


@router.post("/login")
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = user_repo.get_by_email(db, email=user_in.email)
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise AppException(
            status_code=401,
            error_code="INVALID_CREDENTIALS",
            message="Invalid email or password",
        )
    if not user.is_active:
        raise AppException(
            status_code=401,
            error_code="INACTIVE_USER",
            message="Inactive user",
        )

    # Portal isolation check
    if user_in.portal_type:
        expected_role = user_in.portal_type.upper()
        if user.role != expected_role:
            raise AppException(
                status_code=403,
                error_code="PORTAL_ACCESS_DENIED",
                message=f"Access denied: Your account cannot access the {user_in.portal_type} portal.",
            )

    access_token = create_access_token(subject=user.id)
    raw_refresh = create_refresh_token()

    refresh_token_repo.create(
        db,
        obj_in={
            "user_id": user.id,
            "token_hash": hash_token(raw_refresh),
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "revoked": False,
        },
    )

    from app.services.audit_service import audit_service, AuditAction

    audit_service.log(
        db=db,
        actor_id=user.id,
        action=AuditAction.USER_LOGIN,
        entity_type="user",
        entity_id=str(user.id),
    )
    db.commit()

    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": raw_refresh,
            "token_type": "bearer",
        },
        message="Login successful",
    )


from fastapi.security import OAuth2PasswordRequestForm


@router.post("/swagger-login", include_in_schema=False)
def swagger_login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Dedicated endpoint for Swagger UI Authorization button to work properly."""
    user = user_repo.get_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise AppException(
            status_code=401,
            error_code="INVALID_CREDENTIALS",
            message="Invalid email or password",
        )
    if not user.is_active:
        raise AppException(
            status_code=401,
            error_code="INACTIVE_USER",
            message="Inactive user",
        )

    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/logout")
def logout(refresh_token: str, db: Session = Depends(get_db)):
    token_h = hash_token(refresh_token)

    # We need the user_id for the audit log, let's get the token before revoking
    token_entry = refresh_token_repo.get(
        db, id=token_h
    )  # Note: ID is token_h in our model, or we can fetch by token_hash
    # Actually, the repo might not expose user easily this way. Let's get user by token_hash.
    from sqlalchemy import select
    from app.models.user import RefreshToken

    stmt = select(RefreshToken).where(RefreshToken.token_hash == token_h)
    token_entry = db.execute(stmt).scalar_one_or_none()

    revoked = refresh_token_repo.revoke_token(db, token_h)
    if not revoked:
        raise AppException(
            status_code=400,
            error_code="INVALID_TOKEN",
            message="Invalid or expired token",
        )

    if token_entry:
        from app.services.audit_service import audit_service, AuditAction

        audit_service.log(
            db=db,
            actor_id=token_entry.user_id,
            action=AuditAction.USER_LOGOUT,
            entity_type="user",
            entity_id=str(token_entry.user_id),
        )
        db.commit()

    return success_response(message="Logged out successfully")


@router.post("/otp/send")
def send_otp(req: OTPRequest, db: Session = Depends(get_db)):
    # Delivery stub — Shreya's notification service will replace this
    raw_otp = generate_otp()
    print(f"[STUB] Sending OTP {raw_otp} to {req.email}")  # Dev-only

    otp_repo.create(
        db,
        obj_in={
            "email": req.email,
            "otp_hash": get_password_hash(raw_otp),
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
        },
    )
    return success_response(message=f"OTP sent to {req.email}")


@router.post("/otp/verify")
def verify_otp(req: OTPVerify, db: Session = Depends(get_db)):
    otp_entry = otp_repo.get_latest_for_email(db, req.email)
    if not otp_entry or otp_entry.expires_at < datetime.now(timezone.utc):
        raise AppException(
            status_code=400,
            error_code="OTP_EXPIRED",
            message="OTP expired or not requested",
        )
    if otp_entry.attempts >= 3:
        raise AppException(
            status_code=400,
            error_code="OTP_ATTEMPTS_EXCEEDED",
            message="Too many failed attempts",
        )

    if not verify_password(req.otp, otp_entry.otp_hash):
        otp_entry.attempts += 1
        db.commit()
        raise AppException(
            status_code=400,
            error_code="OTP_INVALID",
            message="Invalid OTP",
        )

    otp_repo.delete(db, id=otp_entry.id)
    return success_response(message="OTP verified successfully")


@router.post("/forgot-password")
def forgot_password(req: OTPRequest, db: Session = Depends(get_db)):
    user = user_repo.get_by_email(db, req.email)
    if not user:
        # Don't reveal user existence
        return success_response(message="If an account exists, an OTP has been sent.")

    raw_otp = generate_otp()
    print(f"[STUB] Sending Password Reset OTP {raw_otp} to {req.email}")
    otp_repo.create(
        db,
        obj_in={
            "email": req.email,
            "otp_hash": get_password_hash(raw_otp),
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
        },
    )
    return success_response(message="If an account exists, an OTP has been sent.")


@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    otp_entry = otp_repo.get_latest_for_email(db, req.email)
    if (
        not otp_entry
        or otp_entry.expires_at < datetime.now(timezone.utc)
        or not verify_password(req.otp, otp_entry.otp_hash)
    ):
        raise AppException(
            status_code=400,
            error_code="INVALID_OTP",
            message="Invalid or expired OTP",
        )

    user = user_repo.get_by_email(db, req.email)
    if not user:
        raise AppException(
            status_code=404,
            error_code="USER_NOT_FOUND",
            message="User not found",
        )

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    otp_repo.delete(db, id=otp_entry.id)

    return success_response(message="Password reset successfully")


@router.get("/me")
def get_me(current_user=Depends(get_current_active_user)):
    user_data = UserResponse.model_validate(current_user).model_dump()
    return success_response(data=user_data, message="Current user retrieved")


# -----------------------------------------------------------------------------
# RBAC Example (For team reference)
# -----------------------------------------------------------------------------
from app.api.deps import RoleChecker


@router.get("/admin-only")
def admin_only_example(
    current_user=Depends(RoleChecker(["SYSTEM_ADMIN", "POLICY_ADMIN"]))
):
    """
    Example endpoint demonstrating how to restrict access to specific roles.
    """
    return success_response(message=f"Welcome Admin {current_user.email}!")
