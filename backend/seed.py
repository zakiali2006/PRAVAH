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

        print("Seeding Demo Applications for Officer...")
        cur.execute("""
            INSERT INTO applications (id, user_id, service_name, applicant_name, status, is_draft, urgency, ai_score, assigned_officer_id)
            VALUES 
                ('APP/2026/109EC4BE', 1, 'Business', 'Vinayak', 'pending', false, 'normal', 30.0, 3),
                ('APP/2026/9A3FED95', 1, 'Business', 'Vinayak', 'pending', false, 'normal', 30.0, 3),
                ('APP/2026/2F7B01A6', 1, 'Environmental Clearance', 'Vinayak', 'in_review', false, 'normal', 30.0, 3)
            ON CONFLICT (id) DO NOTHING;
        """)

        conn.commit()

        print("Seeding Demo Documents for Officer Review...")
        cur.execute("""
            INSERT INTO documents (id, filename, original_name, mime_type, size_bytes, file_path, status, validation_status, validation_reason, document_type_id, uploader_id, created_at, updated_at, extracted_data)
            VALUES 
                (1, 'Resume_Mock.pdf', 'Resume.pdf', 'application/pdf', 1048576, '/mock/resume.pdf', 'INVALID', 'INVALID', 'Document appears authentic. Text extraction successful. No signs of tampering detected.', 1, 1, '2026-09-27 10:00:00', '2026-09-27 10:00:00', '{"verification": {"confidence": 0.45}}')
            ON CONFLICT (id) DO UPDATE SET extracted_data = EXCLUDED.extracted_data;
        """)

        conn.commit()
        cur.close()
        conn.close()
        print("[SUCCESS] Database successfully seeded! You are ready to upload documents.")
    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")

if __name__ == "__main__":
    seed_database()
