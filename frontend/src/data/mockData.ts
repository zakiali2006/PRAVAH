import {
  UserProfile, FactoryUnit, ApplicationItem, DocumentItem,
  ComplianceItem, RegulatoryCircular, SchemeBenefit, GrievanceItem,
  DepartmentQuery, PaymentChallan, FraudAlert, AuditLog, PublicConsultation
} from '../types';

export const INITIAL_USERS: Record<string, UserProfile> = {
  'user_1': {
    id: 'user_1',
    name: 'Tata Motors Maharashtra Assembly Unit',
    email: 'regulatory.affairs@tatamotors.com',
    phone: '+91 98230 11223',
    type: 'citizen',
    industry: 'Automotive & Heavy Manufacturing',
    panNumber: 'AAACT2001A',
    gstin: '27AAACT2001A1Z5',
    district: 'Pune (Chakan MIDC)',
    investment: '₹ 450 Crores',
    employment: 1200,
    designation: 'VP - Industrial Infrastructure'
  },
  'user_2': {
    id: 'user_2',
    name: 'Sahyadri Agri Processing Pvt Ltd',
    email: 'compliance@sahyadriagro.in',
    phone: '+91 94222 55441',
    type: 'citizen',
    industry: 'Food Processing & Agribusiness',
    panNumber: 'AALCS9912B',
    gstin: '27AALCS9912B1Z1',
    district: 'Nashik (Dindori MIDC)',
    investment: '₹ 18 Crores',
    employment: 85,
    designation: 'Managing Director'
  },
  'officer_1': {
    id: 'officer_1',
    name: 'Dr. S. K. Patil',
    email: 'sk.patil@maharashtra.gov.in',
    phone: '+91 20 2550 4400',
    type: 'officer',
    department: 'MIDC / Directorate of Industries',
    designation: 'Senior Nodal Clearance Officer & Joint Director'
  },
  'officer_2': {
    id: 'officer_2',
    name: 'Er. Rajesh Deshmukh',
    email: 'r.deshmukh@mpcb.gov.in',
    phone: '+91 20 2581 1234',
    type: 'officer',
    department: 'Maharashtra Pollution Control Board (MPCB)',
    designation: 'Regional Officer (Pollution Clearance)'
  }
};

export const INITIAL_FACTORY_UNITS: FactoryUnit[] = [
  {
    id: 'UNIT-PUN-01',
    userId: 'user_1',
    unitName: 'Chakan Assembly Line IV (EV & Commercial)',
    midcArea: 'Chakan Industrial Phase II',
    plotNumber: 'Plot E-14/2',
    surveyNumber: 'Survey 384/2A',
    taluka: 'Khed',
    district: 'Pune',
    category: 'Red',
    powerSanctionedKva: 8500,
    waterDemandKl: 240,
    builtUpAreaSqM: 42000,
    operationalStatus: 'Under Construction'
  },
  {
    id: 'UNIT-NAS-02',
    userId: 'user_2',
    unitName: 'Sahyadri Packhouse & Cold Chain Facility',
    midcArea: 'Dindori Agri-Food Park',
    plotNumber: 'Plot F-9',
    surveyNumber: 'Survey 112/1',
    taluka: 'Dindori',
    district: 'Nashik',
    category: 'Orange',
    powerSanctionedKva: 450,
    waterDemandKl: 60,
    builtUpAreaSqM: 6500,
    operationalStatus: 'Operational'
  }
];

