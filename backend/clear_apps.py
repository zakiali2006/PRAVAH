from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

engine = create_engine("postgresql://user:password@localhost:5432/pravah_db")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()
db.execute(text("TRUNCATE applications CASCADE"))
db.commit()
db.close()
print("All applications deleted via cascade!")
