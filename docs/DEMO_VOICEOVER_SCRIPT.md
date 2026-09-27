# PRAVAH — Final SIH Demo Voiceover Script

**Audience:** Teammate writing narration and syncing to screen recordings  
**Project:** PRAVAH (MAITRI 2.0 / UdyogSetu Single Window Clearance)  
**SIH 2026 Problem ID:** SIH26130 — *Efficiency in streamlining industrial approvals, compliance processes, and access to government support services*  
**Companion file:** `DEMO_SCREEN_RECORDING_RUNBOOK.md` (what appears on screen for each part)

**How to use this document:** Each section matches a recording part (`PRAVAH_PartXX_...mp4`). Read the narration while the matching footage plays. Pause where **[PAUSE]** appears. Adjust pace to ~130–150 words per minute for judges. Technical terms may be expanded on first use.

**Demo personas (for your reference only — do not read emails aloud unless showing login):** Investor `investor@demo.com`, Officer `officer@demo.com`, Policy Admin `policy@demo.com`, password `PravahTest!2026`.

**Officer module note:** Narration for Parts 13, 14, and 15 assumes Shreya’s officer pages for Document Review, Duplicate Alerts, and Officer Grievances are on screen. If footage differs slightly, keep the script’s intent: officers validate OCR output, investigate fraud, and close grievance loops.

---

## Part 1 — Opening story and public portal

**Video file:** `PRAVAH_Part01_Intro_Public.mp4`  
**On screen:** Home, About, Services, Contact, Login page.

**Narration:**

Welcome to **PRAVAH** — the **MAITRI 2.0 single-window clearance portal** built for **Smart India Hackathon 2026**. Industrial investors in Maharashtra today chase dozens of departments, duplicate documents, and opaque file movement. PRAVAH answers Problem Statement **SIH26130** by giving citizens one trusted front door: discover every clearance, apply once, track desk-by-desk, and access incentives and redressal in the same place.

**[PAUSE]** On the home page you see a government-grade experience: the tricolour strip, department branding, and a search-first hero. An investor can jump straight to high-demand services like factory plan approval, consent to establish, or fire NOC without creating noise in back-office systems.

**[PAUSE]** Scrolling down, live statistics and feature cards spell out the promise: **single-window approvals**, **desk-level tracking**, an **incentive calculator**, **grievance redressal**, a **24×7 AI assistant**, and **investor handholding**. This is not a brochure site — it is the front door to a full-stack platform backed by FastAPI, PostgreSQL, and role-based access control.

**[PAUSE]** On **About**, we explain alignment with state industrial policy and ease of doing business. On **Services**, the public catalogue shows what can be applied for before login — fees, departments, and service codes investors will later select inside their workspace. **Contact** closes the loop for human support.

**[PAUSE]** We end at **PRAVAH Secure Login**, where the same portal splits into three governed experiences: **Investor**, **Department Officer**, and **Policy Admin**. One codebase, three accountabilities — that is the architecture judges should remember.

---

## Part 2 — Accessibility and bilingual UX

**Video file:** `PRAVAH_Part02_Accessibility_i18n.mp4`  
**On screen:** Accessibility bar, language toggle, home or header.

**Narration:**

Government digital services must work for every citizen. PRAVAH ships an **accessibility toolbar** in the header strip: users can **increase font size**, enable **high-contrast viewing**, and **underline links** for clearer navigation. These controls apply globally so an investor with low vision or an officer on a bright factory-floor monitor gets the same usable interface.

**[PAUSE]** Maharashtra serves Marathi and English speakers daily. PRAVAH uses a **translation layer** across navigation and key content — switch language and watch labels update without reloading the entire application. That is how we meet real-world deployment expectations, not hackathon demo-only English.

**[PAUSE]** Inclusion and localization are first-class requirements, alongside security and auditability.

---

## Part 3 — Secure login and role-based access

**Video file:** `PRAVAH_Part03_RBAC_Login.mp4`  
**On screen:** Login tabs, three dashboards, sign out.

**Narration:**

Authentication is **JWT-based** against our FastAPI backend, with **database-backed RBAC**. On login, the investor selects the Investor role and lands on the **investor command center** — menus for applications, business data, compliance tools, and helpdesk. No officer tools leak into this view.

**[PAUSE]** Signing out and returning, we choose **Department Officer**. The officer lands on an **operations dashboard** tuned for queues, SLAs, and integrity checks — not investor marketing content.

**[PAUSE]** Third, **Policy Admin** — the configuration and analytics brain: service catalogue, approval workflows, and statewide bottleneck views.

