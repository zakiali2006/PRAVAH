# PRAVAH — Full-Stack Backend, AI & Integration Team Plan

**Project:** PRAVAH — Predictive Regulatory Approval Verification & Assistance Hub  
**SIH Problem Statement:** SIH26130 — Efficiency in streamlining industrial approvals, compliance processes, and access to government support services  
**Team:** CookedDevelopers  
**Purpose of this document:** Single source of truth for backend, PostgreSQL/pgvector, AI, integrations, frontend refinement, Git branching, local setup, and final integration.

---

# 1. Project Goal

The current PRAVAH frontend is a highly polished prototype. The next development phase converts it into a real full-stack application.

## Target architecture

```text
Users / Stakeholders
        │
        ▼
React + TypeScript + Vite + Tailwind
        │
        │ HTTPS REST APIs
        ▼
FastAPI Application Layer
        │
        ├── Authentication + RBAC
        ├── User / Business Management
        ├── Applications
        ├── Services
        ├── Documents
        ├── Approval Workflows
        └── Notifications
        │
        ▼
PRAVAH Intelligence Layer
        │
        ├── Approval Roadmap
        ├── Document Pre-Validation
        ├── SLA Risk & Delay Prediction
        ├── Next-Best Action
        ├── AI Query Assistant
        ├── Post-Approval Compliance
        ├── Regulatory Change Impact
        ├── Incentive Readiness
        ├── Grievance Similarity / Sentiment
        ├── Duplicate Detection
        ├── Smart Workload Recommendation
        └── Policy Analytics
        │
        ├─────────────────────────┐
        ▼                         ▼
PostgreSQL                  pgvector
Structured data             Embeddings / semantic search
        │                         │
        └────────────┬────────────┘
                     ▼
              External Integrations
        MAITRI / Government adapters
        Email / SMS / Payment / DigiLocker
        Secure document storage
```

## Important product principle

PRAVAH does **not** replace MAITRI or government authorities.

PRAVAH adds an intelligence/orchestration layer over the approval lifecycle:

```text
Track & Wait  →  Predict & Act
Fragmented    →  Connected
Reactive     →  Predictive
Error-prone  →  Verified
Uncertain    →  Actionable
```

---

# 2. Universal Rules — MUST BE FOLLOWED BY EVERY MEMBER

## PRAVAH Backend & AI Team Guidelines

When working with a 6-member team on a complex project involving Backend APIs, Database Management, and AI Integrations, these standards are the single source of truth.

### 2.1 Universal Environment Variables

Never hardcode sensitive keys.

Every member must create a local `.env` file.

The repository must contain `.env.example`.

```ini
# .env.example

# --- ENVIRONMENT ---
ENV=development
DEBUG=True

# --- DATABASE ---
DATABASE_URL=postgresql://user:password@localhost:5432/pravah_db

# --- SECURITY & AUTH ---
SECRET_KEY=your-super-secret-jwt-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALGORITHM=HS256

# --- AI & LLM INTEGRATIONS ---
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
AI_MODEL_VISION=...
AI_MODEL_TEXT=...
MAX_TOKENS=2000

# --- EXTERNAL SERVICES ---
DIGILOCKER_CLIENT_ID=your_client_id
DIGILOCKER_CLIENT_SECRET=your_client_secret
SMTP_HOST=smtp.gmail.com
```

Rules:

- `.env` must NEVER be committed.
- `.env.example` must always be updated when a new variable is required.
- Development keys must never be embedded in source code.
- Use centralized configuration through `app/core/config.py`.

---

### 2.2 Shared `config.py`

Do not call `os.getenv()` throughout the project.

Use a centralized `pydantic-settings` configuration.

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PRAVAH API"
    DATABASE_URL: str
    SECRET_KEY: str

    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    AI_MODEL_TEXT: str = "gemini-1.5-flash"

    class Config:
        env_file = ".env"

settings = Settings()
```

Usage:

```python
from app.core.config import settings
```

---

### 2.3 Universal API Response Format

All members must use the same response structure.

Success:

```json
{
  "status": "success",
  "data": {},
  "message": "Operation completed successfully."
}
```

Error:

```json
{
  "status": "error",
  "error_code": "RESOURCE_NOT_FOUND",
  "message": "The requested resource was not found."
}
```

Do not invent different response wrappers per feature.

---

### 2.4 Universal AI Prompt Management

Prompts must NOT be hardcoded inside route handlers.

Use:

```text
backend/app/ai/prompts/
├── document_analysis.py
├── query_assistant.py
├── grievance_analysis.py
├── regulatory_analysis.py
└── summarization.py
```

Example:

```python
DOCUMENT_SCRUTINY_PROMPT = """
You are PRAVAH AI.
Analyze the provided document text against the supplied business profile.
Return structured JSON containing:
- business_name
- discrepancies
- missing_information
- confidence
- explanation

Never invent missing facts.
"""
```

---

### 2.5 Database Is the Source of Truth

After integration:

```text
React
 ↓
FastAPI
 ↓
Service
 ↓
Repository
 ↓