export const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'APP-1001',
    userId: 'user_1',
    unitId: 'UNIT-PUN-01',
    name: 'Land Allotment & Possession Order',
    serviceCode: 'MIDC-LAN-01',
    department: 'MIDC',
    status: 'approved',
    submittedAt: '2026-06-10',
    approvedAt: '2026-06-28',
    slaDays: 30,
    dependencies: [],
    parallelGroup: 'Phase-1',
    feeAmount: 150000,
    feePaid: true,
    assignedOfficerId: 'officer_1',
    scrutinyNotes: ['All plot survey demarcation coordinates verified against Chakan Phase II master DP.']
  },
  {
    id: 'APP-1002',
    userId: 'user_1',
    unitId: 'UNIT-PUN-01',
    name: 'Consent to Establish (CTE - Red Category)',
    serviceCode: 'MPCB-CTE-04',
    department: 'Maharashtra Pollution Control Board (MPCB)',
    status: 'approved',
    submittedAt: '2026-07-01',
    approvedAt: '2026-07-25',
    slaDays: 45,
    dependencies: ['APP-1001'],
    parallelGroup: 'Phase-2',
    feeAmount: 375000,
    feePaid: true,
    assignedOfficerId: 'officer_2',
    scrutinyNotes: ['ETP and STP plant capacity 300 KLD compliant with Zero Liquid Discharge (ZLD) conditions.']
  },
  {
    id: 'APP-1003',
    userId: 'user_1',
    unitId: 'UNIT-PUN-01',
    name: 'Fire No Objection Certificate (Provisional NOC)',
    serviceCode: 'FIRE-NOC-02',
    department: 'Directorate of Maharashtra Fire Services',
    status: 'action_required',
    submittedAt: '2026-08-01',
    slaDays: 30,
    dependencies: ['APP-1001'],
    parallelGroup: 'Phase-2',
    feeAmount: 85000,
    feePaid: true,
    rejectionReason: 'Architect blueprint resolution illegible (< 300 DPI). Structural engineer digital signature unverified.',
    assignedOfficerId: 'officer_1'
  },
  {
    id: 'APP-1004',
    userId: 'user_1',
    unitId: 'UNIT-PUN-01',
    name: 'Factory Building Plan Approval & Safety License',
    serviceCode: 'DISH-PLN-01',
    department: 'DISH (Directorate of Industrial Safety & Health)',
    status: 'pending',
    submittedAt: '2026-08-12',
    slaDays: 30,
    dependencies: ['APP-1002', 'APP-1003'],
    parallelGroup: 'Phase-3',
    feeAmount: 120000,
    feePaid: true,
    assignedOfficerId: 'officer_1'
  },
  {
    id: 'APP-1005',
    userId: 'user_1',
    unitId: 'UNIT-PUN-01',
    name: 'High Tension (HT) 33kV Power Connection Sanction',
    serviceCode: 'MSED-HT-01',
    department: 'MSEDCL',
    status: 'locked',
    submittedAt: null,
    slaDays: 21,
    dependencies: ['APP-1004'],
    parallelGroup: 'Phase-4',
    feeAmount: 540000,
    feePaid: false
  },
  {
    id: 'APP-1006',
    userId: 'user_1',
    unitId: 'UNIT-PUN-01',
    name: 'Consent to Operate (CTO) & Hazardous Waste Auth',
    serviceCode: 'MPCB-CTO-01',
    department: 'MPCB',
    status: 'locked',
    submittedAt: null,
    slaDays: 45,
    dependencies: ['APP-1004', 'APP-1005'],
    parallelGroup: 'Phase-5',
    feeAmount: 250000,
    feePaid: false
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'DOC-101',
    userId: 'user_1',
    type: 'Land Allotment Letter',
    category: 'Legal',
    status: 'verified',
    expiry: 'N/A',
    uploadDate: '2026-06-10',
    fileSize: '2.4 MB',
    readability: '300 DPI Vector (Passed)',
    digitalSignature: 'MIDC Registrar Verified (Class 3 DSC)',
    addressMatch: 'Exact Match with MIDC Plot E-14/2'
  },
  {
    id: 'DOC-102',
    userId: 'user_1',
    type: 'Environmental Impact Assessment (EIA)',
    category: 'Environmental',
    status: 'verified',
    expiry: '2029-07-01',
    uploadDate: '2026-07-01',
    fileSize: '14.8 MB',
    readability: 'Passed',
    digitalSignature: 'QCI / NABET Accredited Consultant Seal',
    addressMatch: 'Plot E-14/2, Chakan Industrial Area'
  },
  {
    id: 'DOC-103',
    userId: 'user_1',
    type: 'Factory Blueprint & Layout',
    category: 'Technical',
    status: 'rejected',
    aiScore: 42,
    issues: [
      'Blueprint raster resolution low (96 DPI vs 300 DPI required)',
      'Missing Structural Engineer Digital Stamp & Council Registration Number'
    ],
    uploadDate: '2026-08-01',
    fileSize: '1.1 MB',
    readability: 'Failed (<150 DPI)',
    digitalSignature: 'Signature Unverified',
    addressMatch: 'Match Confirmed',
    fixRecommendations: 'Export CAD file as vector PDF (minimum 300 DPI) and apply verified Structural Engineer digital signature.'
  },
  {
    id: 'DOC-104',
    userId: 'user_1',
    type: 'Articles of Association (AOA)',
    category: 'Legal',
    status: 'verified',
    expiry: 'N/A',
    uploadDate: '2026-06-05',
    fileSize: '850 KB',
    readability: 'Passed',
    digitalSignature: 'MCA Verified',
    addressMatch: 'N/A'
  },
  {
    id: 'DOC-105',
    userId: 'user_1',
    type: 'Boiler Design Drawing & Metallurgical Certificate',
    category: 'Safety',
    status: 'verified',
    expiry: '2027-08-01',
    uploadDate: '2026-08-10',
    fileSize: '3.2 MB',
    readability: 'Passed',
    digitalSignature: 'Chief Inspector of Boilers Verified',
    addressMatch: 'Plot E-14/2 Chakan'
  }
];

