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

        print("Seeding Service Catalogue...")
        services = [
            {
                'code': 'MIDC-LAN-01',
                'department_code': 'MIDC',
                'name': 'Allotment of Industrial Plot / Shed in MIDC Areas',
                'processing_time_days': 30,
                'fee_amount': 150000.0,
                'description': 'Statutory allocation of developed industrial land across Class A, B, C, D MIDC estates in Maharashtra.',
                'sector': 'Pre-Establishment'
            },
            {
                'code': 'MPCB-CTE-04',
                'department_code': 'MPCB',
                'name': 'Consent to Establish (CTE) for Red / Orange Category',
                'processing_time_days': 45,
                'fee_amount': 50000.0,
                'description': 'Mandatory environmental clearance under Water (Prevention & Control of Pollution) Act and Air Act.',
                'sector': 'Pre-Establishment'
            },
            {
                'code': 'FIRE-NOC-02',
                'department_code': 'FIRE',
                'name': 'Provisional / Final Fire Safety No Objection Certificate',
                'processing_time_days': 30,
                'fee_amount': 85000.0,
                'description': 'Fire hazard clearance conforming to Maharashtra Fire Prevention and Life Safety Measures Act.',
                'sector': 'Pre-Establishment'
            },
            {
                'code': 'DISH-PLN-01',
                'department_code': 'DISH',
                'name': 'Factory Building Plan Approval & Registration of Factory License',
                'processing_time_days': 30,
                'fee_amount': 120000.0,
                'description': 'Statutory occupational health, worker safety, structural stability verification under The Factories Act, 1948.',
                'sector': 'Pre-Operation'
            },
            {
                'code': 'MSED-HT-01',
                'department_code': 'MSEDCL',
                'name': 'Sanction of High Tension (HT) 11kV/22kV/33kV Power Connection',
                'processing_time_days': 21,
                'fee_amount': 540000.0,
                'description': 'Dedicated feeder line clearance, bay allocation, and transformer capacity sanctioning.',
                'sector': 'Pre-Operation'
            },
            {
                'code': 'BOIL-REG-01',
                'department_code': 'BOILERS',
                'name': 'Boiler Registration & Steam Pipeline Plan Verification',
                'processing_time_days': 21,
                'fee_amount': 45000.0,
                'description': 'Hydraulic inspection and certification under the Indian Boilers Act, 1923.',
                'sector': 'Pre-Operation'
            },
            {
                'code': 'TREE-AUT-01',
                'department_code': 'TREE',
                'name': 'Tree Felling / Transplantation Clearance',
                'processing_time_days': 21,
                'fee_amount': 25000.0,
                'description': 'Maharashtra (Urban & Rural Areas) Protection & Preservation of Trees Act sanction.',
                'sector': 'Pre-Establishment'
            },
            {
                'code': 'WATER-IND-01',
                'department_code': 'WATER',
                'name': 'Industrial Bulk Water Connection Sanction',
                'processing_time_days': 14,
                'fee_amount': 60000.0,
                'description': 'Pipeline tapping and volumetric meter allocation from MIDC raw/treated reservoir.',
                'sector': 'Pre-Operation'
            }
        ]

        for svc in services:
            dept_id = dept_id_map.get(svc['department_code'])
            cur.execute("""
                INSERT INTO services (code, name, department_id, description, fee_amount, processing_time_days, sector) 
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, fee_amount = EXCLUDED.fee_amount;
            """, (svc['code'], svc['name'], dept_id, svc['description'], svc['fee_amount'], svc['processing_time_days'], svc['sector']))

        conn.commit()
        cur.close()
        conn.close()
        print("[SUCCESS] Database successfully seeded! You are ready to upload documents.")
    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")

if __name__ == "__main__":
    seed_database()
