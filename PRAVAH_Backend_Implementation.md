# PRAVAH Backend Implementation Plan

## SIH 2026 --- SIH26130

**Project:** PRAVAH\
**Problem Statement:** Efficiency in streamlining industrial approvals,
compliance processes, and access to government support services\
**Backend:** Python + FastAPI + PostgreSQL + pgvector\
**ORM:** SQLAlchemy\
**Migrations:** Alembic\
**AI:** OCR + LLM + embeddings + RAG\
**Architecture:** Modular monolith

------------------------------------------------------------------------

## 1. Backend Objective

Transform the current frontend/demo prototype into a real, persistent,
role-aware PRAVAH platform.

The backend must provide:

-   Authentication and JWT
-   Database-backed RBAC
-   Business and factory management
-   Project wizard
-   Regulatory applicability engine
-   Approval dependency graph
-   Approval roadmap
-   Application lifecycle
-   Document upload, OCR, extraction and validation
-   Application-document linking
-   SLA monitoring and risk detection
-   Next-best-action
-   Incentive/scheme matching
-   Compliance calendar
-   Regulatory watch
-   AI/RAG assistant
-   Grievances
-   Officer queue and workload
-   Policy analytics and bottleneck detection
-   Notifications
-   Audit logging
-   Reproducible demo seed data
-   Stable API contracts for the React frontend

PostgreSQL is the source of truth. Frontend mock data must be removed as
real APIs become available.

------------------------------------------------------------------------

## 2. Architecture

Use a modular monolith; do not introduce unnecessary microservices.

``` text
React Frontend
      |
      v
FastAPI API
      |
      +-- Authentication
      +-- Authorization / RBAC
      +-- Validation
      |
      v
Service Layer
      |
      +-- Repositories
      +-- Business Engines
      +-- AI / RAG
      |
      v
PostgreSQL + pgvector
      |
      +-- Relational data
      +-- Vector data
      +-- Audit logs
```

------------------------------------------------------------------------

## 3. Directory Structure

``` text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── database.py
│   │   └── dependencies.py
│   ├── api/
│   │   ├── router.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── business.py
│   │       ├── factories.py
│   │       ├── wizard.py
│   │       ├── roadmap.py
│   │       ├── documents.py
│   │       ├── services.py
│   │       ├── applications.py
│   │       ├── risk.py
│   │       ├── compliance.py
│   │       ├── incentives.py
│   │       ├── grievances.py
│   │       ├── queries.py
│   │       ├── dashboard.py
│   │       ├── regulatory.py
│   │       ├── officer.py
│   │       ├── policy.py
│   │       └── admin.py
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── engines/
│   │   ├── rules/applicability_engine.py
│   │   ├── dependency/dependency_engine.py
│   │   ├── risk/risk_engine.py
│   │   ├── document/ocr.py
│   │   ├── document/extraction.py
│   │   ├── document/validator.py
│   │   └── incentives/matching_engine.py
│   ├── integrations/
│   ├── ai/
│   │   ├── embeddings.py
│   │   ├── vector_store.py
│   │   ├── rag.py
│   │   └── prompts/
│   ├── rules/
│   └── tests/
├── alembic/
├── seed.py
├── requirements.txt
├── Dockerfile
├── .env
└── .env.example
```

------------------------------------------------------------------------

## 4. Canonical Roles

Use exactly:

``` python
INVESTOR = "INVESTOR"
TRANSACTIONAL_USER = "TRANSACTIONAL_USER"
OFFICER = "OFFICER"
POLICY_ADMIN = "POLICY_ADMIN"
SYSTEM_ADMIN = "SYSTEM_ADMIN"
```

Do not replace these with alternate public API role names.

------------------------------------------------------------------------

## 5. Database RBAC

PostgreSQL must be authoritative.

Core tables:

``` text
users
roles
permissions
user_roles
role_permissions
```

Relationships:

``` text
User -> UserRole -> Role -> RolePermission -> Permission
```

### Users

``` text
id
email
password_hash
full_name
is_active
created_at
updated_at
```

### Roles

``` text
id
name
description
```

### Permissions

``` text
id
name
description
```

Also create:

``` text
transactional_assignments
officer_department_assignments
```

for scope-based authorization.

------------------------------------------------------------------------

## 6. Permission Matrix

### Investor

``` text
business.read
business.update
factory.read
factory.create
factory.update
services.read
applications.read
applications.create
applications.update
documents.read
documents.upload
documents.delete
roadmap.read
risk.read
incentives.read
compliance.read
regulatory.read
chat.use
grievances.create
grievances.read
notifications.read
```

### Transactional User

``` text
business.read
factory.read
services.read
applications.read
applications.update
documents.read
documents.upload
roadmap.read
risk.read
chat.use
grievances.read
notifications.read
```

Access is additionally restricted to assigned
factory/service/application records.

### Officer

``` text
applications.read
applications.review
applications.update
applications.approve
applications.reject
documents.read
documents.review
risk.read
grievances.read
grievances.resolve
officer.queue.read
officer.workload.read
duplicates.read
chat.use
notifications.read
```

Access is additionally restricted by department/assignment.

### Policy Admin

``` text
analytics.read
policy.read
regulatory.read
bottleneck.read
district.analytics
sector.analytics
department.analytics
reports.read
notifications.read
```

### System Admin

``` text
users.read
users.create
users.update
users.disable
roles.read
roles.manage
permissions.read
permissions.manage
services.manage
departments.manage
document_types.manage
approval_rules.manage
approval_dependencies.manage
regulatory.manage
incentives.manage
audit.read
system.manage
```

------------------------------------------------------------------------

## 7. Authentication

Implement:

``` text
POST /api/auth/login
GET  /api/auth/me
```

Login flow:

``` text
Credentials
  -> find user
  -> verify password hash
  -> load role
  -> load permissions
  -> generate JWT
  -> return token + user
```

Use bcrypt or Argon2. Never store plaintext passwords.

Development/demo accounts use:

``` text
password123
```

------------------------------------------------------------------------

## 8. Authorization

Implement:

``` python
get_current_user()
require_role(...)
require_permission(...)
```

Security flow:

``` text
JWT
 ↓
get_current_user()
 ↓
Database user
 ↓
Database role/permissions
 ↓
Ownership/scope check
 ↓
Business service
 ↓
Database
```

Frontend `RoleGuard` and `PermissionGuard` are UX controls, not security
controls.

------------------------------------------------------------------------

## 9. Ownership and Scope

### Investor

Only own:

-   business
-   factory
-   applications
-   documents
-   grievances
-   roadmap
-   risk data

### Transactional User

Only assigned records.

Recommended:

``` text
transactional_assignments
-------------------------
id
user_id
factory_unit_id
service_id
application_id
created_at
```

### Officer

Use:

``` text
officer_department_assignments
------------------------------
id
user_id
department_id
```

### Policy Admin

Primarily aggregated analytics.

### System Admin

System-wide configuration.

------------------------------------------------------------------------

## 10. Standard API Response

Success:

``` json
{
  "status": "success",
  "data": {},
  "message": "Operation completed successfully."
}
```

Error:

``` json
{
  "status": "error",
  "error_code": "RESOURCE_NOT_FOUND",
  "message": "Requested resource was not found."
}
```

Keep response contracts consistent.

------------------------------------------------------------------------

## 11. API Contract

``` text
POST /api/auth/login
GET  /api/auth/me

GET/POST/PUT /api/business-profile

GET/POST/GET/PUT/DELETE /api/factory-units

POST /api/wizard/run

GET /api/roadmap/{id}

GET /api/documents
POST /api/documents/upload
POST /api/documents/{id}/validate

GET /api/services

GET/POST/GET/PUT /api/applications
GET /api/applications/{id}/track
GET /api/applications/{id}/risk

GET /api/compliance-calendar
GET /api/incentives/readiness
GET /api/regulatory-watch
GET /api/dashboard/next-best-action

GET /api/officer/queue
GET /api/policy/bottleneck-heatmap
```

Admin endpoints:

``` text
/api/admin/users
/api/admin/roles
/api/admin/permissions
/api/admin/services
/api/admin/departments
/api/admin/document-types
/api/admin/approval-rules
/api/admin/approval-dependencies
/api/admin/incentives
/api/admin/regulatory-rules
/api/admin/audit
```

