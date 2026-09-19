# PRAVAH — Zaki's Development Phases
**Module:** Document Management & Document Pipeline
**Branch policy:** Everything is built, committed, and tested directly on the `zaki` branch. No `feature/zaki/*` sub-branches are used — this is a deliberate deviation from the MD's sub-branch convention, made for a solo, faster-moving workflow.
**Target window:** Start immediately, major implementation complete by 27–28 September 2026.
**Owner:** Saiyyad Zaki Ali

---

## 0. Non-negotiable universal rules (apply to every phase below)

These come straight from the MD's "Universal Rules" section and are not optional:

- Never hardcode secrets. All config comes from `.env`, loaded through a single `app/core/config.py` (pydantic-settings). Update `.env.example` the moment you add a new variable.
- Every API response uses the shared success/error envelope:
  ```json
  { "status": "success", "data": {}, "message": "..." }
  { "status": "error", "error_code": "...", "message": "..." }
  ```
- AI prompts live in `app/ai/prompts/`, never inline in route handlers.
- Database is the source of truth. No feature reads from mock JS data once its API exists.
- Never commit `node_modules/`, `venv/`, `__pycache__/`, `.env`.
- Always commit `requirements.txt`/`package.json` changes with the code that needs them, and tell the team what changed.
- Never push directly to `main` or `develop` — your work lands on `zaki`, and `zaki` is what eventually gets PR'd onward (even if that PR happens later/by someone coordinating integration).

---

## Phase 0 — Orientation & Environment (Today)

**Coding (via Antigravity):**
- Nothing written yet. First Antigravity prompt should be the MD's "inspect repository" pattern:
  > "Inspect the repository: existing frontend document-related components, current mock data for documents, FastAPI backend skeleton (if any exists from Vinayak's foundation), models, migrations, and env configuration. Summarize what exists and what's missing for the document module. Do not modify anything yet."

