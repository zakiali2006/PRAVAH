# Python equivalent of the frontend's mockData.js

STATS = [
    {"value": 119, "suffix": "", "label": "Services integrated", "icon": "FileCheck"},
    {"value": 16, "suffix": "", "label": "Departments onboarded", "icon": "Landmark"},
    {"value": 368219, "suffix": "", "label": "Applications received", "icon": "FileText"},
    {"value": 352297, "suffix": "", "label": "Applications disposed", "icon": "Check"},
]

SERVICE_GROUPS = [
    {"dept": "Directorate of Industries", "count": 14, "items": ["Udyog Aadhaar acknowledgement", "Entrepreneurs Memorandum Part-II", "Incentive eligibility certificate", "Registration under PSI 2019"]},
    {"dept": "MIDC", "count": 12, "items": ["Plot allotment", "Building plan approval", "Water connection", "Transfer of lease"]},
    {"dept": "Maharashtra Pollution Control Board", "count": 9, "items": ["Consent to establish", "Consent to operate", "Hazardous waste authorisation", "Renewal of consent"]},
    {"dept": "Directorate of Fire Services", "count": 6, "items": ["Provisional fire NOC", "Final fire NOC", "Renewal of fire NOC"]},
    {"dept": "Labour Department", "count": 15, "items": ["Factory plan approval", "Factory licence", "Contract labour licence", "Shops & establishment registration"]},
    {"dept": "MSEDCL", "count": 8, "items": ["New HT connection", "Load enhancement", "Electricity duty exemption"]},
    {"dept": "Revenue Department", "count": 11, "items": ["NA permission", "Land use conversion", "Tenure conversion"]},
    {"dept": "Urban Development", "count": 10, "items": ["Development permission", "Commencement certificate", "Occupancy certificate"]},
]

TALUKA_CAT = [
    {"code": "A", "label": "A — Developed (Mumbai, Thane belt)", "ceiling": 0, "years": 0},
    {"code": "B", "label": "B — Less developed", "ceiling": 30, "years": 7},
    {"code": "C", "label": "C — Less developed", "ceiling": 40, "years": 7},
    {"code": "D", "label": "D — Least developed", "ceiling": 50, "years": 10},
    {"code": "D+", "label": "D+ — Least developed", "ceiling": 70, "years": 10},
    {"code": "NID", "label": "No-industry district", "ceiling": 80, "years": 10},
    {"code": "NAX", "label": "Naxalism affected area", "ceiling": 100, "years": 10},
]

SECTORS = [
    {"key": "msme", "label": "MSME manufacturing", "bump": 0},
    {"key": "large", "label": "Large scale unit", "bump": -5},
    {"key": "mega", "label": "Mega / Ultra-mega project", "bump": 10},
    {"key": "textile", "label": "Textile & apparel", "bump": 5},
    {"key": "agro", "label": "Agro & food processing", "bump": 5},
    {"key": "ev", "label": "Electric vehicles & components", "bump": 10},
    {"key": "gh2", "label": "Green hydrogen & renewables", "bump": 15},
    {"key": "electronics", "label": "Electronics & semiconductors", "bump": 10},
]

TRACK_STAGES = [
    {"name": "Application submitted", "desc": "Common application form received and fee paid", "days": 0},
    {"name": "Scrutiny at nodal desk", "desc": "MAITRI nodal officer checks completeness", "days": 2},
    {"name": "Department processing", "desc": "Forwarded to Labour Dept — Joint Director (Industrial Safety)", "days": 7},
    {"name": "Site inspection", "desc": "Inspection scheduled and report uploaded", "days": 12},
    {"name": "Approval issued", "desc": "Digitally signed certificate available for download", "days": 21},
]

SECTOR_INVEST = [
    {"name": "Engineering", "value": 82400},
    {"name": "Chemicals", "value": 61200},
    {"name": "Textiles", "value": 38900},
    {"name": "Food proc.", "value": 34100},
    {"name": "Electronics", "value": 29600},
    {"name": "Auto & EV", "value": 71800},
]

MONTHLY = [
    {"m": "Apr", "received": 24100, "disposed": 22600},
    {"m": "May", "received": 26800, "disposed": 25400},
    {"m": "Jun", "received": 29300, "disposed": 27900},
    {"m": "Jul", "received": 31200, "disposed": 30100},
    {"m": "Aug", "received": 33600, "disposed": 32200},
    {"m": "Sep", "received": 35900, "disposed": 34800},
]

REGION_SPLIT = [
    {"name": "Pune division", "value": 31},
    {"name": "Konkan division", "value": 26},
    {"name": "Nashik division", "value": 17},
    {"name": "Nagpur division", "value": 14},
    {"name": "Aurangabad division", "value": 12},
]