PostgreSQL / pgvector
```

Not:

```text
React → mockData.js
```

The existing mock data must be migrated into database seed data so the current demo behavior remains available after database integration.

---

### 2.6 Git Rules

- NEVER push directly to `main`.
- `main` is protected.
- Every feature must use a branch.
- Every completed feature requires a Pull Request.
- At least one other member must review the PR.
- Do not merge untested code.
- Do not rewrite another member's branch without coordination.
- Resolve conflicts locally before requesting merge.
- Keep commits small and meaningful.
- Use `black` + `flake8` for Python.
- Use the repository's configured frontend formatter/linter for React/TypeScript.

Commit examples:

```text
feat: add application tracking API
feat: integrate PostgreSQL authentication
feat: add document validation engine
fix: correct SLA risk calculation
test: add approval dependency tests
refactor: separate repository layer
docs: update API documentation
```

---

### 2.7 Dependency Rules

Never commit:

```text
node_modules/
venv/
__pycache__/
.env
```

Must commit:

```text
package.json
package-lock.json
requirements.txt
alembic/
alembic.ini
.env.example
docker-compose.yml
README.md
```

When dependencies change:

1. Update the dependency file.
2. Install locally.
3. Test.
4. Commit the dependency file and lockfile.
5. Tell the team what changed.

---

# 3. Team Git Architecture

Use this structure:

```text
main
 │
 └── develop
      │
      ├── vinayak
      │    ├── feature/vinayak/core-api
      │    ├── feature/vinayak/database
      │    ├── feature/vinayak/auth
      │    └── feature/vinayak/devops
      │
      ├── bhagyesh
      │    ├── feature/bhagyesh/business
      │    ├── feature/bhagyesh/services
      │    ├── feature/bhagyesh/applications
      │    └── feature/bhagyesh/wizard
      │
      ├── zaki
      │    ├── feature/zaki/documents
      │    ├── feature/zaki/storage
      │    ├── feature/zaki/ocr
      │    └── feature/zaki/frontend-document-integration
      │
      ├── kajal
      │    ├── feature/kajal/ai-core
      │    ├── feature/kajal/pgvector
      │    ├── feature/kajal/rag
      │    └── feature/kajal/query-assistant
      │
      ├── niraja
      │    ├── feature/niraja/rules-engine
      │    ├── feature/niraja/roadmap
      │    ├── feature/niraja/risk
      │    ├── feature/niraja/incentives
      │    └── feature/niraja/compliance-regulatory
      │
      └── shreya
           ├── feature/shreya/integrations
           ├── feature/shreya/notifications
           ├── feature/shreya/grievances
           ├── feature/shreya/officer
           └── feature/shreya/policy-analytics
```

## Branch flow

```text
main
  ↓
develop
  ↓
member branch
  ↓
feature sub-branch
  ↓
PR → member branch
  ↓
member branch tested
  ↓
PR → develop
  ↓
integration testing
  ↓
PR → main
  ↓
final release
```

### Important

Git does not create a literal hierarchy between branches. Names such as `feature/zaki/documents` are naming conventions.

---

# 4. Member 1 — Vinayak Chandrashekhar Kadate
**Role:** Team Leader / Core Architecture & DevOps

**(Note: This member must follow ALL universal PRAVAH Backend & AI Team Guidelines, Universal Environment Variables, Shared Configuration, Universal Response Formats, AI Prompt Management, Database-as-Source-of-Truth rules, Git/PR rules, linting rules, dependency rules, local setup rules, and Project Transition & Team Onboarding rules in this document. This note is mandatory for every branch and every merge.)**

## Primary branch

```text
vinayak
```

## Feature branches

```text
feature/vinayak/core-api
feature/vinayak/database
feature/vinayak/auth
feature/vinayak/rbac
feature/vinayak/audit
feature/vinayak/devops
```

## Main responsibility

Own the foundations that every other member depends on.

### A. FastAPI architecture

Build:

```text
backend/app/
├── main.py
├── core/
├── api/
├── models/
├── schemas/
├── services/
├── repositories/
├── engines/
├── ai/
├── integrations/
├── seed/
└── tests/
```

Create shared router registration.

### B. PostgreSQL

Set up:

- PostgreSQL
- SQLAlchemy 2
- Alembic
- PostgreSQL connection pooling
- transaction handling
- pgvector extension
- indexes
- database constraints

### C. Core models

Own foundational tables:

```text
users
otp_verifications
refresh_tokens
audit_logs
departments
roles/permissions
```

### D. Authentication

Implement:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/otp/send
POST /api/auth/otp/verify
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/logout
GET  /api/auth/me
```

Use:

- hashed passwords
- JWT
- refresh-token strategy
- RBAC
- authentication dependencies

### E. Roles

Implement:

```text
INVESTOR
TRANSACTIONAL_USER
OFFICER
POLICY_ADMIN
SYSTEM_ADMIN
```

### F. Audit system

Every important mutation must create an audit log.

At minimum:

- application status change
- document upload
- grievance action
- rule modification
- officer assignment
- payment update

### G. Docker / environment

Create:

```text
Dockerfile
docker-compose.yml
.env.example
README.md
```

Docker Compose must support local:

```text
PostgreSQL + pgvector
FastAPI
```

Frontend can run with:

```bash
npm install
npm run dev
```

### H. CI

Configure:

- Python syntax/test checks
- black
- flake8
- pytest
- frontend lint/build
- dependency verification

## Definition of Done

