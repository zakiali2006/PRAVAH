# Implementation Plan: Dynamic Forms & Document Vault Integration

## Goal Description
The objective is to upgrade the `ApplyService.jsx` application wizard from a simple hardcoded prototype into a comprehensive, real-world government application form. This includes:
1. A rich, dynamic form schema that looks like a genuine corporate policy application.
2. An enhanced AI Pre-fill engine that populates a realistic set of business data (PAN, CIN, GSTIN, Address, etc.).
3. Integrating the "Document Vault" into the upload step, allowing users to select pre-verified documents from their PRAVAH vault instead of manually uploading files every time.
4. UI/UX improvements including a global "Back to Services" button and a more polished, grid-based form layout.

## User Review Required
> [!IMPORTANT]
> Since we are dynamically routing from different services, I propose creating a **Comprehensive Unified Business Form** that contains sections like:
> - **Entity Details** (PAN, CIN, GSTIN, Date of Incorporation)
> - **Contact & Location** (Registered Address, District, PIN)
> - **Operational Metrics** (Investment Size, Sector, Employee Count, Power Requirement)
> 
> Does this structure sound good for the "Form Data" step, or do you need completely different fields depending on the specific service clicked? (For a hackathon, a unified comprehensive form with AI Autofill is highly impressive).

## Proposed Changes

---

### 1. `ApplyService.jsx` (Frontend)
Will undergo a major UI overhaul to support real-world fields.
- **[MODIFY]** `frontend/src/features/applications/pages/ApplyService.jsx`
  - Add a **"Back to Services"** button at the very top of the page.
  - **Step 1 (Entity Details)**: Add fields for Company Name, PAN, CIN, GSTIN, Date of Incorporation.
  - **Step 2 (Operational Data)**: Add fields for Registered Address, Sector, Investment Amount (₹), Employee Count, and Power Requirement.
  - **AI Autofill**: Update the `handlePrefill` function to instantly populate all these new fields with realistic dummy data to wow the judges.

### 2. Document Vault Integration
Instead of only having local file upload, we will introduce a "Vault Selection" mechanism.
- **[MODIFY]** `frontend/src/features/applications/components/InlineDocumentUpload.jsx` (or inline inside ApplyService if this component is simple).
  - Add a toggle/tab: "Upload New" vs "Select from PRAVAH Vault".
  - If "Vault" is selected, render a sleek list of pre-existing documents (e.g., *DigiLocker PAN Card, MCA Incorporation Certificate*).
  - When the user selects a vault document, it instantly marks the document requirement as validated (with a green checkmark) without needing to upload anything.

## Verification Plan
### Manual Verification
1. Navigate to "Apply for Services" and click any service.
2. Verify the new "Back" button works.
3. Click "AI Auto-fill" and watch the extensive 10+ field form populate instantly.
4. Proceed to Step 3 (Documents), click "Select from Vault", choose a document, and ensure it validates successfully.
5. Submit the application and verify it redirects properly.