**[PAUSE]** Protected routes enforce these boundaries server-side. If an unauthorized session hits an investor URL, the portal blocks access. That separation is what makes single-window clearance safe at scale.

---

## Part 4 — Investor dashboard

**Video file:** `PRAVAH_Part04_Investor_Dashboard.mp4`  
**On screen:** `/app/dashboard`

**Narration:**

After login, the investor sees a **personalized dashboard** — not a static mock. Stat tiles summarize **total applications**, **approved**, **in progress**, and **pending** counts drawn from live application APIs. A **distribution chart** gives instant portfolio health.

**[PAUSE]** The centerpiece is **active file tracking**: a visual timeline from **application submitted** through **document verification**, **department scrutiny**, and **final approval**, with progress aligned to the latest backend tracking payload. An investor answers the question every promoter asks daily: *Where is my file, and which desk is holding it?*

**[PAUSE]** Quick links deep-link into the clearance wizard, service catalogue, or document vault — the dashboard is the hub for **next actions**, which our roadmap connects to SLA risk and compliance engines on the backend.

---

## Part 5 — Business profile and factory units

**Video file:** `PRAVAH_Part05_Business_Factory.mp4`  
**On screen:** `/app/business`, `/app/factory`

**Narration:**

Industrial clearance starts with **truthful master data**. In **My Business Profile**, the investor maintains legal identity: business name, registrations, tax identifiers, address, sector, and investment profile. This profile is the anchor for every application and for **CAF auto-fill** later.

**[PAUSE]** Manufacturing is physical — so PRAVAH models **factory units and MIDC plots** separately. On **Factory Units**, the investor registers each establishment: estate location, sanctioned **power load**, **water demand**, and pollution categorization. Wizard logic and environmental clearances consume these fields.

**[PAUSE]** Phase one and two of our implementation plan are visible here: onboarding identity, then **land and unit setup** — the foundation Bhagyesh’s application module and Zaki’s document validation both depend on.

---

## Part 6 — Clearance wizard and approval roadmap

**Video file:** `PRAVAH_Part06_Wizard_Roadmap.mp4`  
**On screen:** `/app/wizard` three steps

**Narration:**

This is PRAVAH’s **regulatory intelligence entry point**. The **Investor Clearance Advisor** is a guided wizard: step one captures **sector**, **capital investment band**, **district**, and **land status**. Step two captures **utilities** — power in kVA, water in kilolitres per day — and whether **hazardous chemicals** are in scope.

**[PAUSE]** Step three is the payoff: a **custom statutory roadmap** — service codes like MIDC land allotment, MPCB consent to establish, fire NOC, DISH factory plan, industrial water connection, and when thresholds are crossed, **high-tension power** or **boiler registration**. The list is not hard-coded trivia; it mirrors our **rules and applicability engine** design: wizard output feeds applicability, dependency ordering, and the approval roadmap API in the backend plan.

**[PAUSE]** Estimated **fees** and **RTS Act timeframes** set expectations before the investor commits. From here, one click carries the recommended services into the apply journey — shrinking weeks of consultant calls into minutes.

---

## Part 7 — Service catalogue and apply flow (CAF, documents, payment)

**Video file:** `PRAVAH_Part07_Apply_CAF_Payment.mp4`  
**On screen:** `/app/services`, `/app/apply` four steps

**Narration:**

The investor opens the **service catalogue** — the same services policy administrators configure on the other side of the platform. Selecting a clearance — for example **Factory Licence** — starts a **four-stage apply flow**: initiation, form data, documents, and payment.

**[PAUSE]** Stage two showcases **CAF intelligence**: one click **auto-fills** the Common Application Form from verified business profile data — PAN, GSTIN, CIN, addresses, investment, employment — without overwriting fields the user already corrected. That is Niraja’s **CAF autofill** vision realized in the UI, reading trusted profile and document extracts.

**[PAUSE]** Stage three is **document pre-validation**. Uploads hit our FastAPI pipeline: **EasyOCR**, **PyMuPDF**, and validator rules for **name matching**, **expiry**, and **signature presence**. The investor sees **VALID**, **WARNING**, or **INVALID** before payment — reducing rejections at the officer desk.

**[PAUSE]** If the UI presents a **generated CAF preview**, that is the single canonical form routed to all departments. Stage four is **fee payment** and submission — moving the application into **SUBMITTED** state and onto the officer queue. One application, one document set, many departments — true single-window behavior.

---

## Part 8 — Document repository, OCR, and DigiLocker

