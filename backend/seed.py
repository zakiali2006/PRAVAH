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
        default_pwd = get_password_hash("PravahTest!2026")
        
        cur.execute("""
            INSERT INTO users (id, email, hashed_password, role, is_active) 
            VALUES 
                (1, 'investor@demo.com', %s, 'INVESTOR', true),
                (3, 'officer@demo.com', %s, 'OFFICER', true),
                (4, 'policy@demo.com', %s, 'POLICY_ADMIN', true)
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                role = EXCLUDED.role,
                hashed_password = EXCLUDED.hashed_password;
        """, (default_pwd, default_pwd, default_pwd))

        conn.commit()

        print("Seeding Departments...")
        departments_data = [
            {'name': 'MIDC', 'code': 'MIDC'},
            {'name': 'Maharashtra Pollution Control Board (MPCB)', 'code': 'MPCB'},
            {'name': 'Directorate of Maharashtra Fire Services', 'code': 'FIRE'},
            {'name': 'DISH (Directorate of Industrial Safety & Health)', 'code': 'DISH'},
            {'name': 'MSEDCL', 'code': 'MSEDCL'},
            {'name': 'DISH / Boilers', 'code': 'BOILERS'},
            {'name': 'Tree Authority', 'code': 'TREE'},
            {'name': 'MIDC / Water Works', 'code': 'WATER'},
        ]
        
        dept_id_map = {}
        for idx, dept in enumerate(departments_data, start=1):
            cur.execute("""
                INSERT INTO departments (id, name, code, description)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
                RETURNING id;
            """, (idx, dept['name'], dept['code'], ''))
            dept_id_map[dept['code']] = cur.fetchone()[0]
            
        conn.commit()

        print("Seeding Service Catalogue skipped (mock data removed).")
        # Removed service seeding to avoid mock data
        cur.close()
        conn.close()
        print("[SUCCESS] Database successfully seeded! You are ready to upload documents.")
    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")

if __name__ == "__main__":
    seed_database()
