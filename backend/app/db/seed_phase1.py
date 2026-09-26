import os
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.user import User
from app.models.business import BusinessProfile, FactoryUnit
from app.models.document import DocumentType
from app.models.service import Service
from app.models.payment import Payment
from app.models.query import DepartmentQuery
from app.models.grievance import Grievance
from app.models.feedback import Feedback
from app.models.consultation import PublicConsultation, ConsultationComment
from app.models.delegation import UserDelegation
from app.models.application import Application

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost:5432/pravah_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("Seeding database...")

with engine.begin() as conn:
    for tbl in ['document_types', 'business_profiles', 'factory_units', 'services', 'payments', 'department_queries', 'grievances', 'feedbacks', 'public_consultations', 'consultation_comments', 'user_delegations']:
        try:
            conn.execute(text(f"SELECT setval('{tbl}_id_seq', COALESCE((SELECT MAX(id) FROM {tbl}), 0) + 1, false);"))
        except Exception:
            pass

# 1. Seed Document Types
doc_types = [
    ("Certificate of Incorporation", "Ministry of Corporate Affairs / Registrar of Companies Incorporation Certificate"),
    ("PAN Card", "Permanent Account Number issued by Income Tax Department"),
    ("Aadhaar Card (Masked)", "UIDAI Verified Identity Proof of Authorized Signatory"),
    ("Factory Plan / Layout Drawing", "Architectural and machinery layout approved by certified structural engineer"),
    ("Environmental Audit Report", "MPCB Consent / Environmental assessment report"),
    ("Electricity Feasibility Certificate", "MSEDCL sanctioned power feasibility sanction"),
    ("Fire Safety Plan", "Fire prevention and life safety system layout for Fire NOC"),
    ("Water Supply NOC", "MIDC / Water Resources Department quota allocation letter"),
]
for name, desc in doc_types:
    existing = db.query(DocumentType).filter(DocumentType.name == name).first()
    if not existing:
        db.add(DocumentType(name=name, description=desc))
        db.commit()
print("Document types seeded.")

# 2. Seed Services Catalog
services_data = [
    {
        "code": "MPCB-CTE-04",
        "title": "Consent to Establish (CTE) under Water & Air Act",
        "department": "MPCB",
        "sub_department": "Maharashtra Pollution Control Board",
        "description": "Statutory environmental consent required prior to commencing any factory construction or setup.",
        "category": "Pre-Establishment",
        "timeline_days": 30,
        "fee_inr": 25000.0,
        "documents_required": ["Certificate of Incorporation", "Factory Plan / Layout Drawing", "Environmental Audit Report"]
    },
    {
        "code": "MIDC-LAN-01",
        "title": "Allotment of Industrial Plot / Land Lease",
        "department": "MIDC",
        "sub_department": "Maharashtra Industrial Development Corporation",
        "description": "Direct allotment of industrial plot in designated MIDC industrial parks.",
        "category": "Pre-Establishment",
        "timeline_days": 15,
        "fee_inr": 15000.0,
        "documents_required": ["Certificate of Incorporation", "PAN Card"]
    },
    {
        "code": "DISH-PLN-01",
        "title": "Factory Building Plan & Machinery Layout Approval",
        "department": "Labour / DISH",
        "sub_department": "Directorate of Industrial Safety and Health",
        "description": "Statutory approval under Maharashtra Factories Rules for building plans and plant machinery.",
        "category": "Pre-Establishment",
        "timeline_days": 21,
        "fee_inr": 8000.0,
        "documents_required": ["Factory Plan / Layout Drawing", "Certificate of Incorporation"]
    },
    {
        "code": "FIRE-NOC-02",
        "title": "Provisional / Final Fire Safety NOC",
        "department": "Fire Department",
        "sub_department": "Maharashtra Fire Services",
        "description": "Life safety and firefighting system compliance clearance.",
        "category": "Pre-Establishment",
        "timeline_days": 14,
        "fee_inr": 12000.0,
        "documents_required": ["Fire Safety Plan", "Factory Plan / Layout Drawing"]
    },
    {
        "code": "MSED-HT-01",
        "title": "High Tension (HT) Electricity Connection (11kV / 22kV / 33kV)",
        "department": "Energy Department",
        "sub_department": "MSEDCL (Mahavitaran)",
        "description": "Sanction and energization of bulk high tension electricity line from transmission substation.",
        "category": "Pre-Operation",
        "timeline_days": 20,
        "fee_inr": 40000.0,
        "documents_required": ["Electricity Feasibility Certificate", "Certificate of Incorporation"]
    },
    {
        "code": "WATER-IND-01",
        "title": "Industrial Water Supply Sanction & Pipeline Tie-in",
        "department": "MIDC",
        "sub_department": "Water Supply Division",
        "description": "Commercial water connection agreement and daily consumption quota allotment.",
        "category": "Pre-Operation",
        "timeline_days": 12,
        "fee_inr": 10000.0,
        "documents_required": ["Water Supply NOC"]
    },
    {
        "code": "BOIL-REG-01",
        "title": "Registration & Inspection of Industrial Steam Boilers",
        "department": "Energy Department",
        "sub_department": "Directorate of Steam Boilers",
        "description": "Statutory certification under Indian Boilers Act for steam generation units.",
        "category": "Pre-Operation",
        "timeline_days": 15,
        "fee_inr": 7500.0,
        "documents_required": ["Factory Plan / Layout Drawing"]
    },
    {
        "code": "LABOUR-REG-01",
        "title": "Registration under Building & Other Construction Workers Act",
        "department": "Labour Department",
        "sub_department": "Commissioner of Labour",
        "description": "Establishment registration for construction and industrial worker safety welfare.",
        "category": "Pre-Establishment",
        "timeline_days": 7,
        "fee_inr": 2500.0,
        "documents_required": ["Certificate of Incorporation"]
    }
]

