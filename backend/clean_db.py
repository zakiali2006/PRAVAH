from app.core.database import SessionLocal; from app.models.document import Document; db = SessionLocal(); db.query(Document).delete(); db.commit()