------------------------------------------------------------------------

## 12. Business and Factory Data

Business profile:

``` text
id
owner_id
business_name
registration_number
sector
contact_information
address
district
created_at
updated_at
```

Factory unit:

``` text
id
business_id
name
location
district
land_type
factory_type
capacity
employment
status
created_at
updated_at
```

Every read/write must enforce ownership or role scope.

------------------------------------------------------------------------

## 13. Project Wizard

Endpoint:

``` text
POST /api/wizard/run
```

Input should support:

``` text
sector
district
investment
land_type
factory_type
production_capacity
employment
project_stage
environmental_category
```

Flow:

``` text
Project Characteristics
        ↓
Applicability Rules
        ↓
Required / Conditional / Not Applicable Services
        ↓
Dependencies
        ↓
Roadmap
```

------------------------------------------------------------------------

## 14. Regulatory Applicability Engine

Statuses:

``` text
REQUIRED
CONDITIONAL
NOT_APPLICABLE
```

Rules should be versioned and explainable.

Store:

``` text
rule_id
service_id
conditions
result
reason
source_reference
effective_from
effective_to
version
```

The rules engine should make authoritative applicability decisions.

AI can explain or retrieve information, but must not invent regulatory
requirements.

------------------------------------------------------------------------

## 15. Approval Dependency Engine

Represent dependencies as a directed graph.

``` text
Approval A
   |
   v
Approval B
   |
   +----> Approval C
```

Table:

``` text
approval_dependencies
---------------------
id
predecessor_service_id
successor_service_id
dependency_type
condition
```

Support:

``` text
MANDATORY
CONDITIONAL
PARALLEL
SEQUENTIAL
```

The engine must identify prerequisites, blocked steps, parallel work and
critical path.

------------------------------------------------------------------------

## 16. Approval Roadmap

Endpoint:

``` text
GET /api/roadmap/{id}
```

Combine:

``` text
Applicable services
+ dependencies
+ application state
+ document completeness
+ SLA
```

Example:

``` text
Business Registration     COMPLETE
Land Approval             IN_PROGRESS
Environmental Approval    BLOCKED
Factory License           NOT_STARTED
```

------------------------------------------------------------------------

## 17. Applications

Application fields:

``` text
id
application_number
business_id
factory_unit_id
service_id
status
submitted_at
updated_at
due_at
assigned_officer_id
current_step
priority
created_at
updated_at
```

Suggested statuses:

``` text
DRAFT
DOCUMENTS_PENDING
READY_FOR_SUBMISSION
SUBMITTED
UNDER_REVIEW
QUERY_RAISED
RESUBMITTED
APPROVED
REJECTED
WITHDRAWN
```

Implement a state machine so invalid status transitions are rejected.

------------------------------------------------------------------------

## 18. Documents

Existing pipeline:

``` text
Upload
 ↓
Storage
 ↓
OCR
 ↓
Extraction
 ↓
Validation
```

Document fields:

``` text
id
owner_id
application_id
document_type_id
file_name
storage_key
mime_type
file_size
status
ocr_text
extracted_data
validation_result
uploaded_at
expires_at
```

Add:

``` text
application_documents
---------------------
id
application_id
document_id
required_for_step
status
created_at
```

This enables application-level document completeness.

------------------------------------------------------------------------

## 19. OCR and Extraction

Extract fields such as:

``` text
document_number
applicant_name
company_name
address
issue_date
expiry_date
registration_number
authority
```

Store extraction results.

AI extraction is evidence and should not automatically be treated as
authoritative truth.

------------------------------------------------------------------------

## 20. Document Validation

Validate:

``` text
document type
readability
required pages
expiry
signature presence
required fields
business mismatch
application mismatch
duplicate document
```

Example:

``` json
{
  "valid": false,
  "errors": [
    {
      "code": "DOCUMENT_EXPIRED",
      "message": "The submitted document has expired."
    }
  ],
  "warnings": []
}
```

------------------------------------------------------------------------

## 21. SLA and Risk Engine

Inputs:

``` text
SLA duration
elapsed duration
remaining duration
document completeness
pending queries
dependency blockage
officer status
```