for s in services_data:
    existing = db.query(Service).filter(Service.code == s["code"]).first()
    if not existing:
        db.add(Service(**s))
db.commit()
print("Services catalog seeded.")

# 3. Seed Public Consultations
consultations_data = [
    {
        "code": "PC-2026-CHAKAN",
        "project_title": "Environmental Public Hearing for Chakan Phase II Industrial Expansion",
        "applicant_name": "MIDC Maharashtra",
        "department": "Environment / MPCB",
        "eia_summary": "Proposed environmental clearance for automotive manufacturing, lithium battery packaging, and ancillary precision engineering park over 650 hectares in Khed Taluka, District Pune. Includes 10 MLD CETP with Zero Liquid Discharge (ZLD) systems.",
        "venue": "Chakan MIDC Nodal Office Conference Hall",
        "location": "Pune",
        "hearing_date": "15 October 2026",
        "status": "Open for Representation"
    },
    {
        "code": "PC-2026-AURIC",
        "project_title": "Public Consultation for Green Ammonia & Precision Chemical Terminal",
        "applicant_name": "AURIC DMIC Project",
        "department": "Environment / MPCB",
        "eia_summary": "Statutory EIA hearing under MoEFCC notification for zero-emission bulk chemical packaging and storage terminal in AURIC Shendra Industrial Township.",
        "venue": "AURIC Hall Auditorium, Shendra",
        "location": "Chhatrapati Sambhajinagar",
        "hearing_date": "28 October 2026",
        "status": "Open for Representation"
    }
]

for pc in consultations_data:
    existing = db.query(PublicConsultation).filter(PublicConsultation.code == pc["code"]).first()
    if not existing:
        db.add(PublicConsultation(**pc))
db.commit()
print("Public consultations seeded.")

