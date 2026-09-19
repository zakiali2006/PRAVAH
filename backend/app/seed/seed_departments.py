"""
Seed Departments Module
Seeds core government departments into the database. Idempotent.
"""

from sqlalchemy.orm import Session
from app.models.rbac import Department

DEPARTMENTS = [
    {"name": "Industries", "code": "IND", "description": "Department of Industries"},
    {"name": "Revenue", "code": "REV", "description": "Department of Revenue"},
    {"name": "Environment", "code": "ENV", "description": "Department of Environment"},
    {
        "name": "Urban Development",
        "code": "UD",
        "description": "Department of Urban Development",
    },
    {"name": "Labour", "code": "LAB", "description": "Department of Labour"},
    {
        "name": "Fire & Safety",
        "code": "FIRE",
        "description": "Fire & Safety Department",
    },
    {
        "name": "Pollution Control",
        "code": "PCB",
        "description": "Pollution Control Board",
    },
    {
        "name": "Electricity",
        "code": "ELEC",
        "description": "Electricity Supply Department",
    },
    {"name": "Water Supply", "code": "WATER", "description": "Water Supply Department"},
    {
        "name": "Town Planning",
        "code": "TP",
        "description": "Town Planning & Valuation",
    },
]


def seed_departments(db: Session):
    print("Seeding departments...")
    created = 0
    for dept_data in DEPARTMENTS:
        existing = (
            db.query(Department).filter(Department.code == dept_data["code"]).first()
        )
        if existing:
            print(f"  [SKIP] {dept_data['name']} already exists.")
            continue

        dept = Department(
            name=dept_data["name"],
            code=dept_data["code"],
            description=dept_data["description"],
        )
        db.add(dept)
        created += 1
        print(f"  [CREATE] {dept_data['name']} ({dept_data['code']})")

    db.commit()
    print(
        f"Department seeding complete. Created {created}, skipped {len(DEPARTMENTS) - created}."
    )