**You must externally ensure:**
- [ ] You've read the full MD end-to-end, not just your section.
- [ ] Python 3.11+, Node, PostgreSQL, Docker installed locally.
- [ ] Repo cloned, `zaki` branch created off `develop` (or `main` if `develop` doesn't exist yet):
  ```
  git checkout develop
  git pull origin develop
  git checkout -b zaki
  ```
- [ ] Confirm with Vinayak whether `backend/app/core/config.py`, the DB connection, and base FastAPI app already exist. Your document APIs depend on this foundation — if it isn't ready, coordinate timing rather than duplicating it.
- [ ] Identify which OCR approach the team is standardizing on (Tesseract locally vs. a cloud OCR API vs. Gemini vision) — this affects Phase 3 dependencies. If undecided, raise it with the team today since it affects `requirements.txt` and possibly `GEMINI_API_KEY` usage shared with Kajal.
- [ ] List the document types the demo needs to support (from the current frontend's `DocumentDrive`/`DocumentRepository` mock data) so Phase 1's `document_types` table isn't guessed.

---

## Phase 1 — Document Repository (Core tables + CRUD API)

**Coding (via Antigravity):**
- Create SQLAlchemy models: `documents`, `document_types`, `application_documents`.
- Create Alembic migration for these tables.
- Implement:
  ```
  POST   /api/documents
  GET    /api/documents
  GET    /api/documents/{id}
  DELETE /api/documents/{id}
  ```
- Wrap every response in the shared success/error envelope.
- Suggested prompt:
  > "Implement only the document repository sub-phase: models, Alembic migration, and CRUD routes for documents/document_types/application_documents. Follow the shared response format and config. Do not touch OCR, storage, or frontend yet. Report files changed, migration created, and API routes added."

**You must externally ensure:**
- [ ] Run the migration yourself and confirm the tables actually appear in Postgres (`alembic upgrade head`, then inspect via psql or a DB client) — don't just trust the report.
- [ ] Hit the four endpoints manually (curl/Postman) with at least one success case and one validation-error case each.
- [ ] Confirm `document_types` seed values match what the frontend actually expects (check `DocumentDrive`/`DocumentRepository` components for the type names/labels in use).
- [ ] Commit on `zaki` with a message like `feat: add document repository models and CRUD API`.

---

## Phase 2 — Secure Storage Adapter

**Coding (via Antigravity):**
- Build `FileStorageInterface` with two implementations: `LocalStorage` (dev) and `CloudStorage` (production adapter, can be a stub for now).
- Enforce: MIME validation, file-size limits, file-extension whitelist, generated (non-guessable) file IDs, no direct public file exposure (files served through an authenticated route, not a static public folder).
- Suggested prompt:
  > "Implement the storage sub-phase: FileStorageInterface with LocalStorage now and a CloudStorage stub for later. Enforce MIME/size/extension validation and generated IDs. No public file exposure — files must be served through an authenticated endpoint. Do not implement upload/OCR yet."

**You must externally ensure:**
- [ ] Decide and document the actual limits (max file size, allowed extensions/MIME types) — the MD doesn't specify numbers, so this is your call; write it into `.env.example` (e.g. `MAX_UPLOAD_SIZE_MB`, `ALLOWED_DOCUMENT_TYPES`).
- [ ] Manually try uploading a disallowed file type/oversized file and confirm it's rejected, not silently accepted.
- [ ] Confirm files are NOT reachable via a raw URL without auth (test this yourself, don't take it on faith).
- [ ] Update `.env.example` with any new storage-related variables and tell the team.

---

## Phase 3 — Upload Endpoint

**Coding (via Antigravity):**
- Wire storage adapter into an actual upload endpoint that also creates the `documents` DB record.
- Flow: file received → validated → stored → DB record created → response returned.
- Suggested prompt:
  > "Implement the upload sub-phase: an authenticated upload endpoint that validates the file via the storage adapter from the previous phase, stores it, and creates a documents record. Integrate with existing auth (JWT) once Vinayak's auth is available; otherwise stub the current-user dependency clearly marked TODO. Report exact integration points."

**You must externally ensure:**
- [ ] Confirm with Vinayak whether JWT auth is ready. If not, keep the stub clearly marked and follow up — don't let a stub silently ship to `develop`.
- [ ] Upload a real PDF and a real image yourself and confirm a row appears in `documents` with the correct metadata (filename, size, type, uploader).
- [ ] Check that re-uploading the same file doesn't silently overwrite or duplicate incorrectly (decide and confirm the intended behavior).

---

## Phase 4 — OCR Pipeline

**Coding (via Antigravity):**
- Create `ocr_engine.py`.
- Flow: uploaded file → file validation → OCR → extracted text.
- Suggested prompt:
  > "Implement the OCR sub-phase using [the OCR approach decided in Phase 0]. Create ocr_engine.py. Input: a stored document ID. Output: extracted raw text, persisted or returned per repository conventions. Handle unreadable/corrupt files gracefully with the shared error format."

**You must externally ensure:**
- [ ] Install and test the actual OCR dependency locally yourself (e.g. Tesseract binary, or confirm the cloud/Gemini API key works) — this is the step most likely to silently "work in the report" but fail on a fresh machine.
- [ ] Add the new dependency to `requirements.txt` yourself if Antigravity doesn't, and re-test `pip install -r requirements.txt` in a clean venv.
- [ ] Test OCR against a real scanned/photographed document (not just a clean digital PDF) — this is the actual demo scenario.
- [ ] Record OCR accuracy issues now; you'll need realistic expectations for Phase 6 validation.

---

## Phase 5 — Extraction Engine

**Coding (via Antigravity):**
- Create `extraction_engine.py`: raw OCR text → structured extracted data (business name, address, dates, document-specific fields).
- Suggested prompt:
  > "Implement the extraction sub-phase: extraction_engine.py takes raw OCR text and the document_type, and returns structured JSON fields per document type. Use the AI prompt management pattern (app/ai/prompts/) if using an LLM for extraction rather than hand-written regex/rules. Never invent missing facts — return null/missing rather than guessing."

**You must externally ensure:**
- [ ] Decide per document type which fields actually matter for validation (Phase 6) — this drives what extraction needs to output.
- [ ] If this uses an LLM call, confirm the prompt file lives under `app/ai/prompts/` and isn't inline, and confirm it doesn't collide with Kajal's shared `llm_service.py` once that exists — coordinate rather than building a parallel LLM client.
- [ ] Test with at least one intentionally messy/ambiguous document and confirm it degrades gracefully (missing fields, not hallucinated ones).

---

## Phase 6 — Document Validation Engine

**Coding (via Antigravity):**
- Implement:
  ```
  POST /api/documents/{id}/validate
  GET  /api/documents/{id}/validation
  ```
- Checks: document type, business name match, address match, expiry, page count, signature presence, required fields, mismatch vs. business profile, duplicate signals.
- Result: `VALID` / `WARNING` / `INVALID`.
- Suggested prompt:
  > "Implement the validation sub-phase: validate endpoint that checks extracted data against the business profile and document-type rules. This is deterministic business logic, not an LLM call, per the MD's AI/deterministic boundary. Return VALID/WARNING/INVALID with reasons. Follow shared response format."

**You must externally ensure:**
- [ ] Confirm what "business profile" data is actually available to compare against — this depends on Bhagyesh's module. If it doesn't exist yet, mock the shape you expect and flag the dependency explicitly to the team.
- [ ] Manually test all three outcomes (valid doc, doc with a mismatch, doc missing a required field) to confirm each path actually triggers.
- [ ] Confirm this stays rule-based rather than quietly becoming an LLM judgment call — the MD is explicit that legal/validity decisions must be deterministic, not AI-generated.

---

## Phase 7 — pgvector Contribution (Embeddings for documents)

**Coding (via Antigravity):**
- After extraction, generate document chunks and embeddings.
- Store: `document_id`, `chunk_id`, `content`, `embedding`, `metadata`.
- Suggested prompt:
  > "Implement the vectorize sub-phase: after successful extraction, chunk the document text and generate embeddings, storing document_id/chunk_id/content/embedding/metadata. Use the embedding model and vector_store conventions Kajal has established in app/ai/embeddings.py and app/ai/vector_store.py — do not create a second, incompatible embedding pipeline."

**You must externally ensure:**
- [ ] This is a hard coordination point — talk to Kajal *before* this phase, not after. Confirm: which embedding model, chunk size/strategy, and the exact `vector_store` interface to call. Building this in isolation is the most likely place for duplicate/incompatible work.
- [ ] Confirm `pgvector` extension is actually enabled in your local Postgres (this is technically Vinayak's setup, but verify it yourself before assuming embeddings will insert cleanly).
- [ ] Test that a document's chunks are retrievable via whatever similarity-search function Kajal exposes — an insert-only pipeline that nothing can query yet is incomplete.

---

## Phase 8 — Frontend Integration

**Coding (via Antigravity):**
- Connect real APIs to: `DocumentDrive`, `DocumentRepository`, `UploadDocumentModal`, `DocumentReview`, application document upload, and validation-result display.
- Remove fake local-only upload behavior (currently mock-data-driven).
- Suggested prompt:
  > "Implement the frontend-document-integration sub-phase: replace mock data calls in DocumentDrive, DocumentRepository, UploadDocumentModal, DocumentReview, and application document upload with real calls to the FastAPI document endpoints. Preserve existing UI/UX exactly — only the data source changes. Report every file touched."

**You must externally ensure:**
- [ ] Click through the actual demo flow yourself afterward: upload → see it in the repository → open validation result → attach to an application. If any step feels different from the pre-migration demo, that's a regression to fix before moving on.
- [ ] Run `npm run lint` and `npm run build` yourself, don't rely on a report saying they passed.
- [ ] Confirm no leftover references to the old mock data file remain for document-related screens.

---

## Phase 9 — Full Domain Test & Merge Readiness

**Coding (via Antigravity):**
- Run backend tests (`pytest`) covering: success, validation errors, authorization, not-found, DB persistence, edge cases for the document module.
- Suggested prompt:
  > "Run and, where missing, write pytest coverage for the document module: upload success, invalid file type/size rejection, OCR failure handling, validation VALID/WARNING/INVALID paths, and not-found cases. Report exact test commands and results."

**You must externally ensure (this is the real Definition of Done — don't skip these even if Antigravity reports green):**
- [ ] End-to-end by hand: upload a real PDF/image → confirm a PostgreSQL row exists → confirm the file is actually stored → confirm OCR ran → confirm extraction produced structured data → confirm validation returned a real result → confirm it's visible through the API → confirm the frontend shows it correctly.
- [ ] `git status` clean, no `.env`/`node_modules`/`__pycache__`/`venv` committed.
- [ ] `requirements.txt`/`package.json` updated for every new dependency you introduced across all phases.
- [ ] `.env.example` updated for every new variable across all phases.
- [ ] Confirm a fresh clone + documented setup steps (clone → venv → pip install → `.env` → docker postgres → alembic upgrade → seed → uvicorn → npm run dev) actually works for the document module specifically — this is the MD's reproducibility bar.
- [ ] Commit history on `zaki` is meaningful (`feat:`, `fix:`, `test:` style messages per the MD's convention), even without sub-branches.
- [ ] When ready, this is the point where `zaki` would normally go through PR → `develop`. Since you're working solo on `zaki`, confirm with the team who reviews/merges it and when, so it isn't sitting untested against everyone else's work until the last moment.

---

## Cross-team dependency checklist (things outside your control that block you)

| You need this from | For phase |
|---|---|
| Vinayak — FastAPI skeleton, DB connection, JWT auth | Phase 1, 3 |
| Bhagyesh — business profile data shape | Phase 6 |
| Kajal — embedding model, vector_store interface, shared LLM client | Phase 5 (if LLM-based extraction), Phase 7 |
| Niraja — how document validation results feed into SLA/roadmap decisions | Phase 6 (output contract) |
| Shreya — DigiLocker adapter, if documents can be pulled from there instead of uploaded | Phase 2/3 (future scope) |

Flag any of these that are missing *before* you build a phase around a guess — rebuilding after the fact costs more time than a two-minute check-in with the team now.