Possible levels:

``` text
LOW
MEDIUM
HIGH
BREACHED
```

For the prototype, a transparent deterministic engine is preferred over
claiming an ML model that does not exist.

Example:

``` text
<50% SLA consumed    -> LOW
50-80%               -> MEDIUM
80-100%              -> HIGH
>100%                -> BREACHED
```

Additional blockers can increase the risk.

Endpoint:

``` text
GET /api/applications/{id}/risk
```

Return the reasons behind the risk.

------------------------------------------------------------------------

## 22. Next-Best-Action

Endpoint:

``` text
GET /api/dashboard/next-best-action
```

Possible actions:

``` text
UPLOAD_MISSING_DOCUMENT
RESPOND_TO_QUERY
COMPLETE_APPLICATION
WAIT_FOR_DEPENDENCY
CONTACT_OFFICER
REVIEW_INCENTIVE
CHECK_COMPLIANCE
```

Actions must be derived from actual application state.

------------------------------------------------------------------------

## 23. Incentive Matching

Endpoint:

``` text
GET /api/incentives/readiness
```

Compare:

``` text
sector
district
investment
employment
project stage
business profile
eligibility rules
```

Return:

``` text
potential eligibility
reason
missing evidence
readiness
official verification requirement
```

Never represent a recommendation as a confirmed government entitlement.

------------------------------------------------------------------------

## 24. Compliance

Endpoint:

``` text
GET /api/compliance-calendar
```

Fields:

``` text
compliance_id
business_id
factory_id
service_id
title
authority
due_date
frequency
status
source_reference
```

Statuses:

``` text
UPCOMING
DUE_SOON
OVERDUE
COMPLETED
```

------------------------------------------------------------------------

## 25. Regulatory Watch

Endpoint:

``` text
GET /api/regulatory-watch
```

Track:

``` text
regulation
notification
policy
circular
effective date
affected sectors
affected services
impact
```

Potential flow:

``` text
New regulatory record
 ↓
Affected rule detection
 ↓
Affected services/applications
 ↓
Notifications
```

------------------------------------------------------------------------

## 26. RAG / AI Assistant

Architecture:

``` text
User Question
      ↓
Embedding
      ↓
pgvector Similarity Search
      ↓
Relevant Government Documents
      ↓
Context
      ↓
LLM
      ↓
Answer + Source References
```

Knowledge-base metadata:

``` text
document_id
title
department
source
effective_date
document_type
content
embedding
version
```

Store prompts under:

``` text
app/ai/prompts/
```

Do not place large prompts inside route handlers.

------------------------------------------------------------------------

## 27. Grievances

Flow:

``` text
Complaint
 ↓
Classification
 ↓
Department Routing
 ↓
Priority
 ↓
Officer Queue
 ↓
Resolution
 ↓
Notification
```

AI may assist with classification, similarity and routing, but the
workflow must remain auditable.

------------------------------------------------------------------------

## 28. Officer Operations

Endpoint:

``` text
GET /api/officer/queue
```

Filters:

``` text
ALL
AT_RISK
SLA_BREACHED
HIGH_PRIORITY
QUERY_PENDING
DOCUMENT_REVIEW
```

Officer results must be limited to authorized departments/assignments.

Workload analytics should include:

``` text
assigned count
pending count
at-risk count
breached count
average processing time
```

------------------------------------------------------------------------

## 29. Duplicate Detection

Potential signals:

``` text
application number
company name
registration number
factory location
document number
similar grievance text
```

Return matching evidence rather than only a score.

------------------------------------------------------------------------

## 30. Policy Analytics

Policy APIs should expose aggregated information:

``` text
district
sector
department
service
application volume
pending applications
at-risk applications
breached applications
average processing time
query rate
document rejection rate
```

Endpoint:

``` text
GET /api/policy/bottleneck-heatmap
```

Avoid unnecessary personal applicant information in policy analytics.

------------------------------------------------------------------------

## 31. Audit Logging

Log important operations:

