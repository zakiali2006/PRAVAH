"""
Development-only utility to fully reset and rebuild the database from
SQLAlchemy models, bypassing Alembic migration conflicts.
"""
from app.core.database import engine, Base
import app.models  # noqa - ensures all models are imported

if __name__ == "__main__":
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables from models...")
    Base.metadata.create_all(bind=engine)
    print("Database rebuilt successfully from models.")
