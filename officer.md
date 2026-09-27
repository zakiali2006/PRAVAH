# Government / Department Officer Features & Responsibilities

Based on the PRAVAH Integration Plan, the following features, responsibilities, and APIs are associated with the Government Officer and Department Officer roles (primarily managed under the `feature/shreya/officer-*` feature branches):

## 1. Officer SLA Dashboard & Workload Management
Officers have access to a dedicated dashboard that tracks their application queues and SLAs.
**Features Include:**
- View high-risk applications
- Monitor remaining SLA times and SLA breaches
- View current workload and assigned pending queries
- Track missing documents from applicants
- View department-specific and expertise-specific queues

**Associated API Endpoints:**
- `GET /api/officer/queue`
- `GET /api/officer/sla-dashboard`
- `GET /api/officer/workload`

## 2. Smart Workload Recommendation & Assignment
The system intelligently recommends application assignments to officers to ensure balanced workloads and timely approvals.
**Recommendation Factors:**
- Officer expertise and department
- Current workload queue
- District matching
- Application type
- SLA risk assessment (ensuring high-risk items get immediate attention)

**Associated API Endpoints:**
- `POST /api/officer/applications/{id}/recommend-assignment`

## 3. Grievance Management
Officers can review and address applicant grievances. The system provides AI-powered insights to help officers process these effectively.
**Features Include:**
- View sentiment analysis results from AI
- Use `pgvector` semantic similarity to find related/similar past grievances
- Sort by priority and department
- Officer assignment for grievance resolution

**Associated API Endpoints:**
- `GET /api/grievances`
- `GET /api/grievances/{id}`
- `POST /api/grievances/{id}/close`

## 4. Duplicate Detection & Fraud Prevention
Officers are provided with tools to detect potential duplicate applications or fraudulent submissions.
**Features Include:**
- Exact field matches and fuzzy matching
- Cross-referencing PAN and address signals
- `pgvector` semantic similarity where appropriate
- Flagging applications for manual officer review (avoiding automatic accusation of fraud)

**Associated API Endpoints:**
- `GET /api/officer/duplicates`

## 5. Notification System
Officers receive critical alerts related to their assigned workflows.
**Events triggering notifications:**
- Application submitted
- Query raised
- Document failed validation
- SLA risk warnings
- SLA breaches
- Final approval
- Compliance due dates
- Regulatory impact changes

## 6. Government Adapters & Integration
The officer-facing systems interact with external government boundaries to ensure accurate data flow.
**Integrations:**
- `maitri_adapter.py` and `department_adapter.py` for fetching live data when available.
- Secure adapter interfaces for department integration.

## 7. Frontend Integration
The frontend includes specific UI components that connect to the backend APIs for officers.
- **Officer Dashboard**
- **Notifications Panel**
- **Grievances Panel**
- **Government Integration Status Views**