Another member can clone the project, create `.env`, install dependencies, run migrations, seed the database, start the backend and authenticate without manually modifying source code.

---

# 5. Member 2 — Bhagyesh Vijay Bhalerao
**Role:** Application & Services API

**(Note: This member must follow ALL universal PRAVAH Backend & AI Team Guidelines, Universal Environment Variables, Shared Configuration, Universal Response Formats, AI Prompt Management, Database-as-Source-of-Truth rules, Git/PR rules, linting rules, dependency rules, local setup rules, and Project Transition & Team Onboarding rules in this document. This note is mandatory for every branch and every merge.)**

## Primary branch

```text
bhagyesh
```

## Feature branches

```text
feature/bhagyesh/business
feature/bhagyesh/factory
feature/bhagyesh/services
feature/bhagyesh/applications
feature/bhagyesh/tracking
feature/bhagyesh/wizard
feature/bhagyesh/caf
feature/bhagyesh/frontend-api-integration
```

## Primary responsibility

Own the complete base application journey.

### A. Business Profile

Build:

```text
POST /api/business-profile
GET  /api/business-profile
PUT  /api/business-profile
```

Database:

```text
business_profiles
```

### B. Factory Units

Build:

```text
POST /api/factory-units
GET /api/factory-units
GET /api/factory-units/{id}
PUT /api/factory-units/{id}
DELETE /api/factory-units/{id}
```

Tables:

```text
factory_units
midc_plots
```

### C. Service Catalogue

Build:

```text
GET /api/services
GET /api/services/{id}
GET /api/services?department=
GET /api/services?sector=
```

Database:

```text
services
service_documents
document_types
departments
```

### D. Applications

Build:

```text
POST /api/services/{id}/apply
GET /api/applications
GET /api/applications/{id}
GET /api/applications/{id}/track
POST /api/applications/{id}/documents
POST /api/applications/{id}/pay
```

Tables:

```text
applications
application_stages
application_documents
payments
```

### E. Application state machine

Implement valid transitions:

```text
DRAFT
 ↓
SUBMITTED
 ↓
UNDER_REVIEW
 ↓
QUERY_RAISED / DOCUMENT_REQUIRED
 ↓
UNDER_REVIEW
 ↓
APPROVED / REJECTED
 ↓
COMPLETED
```

Every status transition must be audited.

### F. Investor Wizard

Build:

```text
POST /api/wizard/run
GET /api/wizard/runs
GET /api/wizard/runs/{id}
```

The wizard captures:

- sector
- location
- investment
- capacity
- employment
- land status
- project stage
- relevant project parameters

Store answers in PostgreSQL.

### G. CAF

Build the base CAF data layer:

```text
POST /api/wizard/runs/{id}/generate-caf
POST /api/caf
GET /api/caf/{id}
GET /api/caf/{id}/services
```

AI auto-fill logic belongs to Member 5, but this member owns the business/application data contract.

### H. Frontend integration

Refine existing frontend pages without changing the current successful UI unnecessarily:

```text
ServicesAvailable
ServicesApplied
ApplicationTracking
BusinessProfile
Factory
Wizard
CAF
```

Remove production dependency on MockAppContext for these flows.

## Definition of Done

A real logged-in investor can create/view business data, factory data, view services, submit an application, see application tracking, and persist the data in PostgreSQL.

---

# 6. Member 3 — Saiyyad Zaki Ali
**Role:** Document Management & Document Pipeline

**(Note: This member must follow ALL universal PRAVAH Backend & AI Team Guidelines, Universal Environment Variables, Shared Configuration, Universal Response Formats, AI Prompt Management, Database-as-Source-of-Truth rules, Git/PR rules, linting rules, dependency rules, local setup rules, and Project Transition & Team Onboarding rules in this document. This note is mandatory for every branch and every merge.)**

## Primary branch

```text
zaki
```

## Feature branches

```text
feature/zaki/documents
feature/zaki/storage
feature/zaki/upload
feature/zaki/ocr
feature/zaki/extraction
feature/zaki/validation-api
feature/zaki/frontend-document-integration
```

## Primary responsibility

Own the document lifecycle from upload to processed document data.

### A. Document Repository

Build:

```text
POST /api/documents
GET /api/documents
GET /api/documents/{id}
DELETE /api/documents/{id}
```

Tables:

```text
documents
document_types
application_documents
```

### B. Secure document storage

Support:

- local development storage
- production object storage adapter
- secure file access
- MIME validation
- file-size validation
- file-extension validation
- generated IDs
- no direct public file exposure

Use an adapter:

```text
FileStorageInterface
       │
       ├── LocalStorage
       └── CloudStorage
```

### C. OCR pipeline

Implement:

```text
uploaded file
      ↓
file validation
      ↓
OCR
      ↓
extracted text
      ↓
structured extracted data
      ↓
validation engine
```

Create:

```text
ocr_engine.py
extraction_engine.py
```

### D. Document validation

Implement:

```text
POST /api/documents/{id}/validate
GET /api/documents/{id}/validation
```

Check:

- document type
- business name
- address
- expiry
- page count
- signature presence
- required fields
- mismatch with business profile
- duplicate document signals

Result:

```text
VALID
WARNING
INVALID
```

### E. Frontend integration

Refine and connect:

