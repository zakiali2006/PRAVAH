"""
Seed Users Module
Seeds demo user accounts into the database. Idempotent — skips users that already exist.
"""

from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User

DEMO_USERS = [
    {
        "email": "demo@gmail.com",
        "password": "demo123",
        "role": "INVESTOR",
        "is_active": True,
    },
    {
        "email": "officer@gov.in",
        "password": "admin123",
        "role": "OFFICER",
        "is_active": True,
    },
    {
        "email": "policy@pravah.gov.in",
        "password": "admin123",
        "role": "POLICY_ADMIN",
        "is_active": True,
    },
]


def seed_users(db: Session):
    print("Seeding demo users...")
    created = 0
    for user_data in DEMO_USERS:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            print(f"  [SKIP] {user_data['email']} already exists.")
            continue

        user = User(
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            role=user_data["role"],
            is_active=user_data["is_active"],
        )
        db.add(user)
        created += 1
        print(f"  [CREATE] {user_data['email']} ({user_data['role']})")

    db.commit()
    print(
        f"User seeding complete. Created {created}, skipped {len(DEMO_USERS) - created}."
    )
