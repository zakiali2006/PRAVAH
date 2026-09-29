# PRAVAH — Sequential Development Order (Whole Team)

**Purpose:** The MD assigns *ownership* per member, but ownership alone doesn't tell you the *order* things must be built in so nobody is blocked or building on top of something that doesn't exist yet. This file lays out that order — what has to exist before the next thing can start — so the six branches converge into one connected system instead of six disconnected ones stitched together at the end.

**Principle behind the ordering:** Follow the actual request path from the architecture diagram —
```
React → FastAPI → Service/Engine → Repository → PostgreSQL → Response → UI
```
— and the flagship user flow —
```
Wizard → Rules Engine → Approval Roadmap → Documents → Application → SLA Risk → Next-Best Action → Compliance
```
Anything upstream in these chains has to be usable (even in a rough/stubbed form) before the downstream piece can be properly tested end-to-end.

---

## Stage 0 — Day 0: Sync (Everyone, before any code)

Everyone:
```
git clone <repo>
git checkout develop
git pull origin develop
```
Local `.env` created from `.env.example`. Everyone reads the full MD, not just their own section, today — several later stages fail silently if someone skips this.

**Nothing downstream can safely start until Stage 1 exists**, so don't let this stage drag.

---

## Stage 1 — Foundation (Vinayak) — blocks almost everything

Nobody else can build real, connected APIs until this exists:

1. `backend/app/` skeleton (`core/`, `api/`, `models/`, `schemas/`, `services/`, `repositories/`, `engines/`, `ai/`, `integrations/`, `seed/`, `tests/`) + shared router registration.
2. `app/core/config.py` (centralized pydantic-settings) — every member's code reads config through this, so it must exist before anyone else adds env variables.
3. PostgreSQL + SQLAlchemy 2 + Alembic + pgvector extension enabled.
4. Core tables: `users`, `otp_verifications`, `refresh_tokens`, `audit_logs`, `departments`, `roles/permissions`.
5. Auth endpoints (`/api/auth/*`) + JWT + RBAC + roles (`INVESTOR`, `TRANSACTIONAL_USER`, `OFFICER`, `POLICY_ADMIN`, `SYSTEM_ADMIN`).
6. Docker Compose (Postgres + pgvector + FastAPI) and `.env.example`.

**Definition of done for this stage:** another member can clone, create `.env`, install, migrate, seed, start the backend, and log in — without editing source code.

**Why this blocks everyone:** every other member's endpoints need (a) the FastAPI app to register routes on, (b) `config.py` for their own settings, and (c) auth/RBAC to protect their routes and stamp audit logs. Building against a moving foundation means redoing work later.

---

## Stage 2 — Parallel base-data build (Bhagyesh + Zaki start together, once Stage 1 lands)

These two don't block each other and can run in parallel:

**Bhagyesh — Business & Application base:**
1. Business Profile API (`/api/business-profile`) + `business_profiles` table.
2. Factory Units API + `factory_units`/`midc_plots` tables.
3. Service Catalogue (`/api/services`) + `services`/`service_documents`/`document_types`/`departments` tables.
4. Applications API (`/api/services/{id}/apply`, tracking, etc.) + application state machine (`DRAFT → SUBMITTED → UNDER_REVIEW → ...`).

**Zaki — Document base (your module, see your separate phases file for the detailed breakdown):**
1. Document repository CRUD + `documents`/`document_types`/`application_documents` tables.
   - **Coordinate on `document_types`** — both you and Bhagyesh touch this table. Agree on ownership/shape before either of you migrates it, or you'll get a schema conflict.
2. Secure storage adapter, then the upload endpoint.

**Kajal can also start in parallel here**, but only the *infrastructure* pieces that don't need real content yet:
1. Centralized `llm_service.py` (Gemini client with retry/timeout/rate-limit handling).
2. `embeddings.py` (fixed embedding model).
3. `vector_store.py` / `retrieval.py` (pgvector search interface).

These three don't need Zaki's documents or Niraja's engines to exist yet — they're pure infrastructure other members will plug into later. Getting them locked early avoids the exact problem flagged in your phases file: two people building incompatible embedding pipelines.

---

## Stage 3 — Wizard + first-pass Rules Engine (Bhagyesh → Niraja hand-off)

1. **Bhagyesh:** Investor Wizard (`/api/wizard/run`) capturing sector/location/investment/capacity/employment/land status/project stage. This is the *input* the entire intelligence layer depends on — nothing in Stage 4 has real data to work with until this exists.
2. **Niraja:** Regulatory Applicability Rules Engine (`applicability_engine.py`), consuming wizard output, returning `REQUIRED`/`CONDITIONAL`/`NOT_REQUIRED` per rule with `rule_id`/`reason`/`source`.
3. **Niraja:** Approval Dependency Engine (sequencing applicable approvals).
4. **Niraja:** `GET /api/roadmap/{wizard_run_id}` — combines the two above into the actual roadmap.

**Hand-off point:** Bhagyesh's wizard schema and Niraja's rules-engine input contract need to match exactly. Agree on the wizard's output shape *before* Niraja builds the rules engine against a guess.

---

## Stage 4 — Documents meet the roadmap (Zaki continues, feeding Niraja)

By now your document pipeline (upload → OCR → extraction → validation) should be functional per your phases file. This stage is about connecting it to the rest of the system rather than building it in isolation:

1. Application-document linkage: documents attach to a specific application/approval step (Bhagyesh's `application_documents` + your `documents`).
2. Document validation results (`VALID`/`WARNING`/`INVALID`) become an input Niraja's engines can read — this is what lets "document completeness" feed into SLA risk later.
3. **Kajal:** document chunks/embeddings (your Phase 7) get indexed into the shared `vector_store` — this is what makes documents searchable/retrievable for RAG later.

**Hand-off point:** Niraja's SLA Risk Engine (Stage 5) needs "document completeness" as an input — so document validation has to be real, not a stub, before Stage 5 can be meaningfully tested.

---

## Stage 5 — Intelligence layer completes (Niraja, using everything upstream)

Now that wizard, rules, roadmap, and documents are real:

1. SLA Risk Engine (`risk_engine.py`, `sla_engine.py`) — consumes SLA consumption, unresolved queries, blocked dependencies, **document completeness (Stage 4)**, workload.
2. CAF AI Autofill — reads verified user/business/document data (Bhagyesh + Zaki) to pre-fill CAF fields without overwriting user input.
3. Next-Best Action — combines Roadmap + Risk + Regulatory Watch + Compliance + Document status + Application status into one actionable recommendation.
4. Incentive Readiness + Scenario Planner.
5. Compliance Calendar (auto-creates tasks after approval) + Regulatory Change Impact.

**Why this comes after Stage 4, not in parallel:** every one of these engines lists "document status" or "application status" as an input. Building them against fake/stubbed document data means retesting all of them again once real documents exist — better to absorb that cost once, here.

---

## Stage 6 — RAG and AI Query Assistant (Kajal, using the knowledge base + real documents)

1. Index the knowledge base (government rules, circulars, schemes, compliance info, FAQs) into pgvector via the Stage 2 infrastructure.
2. RAG retrieval pipeline: knowledge → embeddings → pgvector → retrieval → Gemini → grounded response.
3. AI Query Assistant endpoint, grounded in both the knowledge base *and* the real application/document data now flowing through the system (Stages 2–5).

**Why this comes late:** a query assistant grounded in nothing but static knowledge-base text is only half the product — the MD's intent is that it also reasons over the user's actual application/roadmap/risk state, which doesn't exist as real data until Stages 3–5 are functional.

---

## Stage 7 — Operations layer (Shreya, using applications + documents + risk)

Shreya's module largely *consumes* what everyone else built, so it naturally lands last:

1. Grievance CRUD, then grievance sentiment/similarity (**Kajal** contributes the AI side once Shreya's CRUD exists).
2. Officer queue + Officer SLA dashboard — needs real applications (Bhagyesh) and real risk scores (Niraja) to display anything meaningful.
3. Workload recommendation + Duplicate detection.
4. Policy analytics (bottleneck heatmap, sector/district/department analysis) — needs real application/risk/event data to not be a dashboard full of zeros.
5. Government adapters, DigiLocker layer, Payments, Notifications — integration-shaped work that can technically start earlier as stubs, but only becomes testable once real applications/documents/payments exist to trigger them.

---

## Stage 8 — Frontend integration, per module (everyone, ideally as their own module finishes — not all at once at the end)

Each member replaces `MockAppContext`/mock-data calls with real API calls **for their own screens** as soon as their backend piece is stable — don't wait for every backend module to be 100% done:

| Frontend area | Owner |
|---|---|
| Login, dashboard shell | Vinayak |
| Business profile, factory, services, applications, tracking, wizard, CAF | Bhagyesh |
| DocumentDrive, DocumentRepository, UploadDocumentModal, DocumentReview | Zaki |
| AI chat / query assistant UI | Kajal |
| Roadmap, risk, next-action, incentives, compliance UI | Niraja |
| Officer dashboard, policy dashboard, grievances, notifications, payments | Shreya |

**Rule:** the demo UI must stay functionally equivalent throughout — verify your own screen still behaves the same before merging, per the MD's Frontend Acceptance Rule.

---

## Stage 9 — Integration testing (everyone, converging into `develop`)

At minimum, this full path must work end-to-end using real database data, not mocks:
```
Login → Dashboard → Services → Application → Tracking → Document → Risk → Next Action
```
Each member's named branch → PR → `develop` → integration test → PR → `main`, per the MD's promotion path. This is also where the Final Integration Checklist (infra, auth, base platform, intelligence, security, reproducibility) gets run in full.

---

## Quick reference: what blocks what

```
Vinayak (foundation, auth)
   │
   ├──> Bhagyesh (business/applications) ──┐
   │                                        ├──> Niraja (rules/roadmap) ──┐
   ├──> Zaki (documents) ───────────────────┘                            │
   │         │                                                           ├──> Niraja (SLA risk, next-action,
   ├──> Kajal (AI infra: llm/embeddings/vector_store) <───────────────────┘    incentives, compliance)
   │         │                                                                        │
   │         └──> Kajal (RAG, query assistant) <───────────────────────────────────────┘
   │
   └──> Shreya (grievances, officer, policy, integrations) — consumes nearly everything above
```

If you're ever unsure whether you can start a piece of work, check this chain: if what's upstream of you in this diagram doesn't exist yet in at least a real, testable form, raise it in the group before building against a guess — that's the same rule from your own phases file, just applied at the whole-team level.