```text
DocumentDrive
DocumentRepository
UploadDocumentModal
DocumentReview
Application document upload
Document validation result
```

Remove fake local-only upload behavior.

### F. pgvector contribution

Generate document chunks/embeddings after extraction.

Store:

```text
document_id
chunk_id
content
embedding
metadata
```

Coordinate with Member 4 for vector retrieval.

## Definition of Done

Uploading a real PDF/image creates a PostgreSQL record, stores the file, processes it, extracts text, validates it, and exposes the validation result through the API.

---

# 7. Member 4 — Kajal Santosh Ahire
**Role:** AI Integration — Core / RAG / Query Assistant

**(Note: This member must follow ALL universal PRAVAH Backend & AI Team Guidelines, Universal Environment Variables, Shared Configuration, Universal Response Formats, AI Prompt Management, Database-as-Source-of-Truth rules, Git/PR rules, linting rules, dependency rules, local setup rules, and Project Transition & Team Onboarding rules in this document. This note is mandatory for every branch and every merge.)**

## Primary branch

```text
kajal
```

## Feature branches

```text
feature/kajal/ai-core
feature/kajal/embeddings
feature/kajal/pgvector
feature/kajal/rag
feature/kajal/query-assistant
feature/kajal/grievance-similarity
feature/kajal/ai-prompts
feature/kajal/frontend-ai-integration
```

## Primary responsibility

Own the shared AI infrastructure.

### A. Gemini integration

Create a centralized AI client:

```text
app/ai/llm_service.py
```

Requirements:

- timeout handling
- retry handling
- rate-limit handling
- structured JSON output
- error normalization
- token limits

### B. Embeddings

Create:

```text
app/ai/embeddings.py
```

Use the selected embedding model consistently.

### C. pgvector

Create:

```text
app/ai/vector_store.py
app/ai/retrieval.py
```

Support:

```text
semantic search
top-k retrieval
metadata filtering
similarity threshold
```

### D. RAG knowledge base

Index:

- government rules
- approval requirements
- regulations
- circulars
- schemes
- incentives
- compliance information
- curated FAQ knowledge

Flow:

```text
Knowledge source
 ↓
Chunk
 ↓
Embedding
 ↓
pgvector
 ↓
Semantic retrieval
 ↓
LLM
 ↓
Grounded answer
```

### E. AI Query Assistant

Implement:

```text
POST /api/chat
POST /api/queries
GET /api/queries
```

The assistant must use live application data.

Example:

```text
"Why is my Fire NOC delayed?"
```

Flow:

```text
User question
 ↓
Intent detection
 ↓
Application lookup
 ↓
Tracking
 ↓
Dependencies
 ↓
Risk engine
 ↓
Relevant knowledge via pgvector
 ↓
Gemini
 ↓
Grounded response
```

### F. Grievance similarity

Use pgvector to find similar/repeated grievances.

Support:

```text
GET /api/grievances/{id}/similar
```

### G. AI explanation layer

AI should explain outputs from deterministic engines.

It must NOT independently decide:

- legal applicability
- final approval eligibility
- official application status
- final incentive eligibility

## Definition of Done

The assistant can answer a real user query using current database information and retrieved knowledge, with no unsupported hallucinated facts.

---

# 8. Member 5 — Niraja Guruswami Kurra
**Role:** AI Integration — Automation / Decision Engines

**(Note: This member must follow ALL universal PRAVAH Backend & AI Team Guidelines, Universal Environment Variables, Shared Configuration, Universal Response Formats, AI Prompt Management, Database-as-Source-of-Truth rules, Git/PR rules, linting rules, dependency rules, local setup rules, and Project Transition & Team Onboarding rules in this document. This note is mandatory for every branch and every merge.)**

## Primary branch

```text
niraja
```

## Feature branches

```text
feature/niraja/rules-engine
feature/niraja/dependency-engine
feature/niraja/roadmap
feature/niraja/document-ai
feature/niraja/caf-autofill
feature/niraja/sla-risk
feature/niraja/next-best-action
feature/niraja/incentives
feature/niraja/compliance
feature/niraja/regulatory-impact
feature/niraja/frontend-intelligence-integration
```

## Primary responsibility

Own the decision/intelligence engines that sit on top of the base application system.

### A. Regulatory Applicability Rules Engine

Create:

```text
app/engines/rules/
├── applicability_engine.py
├── rule_evaluator.py
└── rule_explanation.py
```

Input:

```text
sector
location
investment
capacity
employment
land status
project stage
```

Output:

```text
REQUIRED
CONDITIONAL
NOT_REQUIRED
```

Every decision must include:

```text
rule_id
rule_version
reason
source
effective date
```

The legal decision itself must come from structured rules, not an LLM.

### B. Approval Dependency Engine

Create:

```text
app/engines/dependency/
├── dependency_engine.py
└── graph_builder.py
```

Support:

- sequential approvals
- parallel approvals
- blocked dependencies
- dependency explanation
- estimated timeline

### C. AI Approval Roadmap

Build:

```text
GET /api/roadmap/{wizard_run_id}
```

Flow:

```text
Wizard
 ↓
Rules Engine
 ↓
Applicable approvals
 ↓
Dependency Engine
 ↓
Roadmap
 ↓
Next action
```

### D. CAF AI Autofill

Build logic that reads verified user/business/document information and pre-fills application/CAF data.