export const INITIAL_COMPLIANCES: ComplianceItem[] = [
  {
    id: 'COMP-201',
    userId: 'user_1',
    title: 'Half-Yearly Environmental Compliance Return (Form V)',
    department: 'MPCB',
    dueDate: '2026-09-30',
    status: 'upcoming',
    category: 'Environmental',
    penaltyClause: '₹ 10,000 per month delay + show-cause notice under Water Act Sec 33A',
    frequency: 'Half-Yearly'
  },
  {
    id: 'COMP-202',
    userId: 'user_1',
    title: 'Annual Boiler Inspector Certification Renewal',
    department: 'DISH',
    dueDate: '2026-09-15',
    status: 'overdue',
    category: 'Safety',
    penaltyClause: 'Immediate shutdown order of steam generation unit + prosecution under Indian Boilers Act',
    frequency: 'Annual'
  },
  {
    id: 'COMP-203',
    userId: 'user_1',
    title: 'Quarterly Water Cess Return Filing',
    department: 'Water Resources Dept',
    dueDate: '2026-10-15',
    status: 'upcoming',
    category: 'Taxation & Fees',
    penaltyClause: 'Interest @ 2% per month on unpaid cess arrears',
    frequency: 'Quarterly'
  },
  {
    id: 'COMP-204',
    userId: 'user_1',
    title: 'Annual Hazardous Waste Manifest Filing (Form 4)',
    department: 'MPCB',
    dueDate: '2026-11-30',
    status: 'upcoming',
    category: 'Environmental',
    penaltyClause: 'Suspension of authorization for hazardous waste disposal to MEPL facility',
    frequency: 'Annual'
  }
];

export const INITIAL_CIRCULARS: RegulatoryCircular[] = [
  {
    id: 'CIRC-2026-09',
    title: 'Amendment to Maharashtra Fire Prevention & Life Safety Act, 2026',
    date: '2026-09-02',
    issuer: 'Home Dept / Fire Services Directorate',
    department: 'Fire Services',
    summary: 'Mandatory automatic sprinkler density specifications updated for industrial assembly facilities > 5,000 sq meters. Must adhere to NBC Part IV 2025.',
    affectsSectors: ['Automotive & Heavy Manufacturing', 'Textiles', 'Chemicals', 'Warehousing'],
    requiredAction: 'Provide updated fire sprinkler hydraulic calculation sheets with all pending Fire NOC applications.'
  },
  {
    id: 'CIRC-2026-08',
    title: 'Green Tariff Exemption Rules for Renewable Power Users (MERC Order 2026)',
    date: '2026-08-20',
    issuer: 'Maharashtra Electricity Regulatory Commission (MERC)',
    department: 'MSEDCL / Energy Dept',
    summary: 'Industrial units sourcing over 50% solar energy through open access receive 12% electricity duty rebate for 5 consecutive fiscal years.',
    affectsSectors: ['All Industrial Units', 'Automotive', 'Steel & Metals'],
    requiredAction: 'Submit MSEDCL Green Tariff Application Form 4B along with open-access PPA agreement.'
  },
  {
    id: 'CIRC-2026-07',
    title: 'Streamlined Online Tree Felling Permission through PRAVAH Integration',
    date: '2026-07-15',
    issuer: 'Urban Development & Forest Dept',
    department: 'Tree Authority',
    summary: 'Deemed permission granted within 21 days for non-forest industrial plots in designated MIDC zones upon payment of compensatory afforestation deposit.',
    affectsSectors: ['All Greenfield Industrial Projects'],
    requiredAction: 'Check plot tree inventory in CAF section 2.'
  }
];

