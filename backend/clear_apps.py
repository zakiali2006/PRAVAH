from app.core.database import SessionLocal
from sqlalchemy import text

def clear_apps():
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM tracking_stages;"))
        db.execute(text("DELETE FROM application_risk_scores;"))
        db.execute(text("DELETE FROM application_documents;"))
        db.execute(text("DELETE FROM applications;"))
        db.commit()
        print("Deleted all applications and all associated records.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_apps()