Do not overwrite user-entered values silently.

Return:

```text
field
value
source
confidence
```

### E. SLA Risk Engine

Create:

```text
app/engines/risk/
├── risk_engine.py
├── sla_engine.py
└── risk_explanation.py
```

Inputs:

- SLA consumption
- unresolved query age
- blocked dependency
- document completeness
- workload

Output:

```text
risk_score
risk_level
reasons
blocking_factor
recommended_action
```

Use transparent weighted rules initially.

### F. Next-Best Action

Combine:

```text
Roadmap
Risk
Regulatory Watch
Compliance
Document status
Application status
```

into one actionable output.

Example:

```text
"Upload the corrected land ownership certificate."
```

### G. Incentive Readiness

Build:

```text
GET /api/incentives/readiness
POST /api/incentives/scenario
```

Return:

- potentially eligible schemes
- matched conditions
- missing evidence
- readiness score
- next actions

Never claim final legal eligibility.

### H. Compliance Calendar

Build:

```text
GET /api/compliance-calendar
GET /api/compliance-calendar/{id}
POST /api/compliance-calendar/{id}/complete
```

Automatically create tasks after approval.

### I. Regulatory Change Impact

Build:

```text
GET /api/regulatory-watch
GET /api/regulatory-watch/{id}/impact
```

Find businesses/projects affected by a regulatory change.

## Definition of Done

A project can be run through the wizard and receive an explainable approval plan, dependencies, risk result, next-best action, incentive readiness, and compliance impact from real database records.

---

# 9. Member 6 — Shreya Sameer Chaitwar
**Role:** Integrations, Notifications, Grievances & Government/Policy Operations

**(Note: This member must follow ALL universal PRAVAH Backend & AI Team Guidelines, Universal Environment Variables, Shared Configuration, Universal Response Formats, AI Prompt Management, Database-as-Source-of-Truth rules, Git/PR rules, linting rules, dependency rules, local setup rules, and Project Transition & Team Onboarding rules in this document. This note is mandatory for every branch and every merge.)**

## Primary branch

```text
shreya
```

## Feature branches

```text
feature/shreya/government-adapters
feature/shreya/digilocker
feature/shreya/payments
feature/shreya/notifications
feature/shreya/grievances
feature/shreya/officer-dashboard
feature/shreya/workload
feature/shreya/duplicates
feature/shreya/policy-analytics
feature/shreya/heatmap
feature/shreya/frontend-operations-integration
```

## Primary responsibility

Own external service boundaries and government/officer-facing operational functionality.

### A. Government adapter system

Create:

```text
integrations/government/
├── base_adapter.py
├── maitri_adapter.py
└── department_adapter.py
```

Important:

Do not claim a live government integration unless an actual API exists.

Use adapter interfaces so real integration can be added later.

### B. DigiLocker adapter

Create interface for:

```text
document retrieval
identity/document reference
verification status
```

Real credentials belong only in `.env`.

### C. Payment adapter

Create:

```text
PaymentAdapter
MockPaymentAdapter
RealPaymentAdapter
```

Support:

```text
POST /api/applications/{id}/pay
```

Do not place payment-provider code inside application routes.

### D. Notification system

Support:

```text
email
SMS
in-app notifications
```

Use:

```text
notification_service.py
```

Events:

- application submitted
- query raised
- document failed validation
- SLA risk
- SLA breach
- approval
- compliance due
- regulatory impact

### E. Grievances

Build:

```text
POST /api/grievances
GET /api/grievances
GET /api/grievances/{id}
POST /api/grievances/{id}/close
```

Integrate with:

- sentiment result from AI
- pgvector similarity from Member 4
- priority
- department
- officer assignment

### F. Officer SLA Dashboard

Build:

```text
GET /api/officer/queue
GET /api/officer/sla-dashboard
GET /api/officer/workload
```

Show:

- high-risk applications
- SLA remaining
- current workload
- department
- expertise
- pending queries
- missing documents

### G. Smart workload recommendation

Recommend officer assignment from:

- expertise
- workload
- queue
- district
- application type
- SLA risk

Keep recommendation explainable.

### H. Duplicate Detection

Build:

```text
GET /api/officer/duplicates
```

Use:

- exact field matches
- fuzzy matching
- PAN/address signals
- pgvector similarity where appropriate

Flag for manual review.

Do not automatically accuse an applicant of fraud.

### I. Policy analytics

Build:

```text
GET /api/policy/bottleneck-heatmap
GET /api/policy/regulatory-impact
GET /api/policy/sector-analysis
GET /api/policy/district-analysis
GET /api/policy/department-analysis
```

Use actual application/risk/event data wherever possible.

### J. Frontend

Refine/connect:

```text
Officer Dashboard
Policy Dashboard
Grievances
Notifications
Payments
Government integration status
```

## Definition of Done

Operational users can see actionable queues, notifications, grievances, workload information and policy analytics backed by real database data.

---

# 10. Feature Ownership Matrix