**Video file:** `PRAVAH_Part08_Document_Vault.mp4`  
**On screen:** `/app/documents`

**Narration:**

Not every document belongs to one form. PRAVAH’s **Document Drive** is a **central vault**: upload once, reuse across applications, with **versioning and validation status** stored in PostgreSQL.

**[PAUSE]** After upload, the row shows **AI verification** — confidence scores, field extractions, matches and mismatches against profile data, and human-readable reasons when flagged. Officers later see the same truth; investors are not surprised at scrutiny stage.

**[PAUSE]** The **DigiLocker sync** path demonstrates integration readiness — pulling government-issued credentials into the vault with consent, aligning with India Stack direction in our integration plan. Encryption and custody messaging on this page reflects how we treat industrial proofs as sensitive assets.

**[PAUSE]** This module is the document spine for OCR, RAG indexing, and application linkage described in the backend and Form-and-Vault implementation plans.

---

## Part 9 — Application tracking and payments

**Video file:** `PRAVAH_Part09_Tracking_Payments.mp4`  
**On screen:** `/app/applications`, `/app/payments`

**Narration:**

In **My Applications**, every submission appears with a **status badge**: draft, submitted, pending processing, clarification needed, approved, or rejected. The investor selects **Track** to open the **desk-level timeline** — which stage is active, which completed, and where bottlenecks appear.

**[PAUSE]** This is the citizen-facing half of the same lifecycle officers process on their queue. Transparency builds trust: the promoter sees the same stage names the department uses internally.

**[PAUSE]** **Payments History** lists statutory fees paid through the portal, supporting audit and refund workflows. Together, tracking and payments close the investor loop from intent to compliance.

---

## Part 10 — Incentives, helpdesk, and transparency

**Video file:** `PRAVAH_Part10_Incentives_Helpdesk.mp4`  
**On screen:** calc, grievance, queries, consultations, feedback, audit

**Narration:**

PRAVAH is also an **investment promotion** surface. The **Incentive Calculator** encodes **Maharashtra policy scenarios** — investment scale, taluka category, employment, project type, and promoter category — to estimate **SGST reimbursement**, **capital subsidy**, and scheme eligibility in real time. Change inputs and watch benefits update; that is decision support before land and capital commit.

**[PAUSE]** When something goes wrong, **Grievance Redressal** captures department, optional application reference, and narrative detail. Tickets enter the operational layer Shreya’s module designed — with sentiment and similarity hooks for AI triage on the backend roadmap.

**[PAUSE]** **Department Queries** handle clarification threads without formal grievances. **Public Consultations** expose draft policies to stakeholders. **Feedback** feeds continuous improvement.

**[PAUSE]** Finally, **Audit Logs** show tamper-evident activity — who changed what and when — supporting accountability for SYSTEM_ADMIN and compliance reviewers. Citizens see transparency; administrators see forensic detail.

---

## Part 11 — AI Query Assistant (Copilot)

**Video file:** `PRAVAH_Part11_AI_Copilot.mp4`  
**On screen:** ChatBot widget

**Narration:**

The floating **PRAVAH AI Copilot** is grounded assistance, not a generic chatbot. When the investor opens it, the assistant can bind to **their applications** via authenticated APIs — so questions about **document verification**, **risk scores**, or **stage status** use private context.

**[PAUSE]** Ask what documents a factory licence requires, and the answer should cite **policy and knowledge-base sources** — our RAG pipeline over pgvector embeddings and government corpora, orchestrated through a centralized LLM service with retries and timeouts.

**[PAUSE]** Ask about a specific filing, and the copilot reasons over **application state** and **uploaded proofs**, exactly as Kajal’s integration plan specifies: infrastructure first, then retrieval, then grounded generation. Logged-out users are told to authenticate before private queries — privacy by design.

---

## Part 12 — Officer: SLA dashboard and priority queue

**Video file:** `PRAVAH_Part12_Officer_Queue.mp4`  
**On screen:** `/officer/dashboard`, `/officer/queue`

**Narration:**

Switching to the **Department Officer**, operations change from self-service to **trust-but-verify**. The **Smart Workload Balancer** dashboard explains itself: an **AI priority engine** sorts the queue by **SLA breach risk**, project value, and fraud signals — so the oldest file is not always the most urgent file.

**[PAUSE]** The workload table shows **AI priority scores** as visual bars, **SLA status** badges distinguishing **on track** from **breach risk**, and a **Process** action into the live queue.

