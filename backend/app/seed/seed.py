import logging
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.application import Application
from app.models.stage import Stage
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_database():
    logger.info("Resetting PostgreSQL database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("Database reset complete.")

def seed_demo_data():
    db: Session = SessionLocal()
    try:
        # 1. Demo Users
        investor = User(
            email="demo@gmail.com",
            hashed_password=get_password_hash("password123"),
            role="investor"
        )
        officer = User(
            email="officer@gov.in",
            hashed_password=get_password_hash("admin123"),
            role="officer"
        )
        db.add(investor)
        db.add(officer)
        db.commit()
        db.refresh(investor)
        
        # 2. Demo Applications
        app1 = Application(
            id="MTR/2026/001",
            user_id=investor.id,
            service_name="Land Allotment Phase 1",
            applicant_name="Acme Corp Ltd",
            status="approved",
            is_draft=False,
            urgency="normal",
            ai_score=1.5,
            submitted_at=datetime.utcnow() - timedelta(days=20)
        )
        
        app2 = Application(
            id="MTR/2026/002",
            user_id=investor.id,
            service_name="Fire NOC Approval",
            applicant_name="Acme Corp Ltd",
            status="pending",
            is_draft=False,
            urgency="critical",
            ai_score=4.8, # high SLA risk
            submitted_at=datetime.utcnow() - timedelta(days=14)
        )
        
        db.add(app1)
        db.add(app2)
        db.commit()
        db.refresh(app1)
        db.refresh(app2)

        # 3. Tracking Stages for app2 (Fire NOC)
        stages = [
            Stage(application_id=app2.id, name="Document Verification", status="completed", days=2, statutory_limit=3),
            Stage(application_id=app2.id, name="Site Inspection", status="in_progress", days=12, statutory_limit=7), # delayed
            Stage(application_id=app2.id, name="Final CFO Approval", status="pending", days=0, statutory_limit=5)
        ]
        db.add_all(stages)
        db.commit()
        
        logger.info("Successfully seeded PostgreSQL with PRAVAH mock data.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
    seed_demo_data()