| Feature | Primary owner | Supporting owner |
|---|---|---|
| FastAPI foundation | Vinayak | All |
| PostgreSQL | Vinayak | All |
| pgvector infrastructure | Kajal | Vinayak |
| JWT / Auth | Vinayak | Bhagyesh |
| RBAC | Vinayak | Shreya |
| Business profile | Bhagyesh | Vinayak |
| Factory units | Bhagyesh | Vinayak |
| MIDC plot | Bhagyesh | Shreya |
| Service catalogue | Bhagyesh | Vinayak |
| Applications | Bhagyesh | Shreya |
| Application tracking | Bhagyesh | Niraja |
| Wizard | Bhagyesh | Niraja |
| Approval rules | Niraja | Bhagyesh |
| Dependency engine | Niraja | Bhagyesh |
| Approval roadmap | Niraja | Bhagyesh |
| Document repository | Zaki | Vinayak |
| Secure storage | Zaki | Shreya |
| OCR | Zaki | Niraja |
| Document validation | Zaki | Niraja |
| Embeddings | Kajal | Zaki |
| RAG | Kajal | Zaki |
| AI Query Assistant | Kajal | Niraja |
| CAF data/API | Bhagyesh | Niraja |
| CAF AI autofill | Niraja | Bhagyesh |
| SLA engine | Niraja | Bhagyesh |
| Risk prediction | Niraja | Kajal |
| Next-Best Action | Niraja | Bhagyesh/Kajal |
| Incentive readiness | Niraja | Bhagyesh |
| Compliance calendar | Niraja | Shreya |
| Regulatory watch | Niraja | Shreya/Kajal |
| Regulatory impact | Niraja | Shreya |
| Grievance CRUD | Shreya | Bhagyesh |
| Grievance sentiment | Kajal | Shreya |
| Grievance similarity | Kajal | Shreya |
| Officer queue | Shreya | Niraja |
| Officer SLA dashboard | Shreya | Niraja |
| Workload recommendation | Shreya | Niraja |
| Duplicate detection | Shreya | Kajal |
| Policy heatmap | Shreya | Niraja |
| Payment adapter | Shreya | Vinayak |
| DigiLocker adapter | Shreya | Zaki |
| Government adapters | Shreya | Bhagyesh |
| Notifications | Shreya | Vinayak |
| Audit | Vinayak | All |
| Docker/CI | Vinayak | All |
| Final integration | Vinayak | All |

---

# 11. Database Ownership / Collaboration

No member should create isolated duplicate tables.

## Core relational tables

```text
users
otp_verifications
refresh_tokens
business_profiles
factory_units
midc_plots
departments
services
document_types
service_documents
approval_rules
rule_versions
approval_dependencies
wizard_runs
wizard_results
applications
application_stages
application_documents
payments
caf_forms
caf_services
documents
document_validation_results
queries
grievances
incentive_schemes
incentive_rules
incentive_readiness
compliance_tasks
regulatory_changes
regulatory_impacts
risk_assessments
notifications
officers
officer_workloads
duplicate_flags
application_events
audit_logs
```

## Vector tables

```text
document_embeddings
knowledge_embeddings
grievance_embeddings
```

Coordinate vector dimensions and embedding-model version before creating vector migrations.

---

# 12. Important Database Design Rules

### PostgreSQL

Use normal relational columns for:

- users
- businesses
- applications
- services
- statuses
- officers
- dates
- relationships

### JSONB

Use JSONB for:

- wizard answers
- rule conditions
- extracted document fields
- risk reasons
- AI metadata
- scenario parameters

### pgvector

Use pgvector for:

- semantic knowledge retrieval
- document similarity
- grievance similarity
- duplicate/near-duplicate signals
- AI assistant retrieval

Do not use vector similarity as the legal approval rules engine.

---

# 13. Demo Data Migration

This is mandatory.

The existing demo behavior that produced the internal hackathon result must remain available after backend integration.

Migration:

```text
Existing mock data
       ↓
Extract current values
       ↓
Seed scripts
       ↓
PostgreSQL
       ↓
FastAPI
       ↓
React
```

Seed:

- demo users
- business profile
- factory unit
- departments
- services
- applications
- application stages
- documents
- incentives
- grievances
- compliance items
- regulatory alerts
- officers
- risk examples
- approval rules
- approval dependencies
- vector knowledge data

Do not simply replace mock data with empty database tables.

---

# 14. Demo Authentication Requirement

The existing frontend has autofilled demo credentials.

Preserve that experience.

Example:

```text
User ID: DEMO001
Password: demo123
```

The actual credentials must be verified against PostgreSQL.

Flow:

```text
React
 ↓
POST /api/auth/login
 ↓
FastAPI
 ↓
users table
 ↓
password hash verification
 ↓
JWT
 ↓
React authenticated state
 ↓
dashboard API calls
```

Never use frontend logic such as:

```javascript
if (id === "DEMO001") login();
```

The demo account must exist in PostgreSQL.

Password must be stored as a hash.

---

# 15. Local Setup — Must Work on Every Laptop

A new team member should be able to clone the repository and run the whole project.

## Required software

- Git
- Node.js LTS
- npm
- Python 3.12+ / compatible project version
- PostgreSQL OR Docker Desktop

Recommended for easiest setup:

```text
Docker Desktop
```

for PostgreSQL + pgvector.

---

## Backend

```bash
cd backend

python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
source venv/bin/activate
```

Install:

```bash
pip install -r requirements.txt
```

---

## Frontend

```bash
cd frontend
npm install
```

Never commit:

```text
node_modules
```

