from app.core.database import SessionLocal
from sqlalchemy import text

def clear_apps():
    db = SessionLocal()
    try:
        db.execute(text("TRUNCATE TABLE applications CASCADE;"))
        db.execute(text("TRUNCATE TABLE documents CASCADE;"))
        db.commit()
        print("Deleted all applications and documents for a fresh start.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_apps()