export const INITIAL_SCHEMES: SchemeBenefit[] = [
  {
    id: 'SCH-MHD-01',
    title: 'Package Scheme of Incentives (PSI) 2019 - Industrial Promotion Subsidy (IPS)',
    category: 'State Tax Subsidy',
    benefit: 'Up to 100% Gross SGST reimbursement for 7 to 10 years based on taluka categorization (Group C / D / D+).',
    matchScore: 94,
    status: 'eligible',
    reasons: [
      'Unit located in Chakan MIDC (qualifies for Group C / D Large unit category)',
      'Proposed investment of ₹ 450 Crores qualifies for Mega / Large Industrial Project status',
      'Direct employment commitment (> 500 local workers from Maharashtra domiciles)'
    ],
    missingDocs: ['Commercial Production Commencement Certificate (to be submitted post plant commissioning)'],
    estimatedIncentiveAmount: '₹ 84.5 Crores over 7 years'
  },
  {
    id: 'SCH-MHD-02',
    title: 'Electricity Duty Exemption for Manufacturing Units (PSI 2019 Clause 5.2)',
    category: 'Power Tariff Relief',
    benefit: '100% Electricity Duty exemption for 7 years on HT power connection from MSEDCL.',
    matchScore: 88,
    status: 'eligible',
    reasons: [
      'New manufacturing establishment in notified industrial area',
      'Eligible category under Maharashtra Industrial Policy'
    ],
    missingDocs: ['MSEDCL HT Connection Sanction Letter (APP-1005)'],
    estimatedIncentiveAmount: '₹ 12.8 Crores'
  },
  {
    id: 'SCH-MHD-03',
    title: 'Dr. Babasaheb Ambedkar Special Package Scheme for SC/ST Entrepreneurs',
    category: 'Inclusivity Package',
    benefit: 'Interest subsidy @ 5% + additional 20% capital subsidy on plant and machinery.',
    matchScore: 15,
    status: 'not_applicable',
    reasons: ['Applicable only for enterprises with > 51% equity held by SC/ST promoter group.'],
    missingDocs: []
  },
  {
    id: 'SCH-MHD-04',
    title: 'Chief Minister Employment Generation Programme (CMEGP) Capital Subsidy',
    category: 'MSME Assistance',
    benefit: 'Capital subsidy up to 25% for micro & small project equipment procurement.',
    matchScore: 35,
    status: 'not_applicable',
    reasons: ['Applicable primarily for Micro & Small Enterprises (< ₹ 10 Cr capital ceiling).'],
    missingDocs: []
  }
];

export const INITIAL_GRIEVANCES: GrievanceItem[] = [
  {
    id: 'GRV-8801',
    userId: 'user_1',
    subject: 'Delay in MPCB Consent to Establish Physical Certificate Signing',
    appId: 'APP-1002',
    department: 'MPCB',
    status: 'under_review',
    urgencyScore: 88,
    aiAnalysis: 'Urgent: Approval digital seal approved, physical signed copy pending 14 days over SLA. Impacting financial closure.',
    createdAt: '2026-08-28',
    assignedOfficer: 'Dr. S. K. Patil'
  },
  {
    id: 'GRV-8802',
    userId: 'user_1',
    subject: 'Clarification on Fire Sprinkler NBC 2025 retrospective compliance',
    appId: 'APP-1003',
    department: 'Fire Services',
    status: 'escalated_to_collector',
    urgencyScore: 76,
    aiAnalysis: 'High: Department issued ambiguous rejection query regarding calculation standard.',
    createdAt: '2026-08-15',
    assignedOfficer: 'Er. Rajesh Deshmukh'
  }
];