`package-lock.json` must be committed.

---

## Database with Docker

Preferred development setup:

```bash
docker compose up -d postgres
```

The PostgreSQL image must support pgvector.

Then:

```bash
cd backend
alembic upgrade head
python -m app.seed.seed
```

---

## Backend start

```bash
uvicorn app.main:app --reload --port 8000
```

Swagger:

```text
http://localhost:8000/docs
```

---

## Frontend start

```bash
cd frontend
npm run dev
```

---

# 16. Reproducible Database Reset

Create a development-safe reset process.

Example:

```bash
alembic downgrade base
alembic upgrade head
python -m app.seed.seed
```

Or provide a dedicated script:

```bash
python -m app.seed.reset_and_seed
```

The team must be able to recreate the same demo database from a fresh laptop.

---

# 17. Environment Independence

Do not assume a member already has:

- a specific database name
- a specific Windows path
- a specific Python path
- globally installed packages
- an AI API key
- cloud-storage credentials

Everything required for setup must be documented.

Use relative paths.

Never use paths such as:

```text
D:\Projects\...
C:\Users\...
```

inside application code.

---

# 18. Migration Discipline

Whenever a database schema changes:

```text
Model change
   ↓
Alembic migration
   ↓
Test migration
   ↓
Commit migration
```

Never tell another member:

> "Just manually add this column in PostgreSQL."

If the schema changes, there must be a migration.

---

# 19. API Contract Discipline

Before implementing a frontend integration:

```text
Frontend requirement
        ↓
API endpoint
        ↓
Request schema
        ↓
Response schema
        ↓
Backend implementation
```

Every endpoint must have:

- request schema
- response schema
- authentication requirement
- role requirement
- error codes
- test

Swagger should document it automatically.

---

# 20. Core Endpoints

## Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/otp/send
POST /api/auth/otp/verify
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/logout
GET  /api/auth/me
```

## Business

```text
POST /api/business-profile
GET  /api/business-profile
PUT  /api/business-profile
```

## Factory

```text
POST   /api/factory-units
GET    /api/factory-units
GET    /api/factory-units/{id}
PUT    /api/factory-units/{id}
DELETE /api/factory-units/{id}
```

## Wizard / Roadmap

```text
POST /api/wizard/run
GET  /api/wizard/runs
GET  /api/wizard/runs/{id}
POST /api/wizard/runs/{id}/generate-caf
GET  /api/roadmap/{wizard_run_id}
```

## Documents

```text
POST   /api/documents
GET    /api/documents
GET    /api/documents/{id}
DELETE /api/documents/{id}
POST   /api/documents/{id}/validate
GET    /api/documents/{id}/validation
```

## Services / Applications

```text
GET  /api/services
GET  /api/services/{id}
POST /api/services/{id}/apply

GET  /api/applications
GET  /api/applications/{id}
GET  /api/applications/{id}/track

POST /api/applications/{id}/documents
POST /api/applications/{id}/pay
```

## Intelligence

```text
GET /api/applications/{id}/risk
GET /api/compliance-calendar
GET /api/regulatory-watch
GET /api/incentives/readiness
GET /api/dashboard/next-best-action
```

## Grievance / Query

```text
POST /api/queries
GET  /api/queries
POST /api/grievances
GET  /api/grievances
GET  /api/grievances/{id}
POST /api/grievances/{id}/close
```

## Officer

```text
GET /api/officer/queue
GET /api/officer/sla-dashboard
GET /api/officer/duplicates
GET /api/officer/workload
POST /api/officer/applications/{id}/recommend-assignment
```

## Policy

```text
GET /api/policy/bottleneck-heatmap
GET /api/policy/regulatory-impact
GET /api/policy/sector-analysis
GET /api/policy/district-analysis
```

---

# 21. Flagship PRAVAH Workflow

This workflow must eventually work end-to-end.

```text
Investor
   ↓
Project Wizard
   ↓
Business / Factory Data
   ↓
Rules Engine
   ↓
Applicable Approvals
   ↓
Dependency Engine
   ↓
AI Approval Roadmap
   ↓
Document Checklist
   ↓
Document Upload
   ↓
OCR + Extraction
   ↓
Document Validation
   ↓
Application Submission
   ↓
Department Application
   ↓
Tracking
   ↓
SLA Engine
   ↓
Risk Engine
   ↓
Next-Best Action
   ↓
Escalation / Notification
   ↓
Approval
   ↓
Compliance Calendar
   ↓
Regulatory Watch
   ↓
Incentive / Support Intelligence
```

---

# 22. AI Architecture Rules

## Deterministic rules

Use backend code + database:

```text
approval applicability
dependency order
SLA calculation
risk scoring
workflow status
incentive conditions
compliance deadlines
```

## AI / LLM

Use for:

```text
OCR interpretation
document explanation
semantic retrieval
natural-language Q&A
summarization
grievance sentiment
explanation generation
```

## pgvector

Use for:

```text
semantic knowledge search
document similarity
grievance similarity
duplicate signals
RAG retrieval
```

Do not use:

```text
LLM → arbitrary legal decision
```

---

# 23. Frontend Acceptance Rule

After migration from mock data:

```text
Before:
React → Mock Data → UI