``` text
LOGIN
USER_CREATED
ROLE_CHANGED
APPLICATION_CREATED
APPLICATION_UPDATED
DOCUMENT_UPLOADED
DOCUMENT_VALIDATED
QUERY_RAISED
APPLICATION_APPROVED
APPLICATION_REJECTED
REGULATORY_RULE_UPDATED
INCENTIVE_UPDATED
```

Fields:

``` text
id
actor_user_id
action
entity_type
entity_id
old_value
new_value
ip_address
created_at
```

Never store secrets in audit logs.

------------------------------------------------------------------------

## 32. Seed Data

Fresh setup:

``` bash
alembic upgrade head
python seed.py
```

Demo accounts:

``` text
investor@demo.com   -> INVESTOR
delegate@demo.com   -> TRANSACTIONAL_USER
officer@demo.com    -> OFFICER
policy@demo.com     -> POLICY_ADMIN
admin@demo.com      -> SYSTEM_ADMIN
```

Development/demo password:

``` text
password123
```

Seed:

``` text
roles
permissions
role_permissions
users
user_roles
departments
businesses
factory_units
services
approval rules
approval dependencies
applications
application steps
documents
application_documents
risk records
incentive schemes
compliance records
regulatory records
notifications
demo assignments
```

The current frontend demo-login experience must continue to work after
database integration.

------------------------------------------------------------------------

## 33. Primary Demo Scenario

Use a food-processing industrial project:

``` text
Investor
 ↓
Business
 ↓
Factory
 ↓
Project Wizard
 ↓
Applicable Approvals
 ↓
Roadmap
 ↓
Documents
 ↓
Application
 ↓
SLA
 ↓
Risk
 ↓
Incentive Readiness
 ↓
Compliance
```

Government side:

``` text
Applications
 ↓
Officer Queue
 ↓
SLA Risk
 ↓
Bottleneck Detection
 ↓
District/Sector/Department Analytics
```

------------------------------------------------------------------------

## 34. Frontend API Mapping

  Feature               API
  --------------------- -----------------------------------
  Login                 `/api/auth/login`
  Current User          `/api/auth/me`
  Business Profile      `/api/business-profile`
  Factory Units         `/api/factory-units`
  Project Wizard        `/api/wizard/run`
  Approval Roadmap      `/api/roadmap/{id}`
  Documents             `/api/documents`
  Document Validation   `/api/documents/{id}/validate`
  Services              `/api/services`
  Applications          `/api/applications`
  Tracking              `/api/applications/{id}/track`
  Risk                  `/api/applications/{id}/risk`
  Compliance            `/api/compliance-calendar`
  Incentives            `/api/incentives/readiness`
  Regulatory Watch      `/api/regulatory-watch`
  Next Action           `/api/dashboard/next-best-action`
  Officer Queue         `/api/officer/queue`
  Policy Heatmap        `/api/policy/bottleneck-heatmap`

------------------------------------------------------------------------

## 35. Configuration

`.env`:

``` ini
ENV=development
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/pravah_db
SECRET_KEY=your-super-secret-jwt-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALGORITHM=HS256
OPENAI_API_KEY=
GEMINI_API_KEY=
AI_MODEL_VISION=
AI_MODEL_TEXT=
MAX_TOKENS=2000
DIGILOCKER_CLIENT_ID=
DIGILOCKER_CLIENT_SECRET=
SMTP_HOST=smtp.gmail.com
```

Never commit real secrets.

Maintain `.env.example`.

Use centralized Pydantic Settings.

------------------------------------------------------------------------

## 36. Migration Rules

Every database schema change must use Alembic.

``` bash
alembic revision --autogenerate -m "add application tables"
alembic upgrade head
```

A clean database must be able to reach the current schema using:

``` bash
alembic upgrade head
```

------------------------------------------------------------------------

## 37. Service/Repository Rules

Keep routes thin.

Preferred:

``` text
Route
 ↓
Service
 ↓
Repository
 ↓
Database
```

For intelligence:

``` text
Route
 ↓
Service
 ↓
Engine
 ↓
Repository / AI
```

Repositories handle database access. Services handle business workflows.
Engines handle reusable decision logic.

------------------------------------------------------------------------

## 38. Error Handling

Use meaningful HTTP status codes:

