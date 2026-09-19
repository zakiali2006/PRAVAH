# PRAVAH (MAITRI 2.0 Single Window Clearance)

This repository contains the full-stack monorepo for the PRAVAH / UdyogSetu portal.

## 🚀 Current Project Status & Phase Tracking

We are tracking progress against the `phases (1).md` master document. 

### ✅ Completed or Nearly Completed Phases

* **Phase 1: Onboarding & Identity** (Mostly Complete)
  * *Done:* Registration form, Login screen (with prefilled demo credentials), Business Profile data collection, and robust Firebase JWT Authentication via FastAPI.
* **Phase 2: Factory & Plot Setup** (UI Complete)
  * *Done:* Factory Units and MIDC Plot management UI (`FactoryUnits.tsx`, `MyBusiness.jsx`).
* **Phase 3: Document Repository** (UI Complete)
  * *Done:* Centralized "Document Drive" UI for global document management (`DocumentDrive.jsx`).
* **Phase 4: Investor Wizard** (UI Complete)
  * *Done:* Multi-section questionnaire to derive required approvals (`InvestorWizard.tsx`).
* **Phase 6: CAF & Payment History** (UI Complete)
  * *Done:* Common Application Form generation and payment history UI (`CAFModal.tsx`, `PaymentsHistory.tsx`).
* **Phase 7: Support & Feedback** (UI Complete)
  * *Done:* UI for Grievances (`DepartmentQueries.tsx`), Feedback form routing, Incentive Calculator, and Public Consultations.
* **Phase 9: Dashboard (Landing Analytics)** (UI Complete & Optimized)
  * *Done:* Comprehensive `InvestorDashboard.tsx` built with stat tiles and charts. Fully optimized layout for above-the-fold graph visibility without scrolling.
* **Phase 11: Document Pre-Validation & OCR Auto-Validator** (Completed!)
  * *Done:* Implemented full EasyOCR and PyMuPDF pipeline in FastAPI (`ocr_service.py`). Real-time validation for Name Matching, Expiry Checks (Regex), and Signature presence.
* **Phase 19: Officer SLA Dashboard** (UI Complete)
  * *Done:* Officer views, layouts, and tracking dashboard (`OfficerDashboard.jsx`, `OfficerLayout.jsx`).
* **Phase 20: Duplicate / Fraud Detection** (UI Complete)
  * *Done:* Matching/near-matching detection UI via `FraudRadar.tsx`.

### 🌟 Cross-Phase Enhancements (Completed)
* **Global Translations:** Implemented dynamic Marathi & English translations across Navigation, Dashboard, and UI components via `TranslationContext`.
* **Accessibility (A11y):** Added contrast-friendly link underlining, dynamic font scaling, and global accessibility toggles.
* **Navigation & Routing:** Hierarchical drop-down menus, protected route barriers, and seamless login redirects.

### 🔄 In Progress (UI Built, Pending DB Integration)

* **Phase 0: Foundation & Infrastructure**
  * *Done:* Monorepo structure, React/Tailwind frontend, FastAPI backend, base Auth scaffold.
* **Phase 5: Service Catalogue, Applications & Tracking**
  * *Done:* UI for Services Available and Services Applied, backend API routes scaffolded.
* **Phase 18: AI Query Assistant**
  * *Done:* ChatBot UI widget scaffolded.

### ❌ Not Started (Needs Immediate Attention)

* **Phase 8: Account & Delegation Settings** - Need Transactional User RBAC and delegation.
* **Phase 10: AI Approval Roadmap** - Need dependency graph engine and sequencing logic.
* **Phase 12: SLA Risk & Delay Prediction** - Need risk engine and scoring logic.
* **Phase 13: Post-Approval Compliance Calendar** - Need automated compliance task generation.
* **Phase 14: Regulatory Change Impact Engine** - Need regulatory notification matching.
* **Phase 15: Incentive Readiness & Scenario Planner** - Need AI analysis on top of the Phase 7 calculator.
* **Phase 16: Dashboard Next-Best-Action Banner** - Need priority action surfacing in Dashboard.
* **Phase 17: Sentiment-Linked Grievance Triage** - Need negative sentiment escalation logic.
* **Phase 21: District/Sector Bottleneck Heatmap** - Need geographic/sectoral delay visualization.
* **Phase 22: Real Integrations & Launch Readiness** - Need Payment Gateway, SMS, Docker load testing.

---

## 🛠️ How to Run Locally

We use Docker to manage local infrastructure (PostgreSQL with pgvector) alongside the FastAPI backend.

### Prerequisites
1. **Docker Desktop**: Installed and running ([docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)).
2. **Node.js**: LTS version (needed for frontend).
3. **Python**: 3.12+ (for local backend development).

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd PRAVAH
   ```

2. **Configure Environment**:
   ```bash
   cd backend
   cp .env.example .env
   ```
   *(Fill in any missing keys in `.env` if necessary, though defaults work for local dev.)*

3. **Start the Infrastructure (PostgreSQL + Backend)**:
   From the repository root (where `docker-compose.yml` is):
   ```bash
   docker compose up -d postgres
   ```
   Wait for postgres to become healthy, then you can optionally run the backend in docker:
   ```bash
   docker compose up -d backend
   ```
   Alternatively, to run the backend locally (recommended for development):
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On Mac/Linux
   pip install -r requirements.txt
   alembic upgrade head  # (Coming in Phase 3)
   python -m app.seed.seed  # (Coming in Phase 7)
   uvicorn app.main:app --reload --port 8000
   ```
   *The backend API will be available at `http://localhost:8000/api/health` and Swagger at `http://localhost:8000/docs`.*

4. **Start the Frontend**:
   Open a new terminal at the project root:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`.*