# 4. Ensure demo investor has BusinessProfile and Factory Units
investor = db.query(User).filter(User.email == "investor@demo.com").first()
if investor:
    bp = db.query(BusinessProfile).filter(BusinessProfile.user_id == investor.id).first()
    if not bp:
        bp = BusinessProfile(
            user_id=investor.id,
            company_name="Sahyadri Precision & EV Technologies Pvt Ltd",
            pan_number="AAACT2001A",
            cin_number="U29100MH2021PTC123456",
            gstin="27AAACT2001A1Z5",
            industry_sector="Automotive & Engineering",
            registration_type="Private Limited Company",
            address="Plot E-14/3, Chakan Industrial Phase II",
            city="Pune",
            state="Maharashtra",
            pincode="410501",
            authorized_signatory="Anand Kulkarni",
            contact_email="regulatory@sahyadri.com",
            contact_phone="+91 98220 54321"
        )
        db.add(bp)
        db.commit()
        db.refresh(bp)
    else:
        # Update existing profile with complete details
        bp.company_name = "Sahyadri Precision & EV Technologies Pvt Ltd"
        bp.pan_number = "AAACT2001A"
        bp.cin_number = "U29100MH2021PTC123456"
        bp.gstin = "27AAACT2001A1Z5"
        bp.industry_sector = "Automotive & Engineering"
        bp.registration_type = "Private Limited Company"
        bp.address = "Plot E-14/3, Chakan Industrial Phase II"
        bp.city = "Pune"
        bp.state = "Maharashtra"
        bp.pincode = "410501"
        bp.authorized_signatory = "Anand Kulkarni"
        bp.contact_email = "regulatory@sahyadri.com"
        bp.contact_phone = "+91 98220 54321"
        db.commit()

    # Factory Units
    unit1 = db.query(FactoryUnit).filter(FactoryUnit.business_id == bp.id, FactoryUnit.unit_name == "Pune Battery Packaging Facility").first()
    if not unit1:
        unit1 = FactoryUnit(
            business_id=bp.id,
            unit_name="Pune Battery Packaging Facility",
            midc_area="Chakan Industrial Phase II",
            plot_number="Plot E-14/3",
            survey_number="Survey 384/2B",
            taluka="Khed",
            district="Pune",
            category="Orange",
            power_sanctioned_kva=1500,
            water_demand_kld=50,
            built_up_area_sqm=12000,
            land_area_sqm=25000,
            operational_status="Under Construction",
            investment_amount=120000000,
            employment_count=350,
            midc_plot_number="Plot E-14/3",
            location_district="Pune"
        )
        db.add(unit1)

    unit2 = db.query(FactoryUnit).filter(FactoryUnit.business_id == bp.id, FactoryUnit.unit_name == "Chakan EV Assembly Plant").first()
    if not unit2:
        unit2 = FactoryUnit(
            business_id=bp.id,
            unit_name="Chakan EV Assembly Plant",
            midc_area="Chakan Industrial Phase II",
            plot_number="Plot F-12",
            survey_number="Survey 210/1",
            taluka="Khed",
            district="Pune",
            category="Red",
            power_sanctioned_kva=5000,
            water_demand_kld=150,
            built_up_area_sqm=38000,
            land_area_sqm=65000,
            operational_status="Operational",
            investment_amount=450000000,
            employment_count=850,
            midc_plot_number="Plot F-12",
            location_district="Pune"
        )
        db.add(unit2)
    db.commit()
    print("Factory units seeded.")

    # Payments
    pay1 = db.query(Payment).filter(Payment.challan_number == "CHL-2026-9812").first()
    if not pay1:
        db.add(Payment(
            challan_number="CHL-2026-9812",
            user_id=investor.id,
            service_name="Consent to Establish (CTE) - MPCB",
            department="MPCB",
            amount=25000.0,
            status="PAID",
            payment_mode="NetBanking",
            transaction_ref="GRAS-2026-MH-782194",
            paid_at=datetime.now(timezone.utc)
        ))

    pay2 = db.query(Payment).filter(Payment.challan_number == "CHL-2026-9844").first()
    if not pay2:
        db.add(Payment(
            challan_number="CHL-2026-9844",
            user_id=investor.id,
            service_name="Factory Building Plan Approval - DISH",
            department="DISH",
            amount=8000.0,
            status="PENDING",
            payment_mode="NetBanking"
        ))
    db.commit()
    print("Payments seeded.")

    # Department Queries
    app = db.query(Application).filter(Application.user_id == investor.id).first()
    app_id = app.id if app else "APP/2026/7E1E8F48"

    q1 = db.query(DepartmentQuery).filter(DepartmentQuery.query_id == "QRY-2026-004").first()
    if not q1:
        db.add(DepartmentQuery(
            query_id="QRY-2026-004",
            application_id=app_id,
            user_id=investor.id,
            department="MPCB",
            officer_name="Dr. S. Patil (Sub-Regional Officer)",
            query_subject="Effluent Treatment Plant (ETP) Specification Clarification",
            query_detail="Please furnish detailed engineering drawings for the proposed tertiary effluent treatment system and clarify compliance with Zero Liquid Discharge (ZLD) norms for D+ zone.",
            status="pending_applicant"
        ))

    q2 = db.query(DepartmentQuery).filter(DepartmentQuery.query_id == "QRY-2026-001").first()
    if not q2:
        db.add(DepartmentQuery(
            query_id="QRY-2026-001",
            application_id=app_id,
            user_id=investor.id,
            department="DISH",
            officer_name="R. M. Deshmukh (Inspector of Factories)",
            query_subject="Fire Exit Width Verification",
            query_detail="Clarify fire egress corridor width on the ground floor assembly bay per NBC 2016.",
            status="replied",
            applicant_reply="Corridor width updated to 2.5 meters as shown in revised architectural drawing Revision C attached.",
            replied_at=datetime.now(timezone.utc)
        ))
    db.commit()
    print("Department queries seeded.")

    # Grievances
    g1 = db.query(Grievance).filter(Grievance.ticket_id == "GRV-2026-07741").first()
    if not g1:
        db.add(Grievance(
            ticket_id="GRV-2026-07741",
            user_id=investor.id,
            name="Anand Kulkarni",
            email="regulatory@sahyadri.com",
            phone="+91 98220 54321",
            department="Energy Department",
            application_id=app_id,
            issue_type="Timeline Delay Past RTS Limit",
            detail="Feasibility inspection for 1500 kVA HT power line was due within 15 days under Maharashtra RTS Act, but no inspection has been conducted after 22 days.",
            status="In Progress",
            resolution_notes="Escalated to Superintending Engineer (Pune Rural). Site inspection scheduled for Monday."
        ))
    db.commit()
    print("Grievances seeded.")

    # User Delegations
    del1 = db.query(UserDelegation).filter(UserDelegation.owner_user_id == investor.id).first()
    if not del1:
        db.add(UserDelegation(
            owner_user_id=investor.id,
            delegate_email="finance@sahyadri.com",
            delegate_name="Neha Joshi",
            role="TRANSACTIONAL_USER",
            permissions=["applications.read", "documents.upload", "payments.pay"],
            is_active=True
        ))
    db.commit()
    print("User delegations seeded.")

print("All Phase 1 data successfully seeded into pravah_db!")
