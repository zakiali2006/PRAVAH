# PRAVAH — Final SIH Demo Screen Recording Runbook

**Audience:** Zaki (primary recorder)  
**Project:** PRAVAH / MAITRI 2.0 Single Window Clearance (SIH 2026 — Problem ID **SIH26130**)  
**Purpose:** Step-by-step instructions to capture every showcase-ready feature in logical video parts, with exact navigation, credentials, and on-screen actions. Hand the companion file `DEMO_VOICEOVER_SCRIPT.md` to your teammate for narration; each recording part below maps to a **Part** in that script.

**Important assumption for this runbook:** Department **Officer** pages for Document Review, Duplicate Alerts, and Officer-side Grievances are treated as **complete and demo-ready** (Shreya’s officer module). Record those segments from the branch or build where those routes are live. If a route still shows “Under Construction” on your machine, merge or pull Shreya’s officer work **before** recording Part 8–10; do not skip those scenes in the final hackathon video.

---

## 1. What you are proving to judges

PRAVAH is a **role-aware single-window portal** for industrial investors in Maharashtra: one place to discover clearances, run an intelligent **clearance wizard**, apply with **CAF-style forms** and **document OCR validation**, track applications desk-by-desk, calculate **state incentives**, raise **grievances**, and use an **AI copilot**. On the government side, **department officers** process a **priority queue** driven by **SLA and risk**, review documents, and run **fraud and duplicate detection**. **Policy administrators** configure the **service catalogue and workflows** and read **bottleneck and regulatory analytics**. The recording should tell one continuous story: **policy defines services → investor applies with validated documents → officer acts on risk-prioritized queue → policy sees analytics**.

---

## 2. Before you record (mandatory checklist)

### 2.1 Environment

Run the stack exactly as in `docs/SETUP.md`:

1. From repo root: `docker compose up -d postgres`
2. Backend: activate venv, `alembic upgrade head`, `python -m app.seed.seed`, then `uvicorn app.main:app --reload --port 8000`
3. Frontend: `npm ci` then `npm run dev` in `frontend/` (default **http://localhost:5173**)
4. Confirm **http://localhost:8000/api/health** returns healthy and **http://localhost:8000/docs** opens Swagger.

### 2.2 Demo accounts (use these on the Login screen)

The login page prefills when you switch role tabs. Password for all seeded roles: **`PravahTest!2026`**

| Role | Email | After login lands on |
|------|--------|----------------------|
| Investor | `investor@demo.com` | `/app/dashboard` |
| Department Officer | `officer@demo.com` | `/officer/dashboard` |
| Policy Admin | `policy@demo.com` | `/policy/dashboard` |

### 2.3 Recording settings (recommended)

Use **1920×1080**, **60 fps** if your machine handles it without lag, otherwise **30 fps**. Record **browser chrome + URL bar** for at least the login and role-switch scenes so judges see real routes. Disable desktop notifications. Close unrelated tabs. Use a **clean browser profile** or incognito with allowed local storage (JWT is in `localStorage`). Mouse movements: slow and deliberate; pause **2–3 seconds** on each stat card, chart, and table header so the editor can cut B-roll.

### 2.4 File naming convention

Export raw clips as:

`PRAVAH_Part01_Intro_Public.mp4`  
`PRAVAH_Part02_Accessibility_i18n.mp4`  
… through Part 15 (see section 4). Your teammate will align voiceover to these filenames.

### 2.5 Logout discipline between roles

After each role segment, use **Sign out** in the header (returns to public home), then go to **Login** again. Never switch roles without logging out, so RBAC and sidebar menus stay credible on camera.

---

## 3. Master route reference (quick lookup)

### 3.1 Public (no login)

| Screen | URL |
|--------|-----|
| Home | `/` |
| About | `/about` |
| Service catalogue (public) | `/services` |
| Contact | `/contact` |
| Login | `/login` |
| Register | `/register` |

### 3.2 Investor (`investor@demo.com`)

| Screen | URL |
|--------|-----|
| Dashboard | `/app/dashboard` |
| Clearance wizard | `/app/wizard` |
| Apply / services | `/app/services` and `/app/apply` |
| My applications | `/app/applications` |
| Business profile | `/app/business` |
| Factory units | `/app/factory` |
| Document drive | `/app/documents` or `/app/drive` |
| Payments history | `/app/payments` |
| Incentive calculator | `/app/calc` |
| Grievances | `/app/grievance` |
| Department queries | `/app/queries` |
| Public consultations | `/app/consultations` |
| Feedback | `/app/feedback` |
| Audit logs | `/app/audit` |
| Risk alerts (if shown) | `/app/risk` |

### 3.3 Officer (`officer@demo.com`)

| Screen | URL |
|--------|-----|
| SLA / workload dashboard | `/officer/dashboard` |
| Application queue | `/officer/queue` |
| Document review | `/officer/documents` |
| Fraud radar | `/officer/fraud` |
| Duplicate alerts | `/officer/duplicates` |
| Grievances (officer) | `/officer/grievances` |

### 3.4 Policy Admin (`policy@demo.com`)

| Screen | URL |
|--------|-----|
| Command center | `/policy/dashboard` |
| Manage services | `/policy/services` |
| Configure workflows | `/policy/workflows` |
| Bottleneck analytics | `/policy/bottlenecks` |
| District analysis | `/policy/districts` |
| Sector analysis | `/policy/sectors` |
| Department analysis | `/policy/departments` |
| Regulatory impact | `/policy/regulatory` |

---

## 4. Recording parts — exact flow

Each part lists **Goal**, **Start URL**, **Actions in order**, and **What must appear on screen**. Estimated duration is for raw footage (before editing).

---

### Part 1 — Opening story and public portal (4–6 min)

**Goal:** Establish SIH problem, branding, and citizen-facing discovery without logging in.

**Start at:** `/`

**Actions:**

1. Scroll slowly through the **hero**: MAITRI/PRAVAH headline, search bar, quick links (Factory plan approval, Consent to establish, Fire NOC). Click one quick link and land on `/services`; scroll back to home via logo.
2. Continue down the home page: **animated statistics**, **feature grid** (single-window approvals, desk-level tracking, incentive calculator, grievance redressal, AI assistant, investor handholding).
3. Show **“How it works”** (or equivalent process section) if visible on the page.
4. Navigate header: **About** (`/about`) — scroll key paragraphs.
5. **Services** (`/services`) — scroll catalogue cards; open one service detail if the UI expands or shows fee/department (do not log in yet).
6. **Contact** (`/contact`) — show form fields briefly.
7. End on **Login** (`/login`) with all three role tabs visible: Investor, Department Officer, Policy Admin.

**Must capture:** Tricolour strip, government dept strip, PRAVAH logo, professional gov-tech aesthetic.

---

### Part 2 — Accessibility and bilingual UX (2–3 min)

**Goal:** Show inclusion features required for government portals.

**Start at:** `/` (logged out)

**Actions:**

1. In the top strip, use **AccessibilityBar**: increase **font size** one step, then two; show page reflow.
2. Toggle **high contrast / invert** if available; toggle back off for normal recording afterward.
3. Toggle **underline links**; hover a nav link to show underlines.
4. Switch **language** (Marathi ↔ English) via translation control in header; show nav labels and hero text changing.
5. Reset font to default before continuing.

**Must capture:** Accessibility controls and at least one full language switch on a content-heavy section (home hero or dashboard later).

---

### Part 3 — Secure login and RBAC (3–4 min)

**Goal:** Prove role-based access, not a single shared dashboard.

**Start at:** `/login`

**Actions:**

1. Show **Investor** tab selected; email `investor@demo.com`; click **Login as Investor**; land on `/app/dashboard`. Pan sidebar/header — investor menu only (Dashboard, Applications, My Business, Compliance & Tools, Helpdesk).
2. **Sign out** → `/login`.
3. Select **Department Officer**; login; land on `/officer/dashboard`. Show officer-only navigation (Processing, Security, Helpdesk).
4. **Sign out** → `/login`.
5. Select **Policy Admin**; login; land on `/policy/dashboard`. Show policy navigation (Service Management, Analytics, Policy Review).
6. **Sign out**.

**Optional 10-second insert:** Manually visit `/app/dashboard` while logged out — should redirect to login or unauthorized (show protection briefly).

**Must capture:** Three distinct sidebars/menus and role-specific landing pages.

---

### Part 4 — Investor dashboard and “command center” (3–4 min)

**Goal:** Show investor analytics at a glance: counts, chart, active application timeline.

**Login:** Investor → `/app/dashboard`

**Actions:**

1. Hold on welcome banner (“Simpler Approvals. Stronger Businesses.”).
2. Pause on **stat tiles**: total applications, approved, in progress, pending (exact labels on screen).
3. Show **pie chart** of application status distribution.
4. Show **recent application timeline** (Submitted → Document Verification → Department Scrutiny → Final Approval) with progress indicator.
5. Click any **quick action** link on the dashboard (e.g. apply, wizard, documents) — then navigate back to dashboard via menu.

**Must capture:** Chart and timeline without excessive scrolling; this is a hero shot for judges.

---

### Part 5 — Business profile and factory / MIDC setup (4–5 min)

**Goal:** Phase 1–2 onboarding data that feeds applications and CAF autofill.

**Login:** Investor

**Actions:**

1. Go **My Business → Business Profile** (`/app/business`).
2. If profile exists, click **Edit** (Edit Profile modal): show fields (business name, PAN, GST, address, sector, investment, etc.); save once with a tiny visible change or cancel if you must not mutate seed data.
3. If empty state appears, walk through **create profile** flow instead.
4. Go **Factory Units** (`/app/factory`).
5. Show list of units/plots if seeded; click **Register New Factory Unit**; fill modal (unit name, MIDC area, power kVA, water KLD, pollution category); submit or cancel after showing form completeness.
6. Return to Business Profile and point cursor at link/navigation to factory units (continuity for viewer).

**Must capture:** Connection between “business entity” and “industrial unit at MIDC”.

---

### Part 6 — Clearance wizard and regulatory roadmap (5–6 min)

**Goal:** Flagship intelligence entry: wizard → recommended clearances.

**Login:** Investor → `/app/wizard`

**Actions:**

1. **Step 1:** Set sector (e.g. Automotive & Engineering), investment tier, district (e.g. Pune MIDC), land status.
2. **Next → Step 2:** Adjust power kVA (try value **> 1000** to trigger extra clearance), water requirement, hazardous chemicals toggle.
3. **Next → Step 3:** Show **recommended clearances list** with service codes (e.g. MIDC-LAN-01, MPCB-CTE-04, FIRE-NOC-02, DISH-PLN-01, MSED-HT-01 when power high).
4. Scroll through **estimated fees / RTS timeframe** section if shown.
5. Click **Apply** or **Proceed to services** (whatever button links to catalogue) — arrive at services or apply flow with a pre-selected service if the wizard passes state.

**Must capture:** Step indicator (1–2–3), rule-driven list changing when you change power or chemicals.

---

### Part 7 — Service catalogue and full apply flow (8–10 min)

**Goal:** End-to-end application: CAF steps, AI autofill, documents, payment.

**Login:** Investor

**Actions:**

1. **Applications → Apply for Services** or `/app/services`. Browse cards; pick **Factory Licence** or **Environmental Clearance** (whichever is fully wired in your seed).
2. Start apply → `/app/apply` (may carry `serviceName` in navigation state).
3. **Step 1 Initiation:** Confirm service name and fee.
4. **Step 2 Form Data:** Click **Auto-fill Data** / AI prefill control; wait for fields to populate from business profile; show PAN, GSTIN, address, investment fields filled.
5. **Step 3 Documents:** Use **inline document upload**; upload a PDF/image sample (keep a test PAN or licence PDF in a `demo-assets` folder). Wait for **OCR validation** result (VALID / WARNING / INVALID badges). Expand validation details (name match, expiry, signature checks) if UI shows them.
6. If **CAF modal** or “Generate CAF” appears anywhere in the flow, open it and scroll the generated Common Application Form preview.
7. **Step 4 Payment:** Show payment summary; complete or simulate payment per UI (do not use real payment credentials).
8. Submit application; note success message or redirect.

**Must capture:** Four-step stepper, autofill, and at least one validated document outcome.

---

### Part 8 — Document repository, DigiLocker, and vault (5–6 min)

**Goal:** Zaki module — centralized documents decoupled from a single application.

**Login:** Investor → `/app/documents`

**Actions:**

1. Wait for document list load from API.
2. Click **Upload**; use Upload Document modal; upload file; after success, refresh list and show new row with status (verified / ai_flagged / pending).
3. Open **document detail / view** panel: show extracted fields, confidence, match/mismatch lists.
4. Click **DigiLocker sync** (or Connect DigiLocker); wait for sync spinner to finish; show documents added or connected state.
5. Briefly show trust/security callouts on the page (encryption, consent copy) if visible.

**Must capture:** At least one **AI-flagged** or **verified** document with expandable verification reasons.

---

### Part 9 — Application tracking and payments (4–5 min)

**Login:** Investor

**Actions:**

1. **My Applications** (`/app/applications`): show table of applications with status badges (Draft, Submitted, Pending, Clarification, Approved).
2. Click **Track** on the application you submitted in Part 7 (or the most recent seeded one).
3. Walk through **tracking view**: timeline stages, department names, dates, “clarification needed” if present.
4. Go **Payments History** (`/app/payments`): scroll transactions linked to services/fees.

**Must capture:** Desk-level tracking narrative — investor sees where the file is stuck.

---

### Part 10 — Incentives, helpdesk, and transparency (6–7 min)

**Login:** Investor

**Actions:**

1. **Incentive Calculator** (`/app/calc`): change investment (₹ Cr), taluka category (A/B/C/D), employment, project type; show computed SGST reimbursement, capital subsidy, and scheme eligibility updating.
2. **Grievances** (`/app/grievance`): fill name, email, department, application ID optional, detail; submit; show success/thank-you state.
3. **Department Queries** (`/app/queries`): show query list or raise query UI (scroll full form).
4. **Public Consultations** (`/app/consultations`): show active consultations list or comment interface.
5. **Feedback** (`/app/feedback`): submit sample feedback.
6. **Audit Logs** (`/app/audit`): scroll audit entries (who did what, timestamps) — ties to backend audit module.

**Must capture:** Calculator output changing live; at least one helpdesk submission success screen.

---

### Part 11 — AI Query Assistant (Copilot) (3–4 min)

**Goal:** RAG / application-aware chat (Kajal module).

**Login:** Investor (stay logged in)

**Actions:**

1. Open floating **ChatBot** (bottom corner).
2. Show greeting and application selector dropdown if present (loads `/applications/me`).
3. Ask: “What documents are required for factory licence?” — wait for full answer and **sources** if shown.
4. Ask: “What is the status of my application?” or “Explain my document verification result.”
5. Copy a suggested field if UI offers copy buttons.
6. Close chatbot.

**Optional:** Log out, open chatbot, ask a question — show message that login is required for private data (10 seconds).

**Must capture:** Assistant reply with grounding (sources or context-aware answer).

---

### Part 12 — Officer: SLA dashboard and priority queue (5–6 min)

**Login:** Officer → `/officer/dashboard`

**Actions:**

1. Read section header **Smart Workload Balancer** / PRAVAH AI OPS.
2. Tab **Workload Queue:** show AI priority banner; table columns Application, AI Priority Score, SLA Status, Action.
3. Point at **Breach Risk** vs **On Track** badges; click **Process** on top row → navigate to queue.
4. On **`/officer/queue`:** filter/sort if available; open an application **Process / Action** modal.
5. In modal: show scrutiny fields, remarks, approve/reject/clarification actions; trigger **Recalculate risk** if button exists; watch score/triage category update (Fast Track / Doc Review / High Risk).
6. Submit one action (prefer **Request clarification** or **Move to scrutiny** to keep seed data reusable).

**Must capture:** AI priority score bar and SLA breach indicator.

---

### Part 13 — Officer: Document review (3–4 min)

**Assumption:** Shreya’s **Document Review** page is complete at `/officer/documents`.

**Login:** Officer

**Actions:**

1. Open **Processing → Document Review**.
2. Show queue of applications/documents pending officer validation.
3. Open one document: side-by-side or panel with **investor upload**, **OCR extracted fields**, and **validator verdict**.
4. Approve document or flag discrepancy; add officer remark; save.
5. Return to list showing updated status.

**Must capture:** Officer closing the loop on Zaki’s OCR pipeline.

---

### Part 14 — Officer: Fraud radar and duplicate detection (4–5 min)

**Login:** Officer

**Actions:**

1. **Security → Fraud Radar** (`/officer/fraud`).
2. Show page title **Cadastral & Application Integrity Scanner**.
3. Click **Run Deep Cadastral Audit Scan**; wait for scan animation to finish.
4. Filter severity tabs: ALL, HIGH, MEDIUM, LOW; scroll alert cards (duplicate PAN, geotag mismatch, etc.).
5. Resolve or acknowledge one alert if UI supports it.
6. **Security → Duplicate Alerts** (`/officer/duplicates`): show cross-application duplicate matches (same PAN, deed, or entity); open one match detail.

**Must capture:** Fraud radar scan animation and at least two distinct alert types.

---

### Part 15 — Officer: Grievance handling (2–3 min)

**Assumption:** Officer grievance desk at `/officer/grievances` is complete.

**Login:** Officer

**Actions:**

1. Open **Helpdesk → Grievances**.
2. Show list containing the grievance submitted in Part 10 (or seeded items).
3. Open ticket: show department, sentiment/priority if shown, investor detail.
4. Change status (e.g. In Progress → Resolved) and add officer response.
5. Save and show updated queue.

---

### Part 16 — Policy Admin: configuration loop (6–7 min)

**Login:** Policy Admin → `/policy/dashboard`

**Actions:**

1. Hold on KPI cards: Active Services, Pending Approvals, High Risk Flags, Policy Compliance.
2. **Service Management → Manage Services** (`/policy/services`): scroll service table; click **Add New Service**; fill name, department, base fee, active flag; save (or open edit on existing row).
3. **Configure Workflows** (`/policy/workflows`): select a service; show ordered stages (Document Verification → Department Scrutiny → Final Approval); add/remove/reorder one stage if UI allows.
4. Return to dashboard; note chart **Applications by sector** or processing time chart.

**Must capture:** Policy admin as “source of truth” for what investors see in Apply flow.

---

### Part 17 — Policy Admin: analytics and regulatory impact (5–6 min)

**Login:** Policy Admin

**Actions:**

1. **Analytics → Bottleneck Analytics** (`/policy/bottlenecks`): show bottleneck chart; change date filter if present.
2. **District Analysis** (`/policy/districts`): map or bar chart by district.
3. **Sector Analysis** (`/policy/sectors`): sector delay or volume chart.
4. **Department Analysis** (`/policy/departments`): department comparison table/chart.
5. **Policy Review → Regulatory Impact** (`/policy/regulatory`): timeline of policy changes vs metrics.

**Must capture:** At least two analytics pages with filters interacting.

---

### Part 18 — Backend credibility (optional but strong for SIH) (3–4 min)

**Goal:** Prove this is not mock-only: FastAPI, PostgreSQL, seed, API docs.

**Recording:** Split screen or cut from browser to IDE terminal.

**Actions:**

1. Show terminal: Docker postgres running; uvicorn on port 8000.
2. Browser: **http://localhost:8000/docs** — expand **Auth**, **Applications**, **Documents**, **Officer**, **Grievances**, **Chat** tags briefly.
3. Execute **GET /api/health** in Swagger or browser.
4. Optional: show one successful authenticated request (documents list or applications/me) with JWT — blur token if visible.

---

### Part 19 — Closing montage (1–2 min)

**Actions:**

1. Log in as Investor; dashboard hero shot.
2. Quick cuts (you can record short 5s clips): wizard step 3, document verified badge, officer queue priority, policy bottleneck chart, chatbot answer.
3. End on public home with PRAVAH logo and tagline.

---

## 5. Suggested recording order vs. narrative order

**Recording order (efficient for you):** Parts 1–3 → 4–11 (investor block in one session) → 12–15 (officer) → 16–17 (policy) → 18–19.

**Final video narrative order (for editor):** 1 → 2 → 3 → 16 (policy defines services) → 4 → 5 → 6 → 7 → 8 → 9 → 11 → 10 → 12 → 13 → 14 → 15 → 17 → 18 → 19.

Tell your editor to follow narrative order even if file numbers differ.

---

## 6. Troubleshooting during recording

If **login fails**, re-run `python -m app.seed.seed` and confirm password `PravahTest!2026`. If **applications list is empty**, submit one in Part 7 before Parts 9–12. If **document upload fails**, check backend logs for storage path and OCR dependencies (EasyOCR first run can be slow — wait on camera). If **chatbot errors**, verify `GEMINI`/LLM keys in backend `.env`; if missing, record UI with a canned fallback message and note in handoff to voiceover artist to refer to “policy-grounded RAG architecture” without claiming live LLM. If **officer pages 404**, pull latest `develop` or Shreya’s officer branch before recording Parts 13–15.

---

## 7. Handoff to voiceover teammate

Send them:

1. All exported `PRAVAH_PartXX_....mp4` files  
2. This runbook (so they know what you clicked)  
3. **`docs/DEMO_VOICEOVER_SCRIPT.md`** — line-by-line narration matched to parts  
4. Problem statement one-liner: *Efficiency in streamlining industrial approvals, compliance processes, and access to government support services (SIH26130)*

---

## 8. Roles covered checklist (sign-off)

Use this before you declare recording complete:

| Area | Part(s) |
|------|---------|
| Public portal & catalogue | 1 |
| Accessibility & i18n | 2 |
| RBAC login (Investor, Officer, Policy Admin) | 3 |
| Investor dashboard | 4 |
| Business profile & factory units | 5 |
| Clearance wizard | 6 |
| Apply + CAF + payment | 7 |
| Document drive + OCR + DigiLocker | 8 |
| Application tracking & payments | 9 |
| Incentives & helpdesk & audit | 10 |
| AI chatbot | 11 |
| Officer dashboard & queue & risk | 12 |
| Officer document review | 13 |
| Fraud & duplicates | 14 |
| Officer grievances | 15 |
| Policy services & workflows | 16 |
| Policy analytics & regulatory | 17 |
| Backend / API (optional) | 18 |
| Closing | 19 |

**Note on SYSTEM_ADMIN and TRANSACTIONAL_USER:** Backend RBAC includes these roles for audit and delegated filing; the demo login UI focuses on the three primary hackathon personas. If SYSTEM_ADMIN audit UI is added later, append a short Part 20 showing `/app/audit` or admin-only routes with that login.

---

*End of runbook.*