``` text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

Do not expose internal stack traces in production.

------------------------------------------------------------------------

## 39. Application State Machine

Recommended transitions:

``` text
DRAFT
 ↓
DOCUMENTS_PENDING
 ↓
READY_FOR_SUBMISSION
 ↓
SUBMITTED
 ↓
UNDER_REVIEW
 ↓
QUERY_RAISED
 ↓
RESUBMITTED
 ↓
UNDER_REVIEW
 ↓
APPROVED
```

Rejected and withdrawn states must have explicitly defined transitions.

Every status change should record:

``` text
old_status
new_status
actor
timestamp
reason
```

------------------------------------------------------------------------

## 40. Testing

### Unit Tests

Test:

``` text
rules engine
dependency engine
risk engine
document validation
incentive matching
status transitions
permission checks
```

### API Tests

Test:

``` text
login
auth/me
business
factory
applications
documents
wizard
risk
incentives
compliance
officer
policy
admin
```

### Integration Test

``` text
Login
 ↓
Create Project
 ↓
Run Wizard
 ↓
Generate Roadmap
 ↓
Upload Document
 ↓
Validate Document
 ↓
Create Application
 ↓
Track Application
 ↓
Calculate Risk
 ↓
Generate Next Action
```

------------------------------------------------------------------------

## 41. RBAC Security Tests

Verify:

``` text
Unauthenticated -> 401
No permission -> 403
Investor accessing another investor -> 403/404
Transactional user accessing unassigned application -> 403/404
Officer accessing unauthorized department -> 403/404
Policy user accessing private document -> 403
Non-admin modifying configuration -> 403
```

------------------------------------------------------------------------

## 42. Implementation Order

### Stage 1 --- Foundation

Already established:

``` text
FastAPI
PostgreSQL
pgvector
Alembic
configuration
database connection
startup
```

### Stage 2 --- Identity and RBAC

``` text
models
roles
permissions
JWT
password hashing
get_current_user
require_role
require_permission
/auth/login
/auth/me
seed roles
seed permissions
seed users
```

### Stage 3 --- Master Data

``` text
departments
services
document types
businesses
factory units
approval rules
approval dependencies
incentive schemes
regulatory data
```

### Stage 4 --- Demo Data / Frontend Parity

``` text
seed complete demo scenario
real login
business
factory
dashboard
applications
```

### Stage 5 --- Wizard and Roadmap

``` text
wizard
applicability engine
dependency engine
roadmap
application creation
tracking
```

### Stage 6 --- Documents

Complete existing OCR/document foundation with:

``` text
application-document linking
required-document mapping
completeness calculation
```

### Stage 7 --- Intelligence

``` text
SLA
risk
next-best-action
incentive readiness
```

### Stage 8 --- Compliance / Regulatory

``` text
compliance calendar
regulatory watch
regulatory impact
```

### Stage 9 --- AI / RAG

``` text
knowledge base
embeddings
pgvector retrieval
RAG
AI assistant
source references
```

### Stage 10 --- Operations

``` text
officer queue
workload
grievances
duplicate detection
notifications
```

### Stage 11 --- Policy Analytics

``` text
bottlenecks
district analysis
sector analysis
department analysis
heatmap
reports
```

### Stage 12 --- Admin

``` text
users
roles
permissions
departments
services
document types
rules
dependencies
incentives
regulatory data
audit
system settings
```

### Stage 13 --- Full Integration

Remove:

``` text
MockAppContext
mock application data
hardcoded dashboard statistics
fake status data
frontend-only authorization
```

Replace with real API data.

### Stage 14 --- Testing / Demo Freeze

``` bash
alembic upgrade head
python seed.py
pytest
```

Then verify all five demo accounts.

------------------------------------------------------------------------

## 43. Team Dependency Order

``` text
Vinayak
Foundation / RBAC / Database
        ↓
Bhagyesh
Business / Factory / Applications / Wizard
        ↓
Zaki
Document Integration
        ↓
Niraja
Rules / Roadmap / Risk / Intelligence
        ↓
Kajal
RAG / AI Assistant
        ↓
Shreya
Officer / Grievances / Analytics / Operations
        ↓
Frontend Integration
        ↓