export const INITIAL_QUERIES: DepartmentQuery[] = [
  {
    id: 'QRY-301',
    appId: 'APP-1003',
    appName: 'Fire No Objection Certificate (Provisional NOC)',
    department: 'Directorate of Maharashtra Fire Services',
    officerName: 'Chief Fire Officer - Pune Region',
    queryDate: '2026-08-05',
    querySubject: 'Unclear egress stair width on factory second floor layout',
    queryDetail: 'Kindly verify whether the northern emergency stairwell width conforms to NBC 2025 table 12 (minimum 2.0 meters for occupancy > 200 persons). The submitted layout indicates 1.5 meters.',
    status: 'pending_applicant'
  },
  {
    id: 'QRY-302',
    appId: 'APP-1004',
    appName: 'Factory Building Plan Approval',
    department: 'DISH',
    officerName: 'Senior Inspector of Factories',
    queryDate: '2026-08-18',
    querySubject: 'Canteen and first-aid room provisions for > 500 workers',
    queryDetail: 'Please furnish dedicated architectural plan sheet showing crèche and 250-seat industrial canteen with ventilation shafts.',
    status: 'answered',
    applicantResponse: 'Revised Sheet A-08 uploaded showing 300-seat canteen with exhaust scrubbers.',
    responseDate: '2026-08-21'
  }
];

export const INITIAL_PAYMENTS: PaymentChallan[] = [
  {
    id: 'PAY-7701',
    appId: 'APP-1001',
    serviceName: 'MIDC Land Allotment Scrutiny Fee',
    department: 'MIDC',
    amount: 150000,
    challanNumber: 'GRAS-2026-MH-994182',
    date: '2026-06-10',
    status: 'PAID',
    paymentMode: 'NetBanking'
  },
  {
    id: 'PAY-7702',
    appId: 'APP-1002',
    serviceName: 'MPCB Consent to Establish Capital Fee (Red Category)',
    department: 'MPCB',
    amount: 375000,
    challanNumber: 'GRAS-2026-MH-110294',
    date: '2026-07-01',
    status: 'PAID',
    paymentMode: 'NEFT/RTGS'
  },
  {
    id: 'PAY-7703',
    appId: 'APP-1003',
    serviceName: 'Fire Department Scrutiny & Water Reservoir Verification Fee',
    department: 'Fire Services',
    amount: 85000,
    challanNumber: 'MTRAC-2026-09411',
    date: '2026-08-01',
    status: 'PAID',
    paymentMode: 'UPI'
  },
  {
    id: 'PAY-7704',
    appId: 'APP-1004',
    serviceName: 'DISH Factory Plan Scrutiny Fee',
    department: 'DISH',
    amount: 120000,
    challanNumber: 'GRAS-2026-MH-449102',
    date: '2026-08-12',
    status: 'PAID',
    paymentMode: 'NetBanking'
  }
];

export const INITIAL_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'FRD-101',
    severity: 'HIGH',
    category: 'Survey Number Conflict',
    title: 'Overlapping Cadastral Boundary Claim Detected',
    description: 'MIDC Plot E-14/2 survey coordinates match an ongoing boundary settlement notice filed in Taluka Khed civil court.',
    appId: 'APP-1001',
    applicant: 'Third Party Land Claimant (Adjoining Plot E-14/1)',
    detectedAt: '2026-08-14',
    status: 'Flagged'
  },
  {
    id: 'FRD-102',
    severity: 'MEDIUM',
    category: 'Duplicate Submission',
    title: 'Duplicate CTE Application Flagged on MPCB OCMMS Portal',
    description: 'Previous consultant filed duplicate CTE request draft under registration ID MPCB-PUN-DRAFT-2026-881.',
    appId: 'APP-1002',
    applicant: 'Tata Motors Maharashtra Assembly Unit',
    detectedAt: '2026-07-05',
    status: 'Resolved'
  }
];