After:
React → FastAPI → PostgreSQL → UI
```

The demo UI should remain functionally equivalent.

Verify:

- login
- dashboard
- services
- applications
- tracking
- incentives
- grievances
- chat
- document repository

The source changes; the successful user experience should not unexpectedly disappear.

---

# 24. Testing Requirements

Every member must test their own feature before PR.

## Backend

```bash
pytest
```

Test:

- success
- validation errors
- authorization
- not found
- database persistence
- edge cases

## Frontend

```bash
npm run lint
npm run build
```

## Integration

At minimum test:

```text
Login
 ↓
Dashboard
 ↓
Services
 ↓
Application
 ↓
Tracking
 ↓
Document
 ↓
Risk
 ↓
Next Action
```

---

# 25. Final Integration Checklist

## Infrastructure

- [ ] FastAPI boots
- [ ] PostgreSQL connects
- [ ] pgvector loads
- [ ] Alembic migrations run
- [ ] Seed script works
- [ ] Docker works
- [ ] `.env.example` complete

## Authentication

- [ ] Demo account seeded
- [ ] Login uses database
- [ ] JWT works
- [ ] RBAC works
- [ ] Logout works

## Base platform

- [ ] Business profile
- [ ] Factory units
- [ ] Services
- [ ] Applications
- [ ] Tracking
- [ ] Documents
- [ ] Grievances
- [ ] Incentives

## Intelligence

- [ ] Rules engine
- [ ] Dependency engine
- [ ] Approval roadmap
- [ ] OCR
- [ ] Document validation
- [ ] SLA risk
- [ ] Next best action
- [ ] Compliance
- [ ] Regulatory watch
- [ ] Incentive readiness
- [ ] RAG
- [ ] AI Query Assistant
- [ ] Grievance similarity
- [ ] Officer queue
- [ ] Workload recommendation
- [ ] Duplicate detection
- [ ] Policy heatmap

## Security

- [ ] Password hashing
- [ ] JWT protection
- [ ] RBAC
- [ ] No secrets in Git
- [ ] File access protected
- [ ] Audit logs
- [ ] Input validation

## Reproducibility

- [ ] Fresh-clone setup tested
- [ ] `npm install` works
- [ ] `pip install -r requirements.txt` works
- [ ] Docker database works
- [ ] `alembic upgrade head` works
- [ ] Seed works
- [ ] Demo login works
- [ ] Frontend build works
- [ ] Backend tests pass

---

# 26. Definition of "Ready for Main"

A branch may be merged only when:

```text
Code written
   ↓
Local test passed
   ↓
Dependencies updated
   ↓
Migration included
   ↓
Seed data included if needed
   ↓
API tested
   ↓
Frontend tested
   ↓
No secrets committed
   ↓
Lint/build passes
   ↓
PR created
   ↓
Second member reviews
   ↓
Conflicts resolved
   ↓
PR merged
```

---

# 27. Final Rule for the Team

Do NOT measure progress by:

```text
"How many files did we create?"
```

Measure progress by:

```text
"How many complete real user flows work?"
```

The target is:

```text
Real user
   ↓
Real React frontend
   ↓
Real FastAPI API
   ↓
Real PostgreSQL data
   ↓
Real intelligence engine
   ↓
Real response
   ↓
Real UI update
```

When the six branches are combined:

```text
Feature branches
      ↓
Member branches
      ↓
develop
      ↓
integration testing
      ↓
main
```

the repository must run on a new laptop using only the documented setup steps, without manually editing source code or recreating database data.

---

# 28. Recommended Final Repository

```text
PRAVAH/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env.example
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   ├── ARCHITECTURE.md
│   └── SETUP.md
│
├── scripts/
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# 29. Team Start Sequence

## Day 0 — Synchronize

Everyone:

```bash
git clone <repository>
cd PRAVAH
git checkout develop
git pull origin develop
```

Create local environment.

## Day 1 — Foundations

Vinayak:

```text
FastAPI
PostgreSQL
pgvector
Alembic
Auth
RBAC
Docker
```

Bhagyesh:

```text
Business
Factory
Services
Applications
```

Zaki:

```text
Documents
Storage
Upload
```

Kajal:

```text
Gemini
Embeddings
pgvector
RAG foundation
```

Niraja:

```text
Rules
Dependencies
Roadmap
Risk architecture
```

Shreya:

```text
Adapters
Notifications
Grievances
Officer/Policy architecture
```

## Day 2+

Build feature sub-branches, merge into member branches, then integrate into `develop`.

---

# 30. Final Ownership Principle

Each member owns their domain, but **no domain is isolated**.

```text
Vinayak
  ↓ foundation

Bhagyesh
  ↓ business + applications

Zaki
  ↓ documents

Kajal
  ↓ AI/RAG

Niraja
  ↓ intelligence engines

Shreya
  ↓ integrations + operations
```

Together:

```text
                 PRAVAH
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
   Core Data     Application     Documents
      │             │             │
      └─────────────┼─────────────┘
                    ▼
             Intelligence
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
         RAG       Risk     Roadmap
          │         │         │
          └─────────┼─────────┘
                    ▼
          Integrations / Ops
                    │
                    ▼
               Final PRAVAH
```

---

**This document is the team's implementation reference. Any new feature, branch, API, database table, AI integration, dependency, or deployment change must respect these shared rules.**