**[PAUSE]** On the **Application Queue**, each row exposes **triage category**: **Fast Track**, **Document Review**, or **High Risk Review** — derived from Niraja’s **SLA and risk engine** inputs: document completeness, blocked dependencies, officer workload, and clarification loops. Opening an application, the officer can **recalculate risk** after new evidence, then approve, reject, or **request clarification** with remarks. That action flows back to the investor tracking view in real time.

---

## Part 13 — Officer: Document review

**Video file:** `PRAVAH_Part13_Officer_DocReview.mp4`  
**On screen:** `/officer/documents`

**Narration:**

**Document Review** is where machine validation meets human judgment. The officer sees applications waiting on proof quality — each document with **investor upload**, **OCR extractions**, and automated **validator verdicts**.

**[PAUSE]** The officer confirms matches on identity fields, checks expiry and seals, and either **accepts** the proof or **flags** discrepancies with a remark that triggers investor clarification. This closes the loop opened in the investor apply flow and document vault — one validation pipeline, two roles, zero duplicate uploads.

**[PAUSE]** That design is exactly what our sequential development plan called Stage Four: documents meet the roadmap, and completeness feeds SLA risk.

---

## Part 14 — Officer: Fraud radar and duplicate detection

**Video file:** `PRAVAH_Part14_Fraud_Duplicates.mp4`  
**On screen:** `/officer/fraud`, `/officer/duplicates`

**Narration:**

Industrial clearance fraud hurts revenue and honest promoters. **Fraud Radar** is PRAVAH’s **cross-department integrity scanner** — the UdyogSetu-style capability for duplicate filings, conflicting **cadastral** claims, and tampered professional seals.

**[PAUSE]** Running a **deep cadastral audit scan** cross-checks application metadata against GIS and revenue patterns. Alerts filter by **severity** — high-confidence duplicate PAN usage across shell entities, geotag mismatches on property deeds, and similar patterns.

**[PAUSE]** **Duplicate Alerts** narrows to **near-duplicate applications** — same identifiers, overlapping survey numbers, or repeated beneficial owners. Officers investigate before approval, protecting treasury and genuine investors.

**[PAUSE]** This is Phase 20 in our README tracking — fraud detection as a first-class officer security menu, not an afterthought spreadsheet.

---

## Part 15 — Officer: Grievance handling

**Video file:** `PRAVAH_Part15_Officer_Grievances.mp4`  
**On screen:** `/officer/grievances`

**Narration:**

Grievances raised by investors appear on the **officer helpdesk**. The officer opens a ticket, sees department routing and linked application context, and moves status from open to **in progress** to **resolved** with a documented response.

**[PAUSE]** That completes the redressal promise from the public home page: unresolved cases escalate up the chain instead of dying in email inboxes. Sentiment-linked triage on the backend roadmap will prioritize severe dissatisfaction — the UI you see is the operational face of that engine.

---

## Part 16 — Policy Admin: services and workflows

**Video file:** `PRAVAH_Part16_Policy_Services.mp4`  
**On screen:** `/policy/dashboard`, `/policy/services`, `/policy/workflows`

**Narration:**

**Policy Admin** is the bridge from **state legislation** to **citizen-facing services**. The command center KPIs — active services, pending approvals, high-risk flags, compliance percentage — frame statewide performance.

**[PAUSE]** In **Manage Services**, administrators CRUD the catalogue investors browse: service name, owning **department**, **base fee**, active flag. What you configure here appears in the investor apply dropdown — no developer deploy needed for a new clearance entry.

**[PAUSE]** **Configure Workflows** defines **approval stages** per service — document verification, departmental scrutiny, final approval — the same stages investors track and officers enforce. Policy sets the rules; the platform executes them uniformly across districts.

**[PAUSE]** This is the master configuration role in our policy admin plan — the control plane for MAITRI single-window evolution.

---

## Part 17 — Policy Admin: analytics and regulatory impact

**Video file:** `PRAVAH_Part17_Policy_Analytics.mp4`  
**On screen:** bottlenecks, districts, sectors, departments, regulatory

**Narration:**

Operations without analytics repeat mistakes. **Bottleneck Analytics** highlights where files stall — by stage, department, or time window — feeding heatmap and bottleneck detection engines in the backend plan.

**[PAUSE]** **District Analysis** and **Sector Analysis** show geographic and industry concentration of delay or volume, supporting targeted RTS reforms. **Department Analysis** compares processing performance across secretaries and field offices.

**[PAUSE]** **Regulatory Impact** overlays **policy change timelines** against investment and processing metrics — answering whether a notification actually improved ease of doing business.