export const INITIAL_PUBLIC_CONSULTATIONS: PublicConsultation[] = [
  {
    id: 'PUB-401',
    projectTitle: 'Chakan Industrial Zone Phase II Common Effluent Treatment Plant (CETP) Expansion',
    applicantName: 'Chakan Industrial Waste Management Association',
    location: 'MIDC Chakan Phase II, Khed, Pune',
    hearingDate: '2026-09-28',
    venue: 'MIDC Field Office Conference Hall, Chakan',
    eiaSummary: 'Expansion from 15 MLD to 25 MLD with advanced membrane bioreactor (MBR) technology.',
    status: 'Open For Comments',
    commentsCount: 14
  },
  {
    id: 'PUB-402',
    projectTitle: 'Dedicated 220kV Extra High Voltage Substation by MSETCL for Chakan Auto Hub',
    applicantName: 'Maharashtra State Electricity Transmission Co. Ltd (MSETCL)',
    location: 'Supa-Chakan Corridor, Pune',
    hearingDate: '2026-10-10',
    venue: 'Collectorate Auditorium, Pune',
    eiaSummary: 'Constructing 220kV transmission line corridor with minimal farm boundary disruption.',
    status: 'Hearing Scheduled',
    commentsCount: 8
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-09-09 14:20:11',
    actor: 'Dr. S. K. Patil',
    role: 'Senior Nodal Officer',
    action: 'APP_SCRUTINY_ADVANCED',
    details: 'Reviewed and unblocked APP-1002 Consent to Establish upon ZLD verification.',
    ipAddress: '10.124.55.10 (MahaGovt Intranet)'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-09-08 11:15:43',
    actor: 'UdyogSetu AI Engine',
    role: 'AI Orchestrator',
    action: 'RISK_RADAR_CALCULATED',
    details: 'Flagged APP-1003 (Fire NOC) as High Risk due to unverified digital structural signature.',
    ipAddress: '127.0.0.1 (Local AI Engine)'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-08-28 16:45:00',
    actor: 'Tata Motors Admin',
    role: 'Citizen User',
    action: 'GRIEVANCE_LODGED',
    details: 'Lodged GRV-8801 regarding MPCB physical certificate dispatch delay.',
    ipAddress: '203.199.64.12'
  }
];

export const GOVERNMENT_SERVICES_CATALOG = [
  {
    code: 'MIDC-LAN-01',
    department: 'MIDC',
    title: 'Allotment of Industrial Plot / Shed in MIDC Areas',
    timelineDays: 30,
    fee: '₹ 1,50,000',
    description: 'Statutory allocation of developed industrial land across Class A, B, C, D MIDC estates in Maharashtra.',
    stage: 'Pre-Establishment'
  },
  {
    code: 'MPCB-CTE-04',
    department: 'MPCB',
    title: 'Consent to Establish (CTE) for Red / Orange Category',
    timelineDays: 45,
    fee: 'Based on Capital Investment (₹ 50k - ₹ 5L)',
    description: 'Mandatory environmental clearance under Water (Prevention & Control of Pollution) Act and Air Act.',
    stage: 'Pre-Establishment'
  },
  {
    code: 'FIRE-NOC-02',
    department: 'Fire Services',
    title: 'Provisional / Final Fire Safety No Objection Certificate',
    timelineDays: 30,
    fee: '₹ 85,000',
    description: 'Fire hazard clearance conforming to Maharashtra Fire Prevention and Life Safety Measures Act.',
    stage: 'Pre-Establishment'
  },
  {
    code: 'DISH-PLN-01',
    department: 'DISH',
    title: 'Factory Building Plan Approval & Registration of Factory License',
    timelineDays: 30,
    fee: '₹ 1,20,000',
    description: 'Statutory occupational health, worker safety, structural stability verification under The Factories Act, 1948.',
    stage: 'Pre-Operation'
  },
  {
    code: 'MSED-HT-01',
    department: 'MSEDCL',
    title: 'Sanction of High Tension (HT) 11kV/22kV/33kV Power Connection',
    timelineDays: 21,
    fee: '₹ 5,40,000 (Incl. Security Deposit)',
    description: 'Dedicated feeder line clearance, bay allocation, and transformer capacity sanctioning.',
    stage: 'Pre-Operation'
  },
  {
    code: 'BOIL-REG-01',
    department: 'DISH / Boilers',
    title: 'Boiler Registration & Steam Pipeline Plan Verification',
    timelineDays: 21,
    fee: '₹ 45,000',
    description: 'Hydraulic inspection and certification under the Indian Boilers Act, 1923.',
    stage: 'Pre-Operation'
  },
  {
    code: 'TREE-AUT-01',
    department: 'Tree Authority',
    title: 'Tree Felling / Transplantation Clearance',
    timelineDays: 21,
    fee: '₹ 25,000',
    description: 'Maharashtra (Urban & Rural Areas) Protection & Preservation of Trees Act sanction.',
    stage: 'Pre-Establishment'
  },
  {
    code: 'WATER-IND-01',
    department: 'MIDC / Water Works',
    title: 'Industrial Bulk Water Connection Sanction',
    timelineDays: 14,
    fee: '₹ 60,000',
    description: 'Pipeline tapping and volumetric meter allocation from MIDC raw/treated reservoir.',
    stage: 'Pre-Operation'
  }
];
