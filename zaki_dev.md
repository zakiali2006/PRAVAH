# Zaki's Development Roadmap (PRAVAH Document Pipeline)

Based on the master `PRAVAH_Backend_Implementation.md` and the current state of the codebase, here is the exact step-by-step roadmap for your module (Document Management & Document Pipeline).

---

## Phase 1: Core Engine Stabilization & Refactoring (✅ COMPLETED)
Your core AI extraction logic is complete and functioning.
- `[x]` Build `ocr_engine.py` and connect it to Google Gemini.
- `[x]` Build `extraction_engine.py` to structure OCR text into JSON.
- `[x]` Build `validation_engine.py` to check for expiry, missing signatures, etc.
- `[x]` Add robust retry logic (Tenacity) to handle LLM 503 errors and rate limits.
- `[x]` Add markdown stripping to ensure JSON extraction never fails.

---

## Phase 2: Standardizing API Contracts (🟡 IN PROGRESS)
The master implementation document strictly mandates that all APIs follow a specific envelope structure.
**Your immediate next steps:**
1. **Standardize `documents.py` Responses:** Ensure every endpoint (`/api/documents/upload`, `/api/documents/{id}/validate`) returns exactly:
   ```json
   { "status": "success", "data": {...}, "message": "..." }
   ```
   If an error occurs, it must return:
   ```json
   { "status": "error", "error_code": "DOCUMENT_INVALID", "message": "..." }
   ```
2. **Standardize Validation Output:** Update `validation_engine.py` so the final output schema exactly matches the PRD requirement:
   ```json
   { "valid": false, "errors": [...], "warnings": [...] }
   ```
3. **Database Persistence:** Ensure that the `documents` table properly stores `file_name`, `storage_key`, `ocr_text`, `extracted_data`, and `validation_result` in PostgreSQL.

---

## Phase 3: The Application Handshake (🚧 BLOCKED)
According to the implementation guide, your documents do not exist in isolation. They must be linked to applications.
**Prerequisite:** Bhagyesh must finish the `applications` and `services` base tables.
1. **Build the `application_documents` Table:**
   Once Bhagyesh's tables are ready, you will create the linkage table:
   - `id`
   - `application_id`
   - `document_id`
   - `required_for_step`
   - `status`
2. **Create the Linkage API:** Build the logic that attaches an uploaded document to a specific requirement on the Approval Roadmap.
3. **Expose Completeness:** Expose an API that Niraja's SLA Risk Engine can call to determine "Document Completeness" (e.g., checking if all mandatory documents for an application are uploaded and VALID).

---

## Phase 4: Frontend Integration & Role Awareness (📅 UPCOMING)
The UI has now transitioned to a strict 5-tier Role-Based Access Control (RBAC) architecture.
1. **Remove Mock Data:** Go into `frontend/src/features/documents/` (specifically `DocumentDrive.jsx` and `UploadDocumentModal.jsx`) and completely remove `MockAppContext`. Wire them exclusively to your FastAPI endpoints.
2. **Apply Role Guards:** 
   - Ensure the Investor can upload and view their own documents (`Permission: documents.upload`).
   - Ensure the Officer can only review documents and cannot upload new ones (`Permission: documents.review`).
3. **Fix the "White Screen" Bug:** Investigate the frontend error handling in `UploadDocumentModal.jsx` to ensure that if your backend returns an error (or takes a long time), the frontend shows a Loading Spinner or Error Toast instead of crashing to a white screen.

---

## Phase 5: Knowledge Base Indexing (Kajal's Handoff) (📅 LATER)
Once your document text extraction is perfectly stable in PostgreSQL, you will work with Kajal to push the `ocr_text` into `pgvector` chunks so her RAG/AI Assistant can answer questions based on the user's uploaded documents.
