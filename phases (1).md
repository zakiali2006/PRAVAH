# UdyogSetu — Full Build Phases

**Source:** UdyogSetu-PRD-Full-Build.md (v3.0)
**Scope of this document:** Every module in Part A (base platform) and every feature in Part B (AI layer) is in scope for full development. There is no MVP tier, no stretch tier, and no "not built for hackathon" list — those constraints from PRD Section 11 are explicitly overridden. Nothing is mocked as a permanent end-state; where the PRD says "mock adapter," that mock is a Phase 0 placeholder to be swapped for a real integration in a later phase, not a thing left mocked forever.

**How to use this file:** Each phase is a self-contained unit of work for an agent to pick up and finish before moving to the next phase. Phases are ordered by dependency, not by feature importance — a later phase in this list is not less important than an earlier one, it just depends on something built earlier. Within a phase, build backend (data model + API) before frontend, and build the base module fully functional before wiring any AI layer onto it. Every phase ends with an explicit "Definition of Done" — do not proceed to the next phase until it is satisfied.

---

## Phase 0 — Foundation & Infrastructure

**Goal:** Stand up the skeleton every later phase builds on.

**Build:**
- Repo structure (frontend + backend, or monorepo), chosen per Section 12 tech stack: React + Tailwind frontend, Node.js/Express (or Django/Flask) backend, PostgreSQL database, Cloudinary for file/document storage and delivery (deviates from the PRD's S3-compatible suggestion in Section 12 — Cloudinary chosen for its free tier and built-in document/image transformation).
- Base `User` table and JWT-based session auth scaffold (no OTP yet — stub it) with RBAC roles: Investor/Business, Transactional User, Department Officer, Government/Policy Admin, System Admin.
- Global `AuditLog` entity and a logging middleware/hook that every later phase's write endpoints must call — this must exist before Phase 1 so no module ships without audit coverage.
- Docker setup for local dev and deployment (Section 12).
- Mock adapter pattern for anything that would call a real external government/payment/SMS system — one shared interface so later phases (and Phase 21) can swap mocks for real integrations without touching calling code.
- CI basics: lint, typecheck, test runner wired up even if the test suite starts empty.

**Definition of Done:** Empty app boots, a user row can be created and authenticated against, RBAC middleware rejects a wrong-role request, an audit log row is written on a test action, Docker compose brings up app + Postgres locally, and a test file round-trips through Cloudinary (upload + retrieve URL).

---

## Phase 1 — Onboarding & Identity (PRD 5.1)

**Build:**
- Registration & Sign-Up: entity type selection (Indian/Foreign), email + mobile OTP verification (real OTP provider now, per Section 12 "Auth"), registration form (name, Aadhaar/Virtual ID, DOB, business name, PAN, address, state/district/taluka/village, password), terms acceptance.
- Login: email + password + captcha, forgot-password via emailed reset link.
- Business Profile: entity name, HQ address, country/state/city, pincode, mobile, email, website, "operations outside India" flag. View/update at any time.
- **Shared data source requirement:** Business Profile must be implemented as a single source of truth that every later form (Factory Unit, Wizard, Services, CAF) reads from to auto-populate — build this as a reusable data-fetching layer/hook now, not per-form later.
- Encrypted storage for Aadhaar/PAN fields (Section 10 security requirement) — implement encryption at rest in this phase since every later phase touching identity data depends on it.

**API:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/otp/verify`, `POST /api/business-profile`, `PUT /api/business-profile/:id`.

**Definition of Done:** A user can register, verify OTP, log in, create and edit a Business Profile, and that profile's data is fetchable by a shared service other modules can call.

---

## Phase 2 — Factory & Plot Setup (PRD 5.2)

**Build:**
- Factory Units: add unit (name, sector/sub-sector, address, district, nature of unit, land required, ODOP flag, expansion flag), branching questions "Register with MIDC?" / "Register with MPCB?" each revealing extra required fields when Yes, Factory Unit list with Edit/Delete.
- MIDC Plot Registration: full form (applicant info, role — Owner/Company Employee/Consultant, address, required docs — Deed of Constitution, Letter of Allotment, MIDC BCC/DCC, up to 5 supporting docs, self-declaration checkbox), MIDC Plot List with status column and refresh action.
- Every service application built in later phases must reference a specific Factory Unit — enforce this as a foreign-key constraint now.

**API:** `POST/GET/PUT/DELETE /api/factory-units`, `POST /api/midc-plots`, `GET /api/midc-plots/:id/status`.

**Definition of Done:** A business can add/edit/delete factory units with conditional MIDC/MPCB fields, and submit a MIDC Plot Registration with document attachments and a working status list.

---

## Phase 3 — Document Repository (PRD 5.4)

**Build now (ahead of Services) because Services, Wizard-generated CAF, and later AI validation all depend on a working document store.**
- "Document Drive" tab: upload with Attachment Type, file, description; searchable/filterable list (Type, Description, Actions: view/delete/download).
- "Document Issued" tab: department-issued documents (certificates), kept separate from self-uploaded ones.
- Reusability requirement: a document uploaded once must be selectable/attachable across every later application form — build the attach-existing-document flow now, not as an afterthought in Phase 5.

**API:** `POST /api/documents`, `GET /api/documents?type=&search=`, `GET /api/documents/issued`.

**Definition of Done:** Upload, search/filter, view/delete/download all work; a document uploaded here can be referenced by ID from another module (verify with a stub call).

---

## Phase 4 — Investor Wizard (PRD 5.3)

**Build:**
- Multi-section questionnaire: Land & Utilities, Environment-Related Clearance, Other Approvals (waste type, tree felling, liquor sale/manufacture, drugs, weights & measures, packaging, etc.).
- Output: flat list of required approvals from a rules-driven derivation (store rules as structured data per Section 10 "Extensibility" — not hardcoded if/else).
- Actions: "Submit" and "Submit and Generate CAF" (the CAF target itself is built in Phase 6, so this button can create a placeholder CAF draft now and be finished when Phase 6 lands).
- Applied Wizard List: history with "View Services" and "Import" (re-run with prior answers pre-filled).

**API:** `POST /api/wizard/run`, `GET /api/wizard/runs`, `POST /api/wizard/runs/:id/generate-caf`.

**Definition of Done:** A full wizard run produces a stored, rules-derived approval list; history and re-import both work.

---

## Phase 5 — Service Catalogue, Applications & Tracking (PRD 5.5.1, 5.5.2)

**Build:**
- Service Catalogue as structured data (Section 10 extensibility): department-wise list covering all in-scope departments (Labour, MPCB, Directorate of Industries, Legal Metrology, PWD-Electrical, GST, Industrial Safety & Health, Energy, Boilers, Food & Drug Administration).
- Services Available: department-wise accordion/list, per-service "Apply" opening a dynamic service-specific form, document upload step (reusing Phase 3's repository), self-declaration checkbox, "Submit and Pay" (payment can call the Phase 0 mock payment adapter for now — real gateway lands in Phase 21).
- Services Applied: list (Applicant ID, Factory Name, Service Name, Status, Pending Amount, Challan/Postal reference, Actions), Track modal (Tracking ID, Date of Application, Estimated Time/Date, Status, Remarks, 4-state status bar: Pending/Completed/Rejected/Pending with Applicant), per-row actions (Pay Now, Upload, Edit, Refetch, Preview, Download).

**API:** `GET /api/services?department=`, `POST /api/services/:id/apply`, `GET /api/applications`, `GET /api/applications/:id/track`, `POST /api/applications/:id/pay`, `POST /api/applications/:id/documents`.

**Definition of Done:** An investor can browse the full department catalogue, apply to a service with documents attached from the repository, pay via the mock adapter, and track status changes through the 4-state bar.

---

## Phase 6 — CAF & Payment History (PRD 5.5.3, 5.5.4)

**Build:**
- CAF: select 2+ CAF-eligible services via checkboxes, "Create CAF" generates the shared-fields form (division, district, office, contractor/establishment names in English & Marathi, address, state/district/taluka/village, PIN, manager details), CAF List (CAF ID, CAF Name, "View Services"). Wire this up to the Phase 4 "Submit and Generate CAF" button.
- Payment History: filters + Order ID search, list (Status, Order ID, Service Name, Transaction Date, Transaction Amount, receipt download).

**API:** `POST /api/caf`, `GET /api/caf/:id/services`.

**Definition of Done:** A CAF can be generated from either the Services list or the Wizard, shows correctly grouped services, and payment history is fully filterable with working receipt download.

---

## Phase 7 — Support: Query, Grievance, Feedback, Public Consultation, Incentive Calculator, Check Status (PRD 5.6)

**Build:**
- Query Module: Add Query (entity name, Query Type, free text, optional Department/Service), Query List, View Query/View Replies/Close.
- Grievance Module: Add Grievance (Address, Department, Category, Description, mandatory evidence attachment), Grievance List (status: Unknown/Raised/User Triggered Closure), View/View Replies/Close.
- Feedback: sentiment donut widget (Negative/Neutral/Positive), submission flow, aggregate feeds the Phase 9 Dashboard.
- Public Consultation: sidebar module to view/participate in open policy consultations.
- Incentive Calculator: sector/location/investment-size inputs → estimated eligible schemes (baseline estimate only — readiness scoring is Phase 15).
- Check Status: standalone quick lookup usable outside a full session.

**API:** `POST/GET /api/queries`, `POST /api/queries/:id/close`, `POST/GET /api/grievances`, `POST /api/grievances/:id/close`, `POST /api/feedback`.

**Definition of Done:** All six sub-modules function end to end and are independently testable; feedback sentiment data is queryable for the Dashboard phase.

---

## Phase 8 — Account & Delegation Settings (PRD 5.7)

**Build:**
- Standard account menu: Profile, Change Password, Logout.
- Transactional Users: Add (OTP-verified email/mobile, First/Middle/Last Name, Aadhaar/Virtual ID, Designation, User Status, one-or-more Responsibility blocks mapping Service → Factory Unit, password), Transactional Users List (Name, Aadhaar No., Designation).
- RBAC enforcement: a Transactional User's access must be scoped to exactly their assigned Service+Factory Unit responsibility pairs across every module built in Phases 2–7.

**Definition of Done:** A business owner can delegate a scoped subset of services/units to a named staff account, and that account's access is provably restricted to those pairs.

---

## Phase 9 — Dashboard (Landing Analytics) (PRD 5.8)

**Build:**
- Date range filter (From/To, Apply/Reset).
- Tabs: Application Count, Application Summary, Application Wise Details, Department Details.
- Stat tiles: Total Services, Applications (%Δ vs last month), Grievances (%Δ), Queries (%Δ).
- Services Performance Trend line chart (Applications/Disposed/Services, monthly).
- Grievances Status donut, Queries Status donut, Feedback Overview donut + Quick Statistics (Customer Satisfaction %, Resolution Rate %, Total Users).

**Definition of Done:** Dashboard aggregates real data from Phases 1–8 (not seed/mock data) across all tiles and charts.

---

### — Part A complete at this point: every base module from PRD Section 5 is fully built and functional. Part B (AI layer) begins here. —

---

## Phase 10 — AI Approval Roadmap (PRD 6.1, flagship feature)

**Build:**
- Dependency Graph engine: models prerequisites between approvals (e.g. land → building → environment → fire → factory license) as structured, extensible data (`ApprovalDependency` entity: `service_id`, `depends_on_service_id[]`, `can_run_parallel_with[]`).
- Sequencing logic on top of the Phase 4 Wizard output: replace the flat approval list with a sequenced roadmap showing dependency order, parallelizable approvals, and an estimated timeline per approval and overall.
- Next-Best-Action calculation: surfaces the single most impactful next step at any point (this output is also consumed by Phase 15's Dashboard banner).
- Wire the full worked pipeline from the PRD's example: Wizard answers → derived approvals → sequenced roadmap → document checklist per approval cross-checked against Phase 3's repository → pre-filled applications from Business Profile + Factory Unit data → risk scoring (from Phase 12) once submitted → next action surfaced → handoff into Compliance Calendar (Phase 13) on approval.
- Explainability requirement (Section 10): every sequencing decision must expose its underlying rule/reason, not just an ordering.

**API:** `GET /api/roadmap/:wizard_run_id`.

**Definition of Done:** Given a wizard run, the roadmap screen shows correct dependency-ordered approvals with parallel tracks, timelines, an explained next action, and pre-filled downstream application forms.

---

## Phase 11 — Document Pre-Validation & OCR Auto-Validator (PRD 6.2, 6.9 — merged, same underlying check engine)

**Build:**
- A shared validation engine checking: entity name match, address match, correct document type, expiry, signature/page presence, name match against Business Profile.
- Pre-Validation (6.2): a "Run Check" step before "Submit and Pay" on any service application (Phase 5), flagging issues before department review.
- Auto-Validator (6.9): runs automatically on every Document Repository upload (Phase 3), independent of which application it's later used in, surfacing pass/fail immediately.
- Real OCR integration (Tesseract or a cloud OCR API per Section 12) — the PRD's "mock a mismatched document for demo reliability" instruction is a demo-only concession and does not apply to full build; implement live OCR here.

**API:** `POST /api/documents/:id/validate`.

**Definition of Done:** Uploading a document triggers an automatic real OCR-based pass/fail with reasons; running the pre-submission check on an application correctly flags injected mismatches (name, address, doc type, expiry, missing signature).

---

## Phase 12 — SLA Risk & Delay Prediction (PRD 6.3)

**Build:**
- Risk engine computing a risk label (Low/Watch/High/Breached) from: time remaining vs. SLA, unresolved-query age, dependency blockage state, document completeness (using Phase 11's validation results).
- Transparent weighted rule-based scoring (Section 12/10 — not an opaque ML model), each label paired with visible reasons.
- Surface risk % + blocking factor + recommended action inside the Phase 5 Track modal.
- This is predictive (ahead of an SLA breach), not a reactive status echo — verify the engine flags risk before the SLA date, not after.

**API:** `GET /api/applications/:id/risk`.

**Definition of Done:** Every tracked application shows a risk label with explained reasons and a recommended action, computed ahead of any actual SLA breach.

---

## Phase 13 — Post-Approval Compliance Calendar (PRD 6.4)

**Build:**
- On an application reaching "Completed" status (Phase 5), auto-generate `ComplianceTask` rows: renewal, monitoring, reporting, inspection-prep, expiry — each with a due date.
- 90/60/30-day reminder scheduling with ownership and evidence links (uses Phase 0's notification adapter, real provider wired in Phase 21).
- Calendar view surfacing upcoming tasks across all approved applications for a business.

**API:** `GET /api/compliance-calendar`.

**Definition of Done:** Approving an application automatically seeds correct compliance tasks with reminders firing at the right offsets.

---

## Phase 14 — Regulatory Change Impact Engine (PRD 6.5)

**Build:**
- New "Regulatory Watch" sidebar tab.
- `RegulatoryNotification` entity: versioned government notifications mapped to affected sectors, services, and deadlines.
- Impact matcher: for a new/updated notification, determine which businesses/applications are affected based on their sector, factory units, and active/completed approvals.
- Push matched alerts into the Phase 15 Next-Best-Action banner.

**API:** `GET /api/regulatory-watch`.

**Definition of Done:** Publishing a versioned regulatory notification correctly identifies and alerts only the affected subset of businesses.

---

## Phase 15 — Incentive Readiness & Scenario Planner (PRD 6.6)

**Build:**
- On top of Phase 7's Incentive Calculator: convert the raw estimate into a readiness score against actual scheme conditions, a missing-evidence list, and a next-action plan.
- Scenario comparison across different locations/investment bands.
- Strict "potentially eligible" language throughout — never state final eligibility; this is a hard UX/copy constraint, not a suggestion.

**API:** `GET /api/incentives/readiness`.

**Definition of Done:** Readiness scoring and scenario comparison work against real scheme rule data, and no UI surface ever states final eligibility.

---

## Phase 16 — Dashboard Next-Best-Action Banner (PRD 6.7)

**Build:**
- Persistent banner above the Phase 9 Dashboard's stat tiles.
- Sources: Phase 10's roadmap next-action, Phase 12's risk engine, Phase 14's regulatory watch — merged into a single highest-priority action per business.

**API:** `GET /api/dashboard/next-best-action`.

**Definition of Done:** The banner correctly surfaces the single highest-priority item across all three source engines and updates when any of them changes.

---

## Phase 17 — Sentiment-Linked Grievance Triage (PRD 6.8)

**Build:**
- Sentiment classification applied to Phase 7's Feedback and Grievance text.
- Auto-flag negative-sentiment and repeated/similar grievances as high priority for department attention (similarity matching across grievance descriptions).

**Definition of Done:** Negative and duplicate/similar grievances are automatically elevated in the department queue without manual tagging.

---

## Phase 18 — AI Query Assistant (PRD 6.10)

**Build:**
- Conversational interface on top of Phase 7's Query Module.
- Plain-language Q&A (e.g. "why is my Fire NOC delayed?") answered by pulling live data from Phase 5's Track modal and Phase 12's risk engine rather than requiring manual navigation.

**Definition of Done:** A natural-language status/process question returns a correct, data-grounded answer sourced from the application's actual current state.

---

## Phase 19 — Officer SLA Dashboard + Smart Workload Balancer (PRD 6.11)

**Build:**
- Officer-only view: applications at risk of missing deadlines, prioritized (using Phase 12's risk engine).
- Workload balancer: routes/suggests application assignment across officers based on current workload and expertise area.

**API:** `GET /api/officer/queue`, `GET /api/officer/sla-dashboard`.

**Definition of Done:** Officers see a correctly prioritized at-risk queue, and new applications are routed with a workload/expertise-aware suggestion.

---

## Phase 20 — Duplicate / Fraud Detection (PRD 6.12)

**Build:**
- Officer-facing flagging of applications with matching/near-matching business details (same PAN/address pattern across seemingly unrelated applicants) for manual review.

**API:** `GET /api/officer/duplicates`.

**Definition of Done:** Injected duplicate/near-duplicate test applicants are correctly flagged for review with the matching signal explained.

---

## Phase 21 — District/Sector Bottleneck Heatmap (PRD 6.13)

**Build:**
- Government/Policy-facing visualization of where approval delays concentrate geographically and sectorally, aggregated from Phase 12's risk engine across all applications.
- Regulatory impact view pairing this with Phase 14's data.

**API:** `GET /api/policy/bottleneck-heatmap`, `GET /api/policy/regulatory-impact`.

**Definition of Done:** Heatmap correctly aggregates live risk/delay data by district and sector, not seeded/static data.

---

## Phase 22 — Real Integrations, Hardening & Launch Readiness

**Goal:** Replace every Phase 0 mock adapter with the real thing and close out the non-functional requirements (Section 10) that span the whole system.

**Build:**
- Real payment gateway integration (replacing Phase 5/6's mock payment adapter).
- Real SMS/email provider fully wired for OTP (Phase 1) and reminders (Phase 13).
- Security pass: confirm OTP verification, encrypted storage of Aadhaar/PAN and documents, and RBAC are correctly enforced across every role on every endpoint built in Phases 1–21.
- Auditability pass: confirm every state change, document upload, and grievance action across all phases is logged with actor and timestamp (per Phase 0's shared audit hook).
- Explainability pass: confirm every AI-driven label (risk level, roadmap sequencing, incentive readiness) exposes its underlying reason everywhere it's surfaced.
- Extensibility pass: confirm service catalogue, department list, and dependency rules are all structured data, not hardcoded, so scope can extend beyond Maharashtra/the current sector list without a rebuild.
- Load/perf pass and production deployment via Docker.

**Definition of Done:** No mock adapters remain in any user-facing flow; security, audit, explainability, and extensibility requirements from PRD Section 10 are verifiably met across the entire system; system is deployed.

---

## Notes for the build agents

- Do not treat any phase's endpoint list as exhaustive — it is the minimum illustrative set from PRD Section 9; add whatever supporting endpoints a phase's UI needs.
- The full entity list is in PRD Section 8 — treat it as the target schema from Phase 0 onward (create tables as needed per phase rather than all at once, but don't diverge from the modeled relationships).
- Every AI-layer phase (10–21) explicitly builds on a specific Part A phase finished earlier — do not start an AI-layer phase before its stated dependency phase(s) are done.
- Ignore PRD Section 11 (MVP/Stretch/Not-built tiers) and PRD Section 13's "scope creep toward all 13 AI features" risk entry — both are hackathon-time-box artifacts that don't apply to this full build.
