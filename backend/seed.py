import psycopg2
from app.core.config import settings

def seed_database():
    print(f"Connecting to database at {settings.DATABASE_URL}...")
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        cur = conn.cursor()

        print("Seeding Document Types...")
        cur.execute("""
            INSERT INTO document_types (id, name, description) 
            VALUES 
                (1, 'Incorporation Certificate', 'Company incorporation certificate'),
                (2, 'Utility Bill', 'Proof of address utility bill'),
                (3, 'Bank Statement', 'Recent bank statement')
            ON CONFLICT (id) DO NOTHING;
        """)

        print("Seeding Demo Users...")
        from app.core.security import get_password_hash
        default_pwd = get_password_hash("password123")
        
        cur.execute("""
            INSERT INTO users (id, email, hashed_password, role, is_active) 
            VALUES 
                (1, 'test@acme.com', 'dummyhash', 'BUSINESS')
            ON CONFLICT (id) DO NOTHING;
        """)

        conn.commit()
        cur.close()
        conn.close()
        print("[SUCCESS] Database successfully seeded! You are ready to upload documents.")
    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")

if __name__ == "__main__":
    seed_database()