Integration Testing
```

The dependency order matters because later engines require stable
database/API contracts from earlier modules.

------------------------------------------------------------------------

## 44. Git Workflow

Do not push directly to `main`.

``` text
develop
├── vinayak
├── bhagyesh
├── zaki
├── kajal
├── niraja
└── shreya
```

Feature flow:

``` text
feature branch
 ↓
member branch
 ↓
test
 ↓
develop
 ↓
integration test
 ↓
main
```

Rules:

-   No direct main push
-   One reviewer minimum
-   No force push
-   Focused commits
-   Resolve conflicts before merge
-   Run tests before PR
-   Run Black and Flake8 before PR

------------------------------------------------------------------------

## 45. Definition of Done

A backend feature is complete only when:

``` text
[ ] Database model exists
[ ] Alembic migration exists
[ ] Pydantic schemas exist
[ ] Repository/service logic exists
[ ] API route exists
[ ] Authentication exists
[ ] Permission check exists
[ ] Ownership/scope check exists
[ ] Error handling exists
[ ] Audit logging exists where required
[ ] Tests exist
[ ] Seed data exists where required
[ ] Frontend API contract is documented
[ ] Endpoint appears correctly in /docs
```

------------------------------------------------------------------------

## 46. Immediate Checklist

``` text
[ ] Inspect existing Stage 1 and Stage 2 code
[ ] Preserve working foundation/document pipeline
[ ] Implement canonical RBAC models
[ ] Implement roles and permissions
[ ] Implement user-role relationships
[ ] Implement JWT authentication
[ ] Implement get_current_user()
[ ] Implement require_role()
[ ] Implement require_permission()
[ ] Implement /api/auth/me
[ ] Secure existing routes
[ ] Add ownership checks
[ ] Add transactional assignments
[ ] Add officer department scope
[ ] Update seed.py
[ ] Seed five demo users
[ ] Seed complete demo scenario
[ ] Run clean Alembic migration
[ ] Verify all five logins
[ ] Verify forbidden access
[ ] Implement business/factory APIs
[ ] Implement applications
[ ] Implement wizard
[ ] Implement roadmap
[ ] Connect documents to applications
[ ] Implement SLA/risk
[ ] Implement incentives
[ ] Implement compliance
[ ] Implement regulatory watch
[ ] Complete pgvector/RAG
[ ] Implement officer operations
[ ] Implement policy analytics
[ ] Implement admin APIs
[ ] Remove mock frontend data
[ ] Run integration tests
[ ] Freeze demo build
```

------------------------------------------------------------------------

## 47. Non-Negotiable Principles

``` text
PostgreSQL = source of truth

Frontend RBAC = UX protection
Backend RBAC = security

JWT = authentication
Database permissions = authorization

Rules engine = authoritative applicability logic
AI = extraction / explanation / retrieval assistance

Important state changes = auditable

Schema changes = Alembic migrations

Protected endpoints = authenticated + authorized

User-visible records = ownership/scope checked

Demo data = reproducible through seed.py

No hardcoded secrets

No direct main push

No unnecessary microservices
```

------------------------------------------------------------------------

## 48. Final Success Criteria

PRAVAH backend is ready for the SIH demonstration when:

1.  A fresh database can be initialized entirely through migrations.
2.  `python seed.py` creates the complete demo environment.
3.  All five demo accounts can log in.
4.  Each account sees only authorized data.
5.  The React frontend consumes real FastAPI data.
6.  The wizard produces a database-backed approval plan.
7.  The roadmap reflects dependencies.
8.  Documents can be uploaded, extracted and validated.
9.  Documents can be linked to applications.
10. Application state persists in PostgreSQL.
11. SLA risk is calculated from real application data.
12. Next-best-action uses actual blockers.
13. Incentive readiness uses stored eligibility rules.
14. Compliance and regulatory records are persisted.
15. RAG retrieves knowledge using pgvector.
16. Officer queues reflect real applications.
17. Policy analytics aggregate real records.
18. Admin configuration is permission-protected.
19. Important actions are auditable.
20. No critical feature depends on frontend mock data.

**Target:** a real, testable, database-backed FastAPI backend that can
replace PRAVAH's current mock/demo data without changing the core
frontend experience.