**[PAUSE]** These views consume the same application and risk events officers generate — policy admin closes the feedback loop from desk to dashboard to statute.

---

## Part 18 — Backend and API credibility (optional segment)

**Video file:** `PRAVAH_Part18_Backend_API.mp4`  
**On screen:** Terminal, Swagger `/docs`, health check

**Narration:**

PRAVAH is a **modular monolith** — React front end, **FastAPI** API layer, **SQLAlchemy** repositories, **PostgreSQL with pgvector** for relational and vector data, **Alembic** migrations, and reproducible **seed scripts** for demo accounts.

**[PAUSE]** Swagger documents stable contracts: authentication, business profiles, applications, documents with OCR, officer queues, grievances, incentives, chat, and health. A passing **health check** proves the stack running under Dockerized Postgres is the source of truth — not browser-local mock JSON.

**[PAUSE]** That architecture matches our team backend and AI integration plan: one request path from UI to engines to database, with audit logs on sensitive mutations.

---

## Part 19 — Closing

**Video file:** `PRAVAH_Part19_Closing.mp4`  
**On screen:** Montage, home logo

**Narration:**

PRAVAH delivers the full journey **SIH26130** asks for: investors **discover**, **plan**, **apply**, and **track** with AI-assisted forms and validated documents; officers **prioritize**, **review**, and **protect integrity**; policy makers **configure** services and **see bottlenecks** before they become headlines.

**[PAUSE]** Built by a six-member team along a sequential plan — foundation, applications, documents, rules and roadmap, AI and RAG, operations and integrations — this is **MAITRI 2.0** ready for pilot, scale, and continuous regulatory change.

**[PAUSE]** Thank you. **PRAVAH — enabling businesses, strengthening Maharashtra.**

---

## Appendix A — Suggested full-video structure (editor)

If you assemble one master video (~18–22 minutes after editing), use this order for story clarity:

1. Part 1 — Public problem and promise  
2. Part 2 — Accessibility and language  
3. Part 3 — Three roles login  
4. Part 16 — Policy defines services (brief)  
5. Parts 4–11 — Investor end-to-end journey  
6. Parts 12–15 — Officer operations and security  
7. Part 17 — Policy analytics payoff  
8. Part 18 — Backend (30–45 seconds if time tight)  
9. Part 19 — Close  

Parts 16 and 17 can swap if you prefer “investor first, policy explains why catalogue looked that way” — both orders work.

---

## Appendix B — Team module mapping (for judge Q&A)

Use this if judges ask *who built what* during presentation prep — not for voiceover unless asked.

| Module | Primary ownership (team plan) |
|--------|------------------------------|
| Auth, RBAC, audit, infra | Vinayak |
| Business, factory, services, applications, wizard, CAF | Bhagyesh |
| Documents, storage, OCR, validation, DigiLocker UI | Zaki |
| LLM, embeddings, pgvector, RAG, query assistant | Kajal |
| Rules, roadmap, SLA risk, incentives engines, compliance | Niraja |
| Grievances, officer desk, policy analytics, integrations | Shreya |

---

## Appendix C — Phrases to avoid / prefer

**Avoid claiming** full production payment gateway, SMS blast, or every AI engine at 100% if footage shows stub or seed data — say **“pilot-ready architecture with seeded demo data”** instead.

**Prefer:** single-window, desk-level tracking, grounded AI, role-based access, OCR pre-validation, SLA-aware queue, policy-configured workflows, audit trail.

---

## Appendix D — Timing cheat sheet (approximate)

| Part | Narration length (approx.) |
|------|----------------------------|
| 1 | 2:00–2:30 |
| 2 | 0:45–1:00 |
| 3 | 1:15–1:30 |
| 4 | 1:00–1:15 |
| 5 | 1:15–1:30 |
| 6 | 1:30–1:45 |
| 7 | 2:00–2:30 |
| 8 | 1:30–1:45 |
| 9 | 1:00–1:15 |
| 10 | 1:45–2:00 |
| 11 | 1:00–1:15 |
| 12 | 1:30–1:45 |
| 13 | 1:00–1:15 |
| 14 | 1:15–1:30 |
| 15 | 0:45–1:00 |
| 16 | 1:30–1:45 |
| 17 | 1:15–1:30 |
| 18 | 0:45–1:00 |
| 19 | 0:30–0:45 |

Total spoken word target: roughly **22–26 minutes** at moderate pace; editor can cut pauses for a **15-minute judge cut** and a **full technical cut**.

---

*End of voiceover script.*
