# PRAVAH - SIH Hackathon Demo Screen Recording Runbook

This runbook outlines the exact sequence of actions you need to record on your screen. Do this smoothly, pausing slightly between clicks so the voiceover can catch up. **No need to talk while recording**, your teammate will use the voiceover script to narrate over this video.

## 🎬 Pre-Recording Setup
1. Ensure the frontend (`npm run dev`) and backend (`uvicorn main:app`) are running.
2. Clear browser cache or use Incognito mode.
3. Have your cursor visible but don't move it erratically.
4. Open the PRAVAH landing page.

## 📂 Required Assets to Prepare Before Recording
To successfully demonstrate the **AI Document Scanning & Verification**, you need to create 2 simple sample documents (can be PDF or Image files like PNG/JPG) on your computer before you hit record:

- **Document 1: The "Passed" Document (e.g., `Valid_PAN_TechNova.pdf`)**
  - Make a simple document that contains the **EXACT SAME** details you'll enter in the Business Profile step:
    - **Company Name:** `TechNova Manufacturing Pvt Ltd`
    - **PAN Number:** `ABCDE1234F`
  - *Why:* The AI will read this, match it perfectly to the profile, and give it a High Confidence / Passed score.

- **Document 2: The "Error / Flagged" Document (e.g., `Mismatched_Details.pdf`)**
  - Make a document that has a **mismatched** PAN number (e.g., `PAN: XXXXX9999X`) or a completely different Company Name (e.g., `Global Corp Ltd`).
  - *Why:* The AI will scan this, fail to find the matching data, and flag it as a High-Risk mismatch.

---

## 📽️ Scene 1: Introduction, Chatbot & Trilingual Support
**Goal: Show the landing page, AI Chatbot platform guide, and language switching capability.**
1. **[0:00]** Start recording on the Landing Page (`/`). 
2. **[0:05]** Scroll down slowly to show the UI, then scroll back up.
3. **[0:08]** Click on the **Chatbot icon** in the bottom right corner.
4. **[0:10]** The Chatbot opens and displays pre-set questions. Click on *"What is PRAVAH?"* or *"What are the key features..."*.
5. **[0:15]** Wait for the AI to answer and scroll to show its response about the Hackathon features. Then close the chatbot.
6. **[0:20]** Click the **Language Switcher** in the top navigation.
7. **[0:22]** Select **Hindi (हिंदी)**. Wait 2 seconds so the UI updates and the viewer can see the text change.
8. **[0:25]** Click the switcher again and select **Marathi (मराठी)**. Wait 2 seconds.
9. **[0:28]** Switch back to **English**.
10. **[0:30]** Click **Login**, show the role selection options, and log in as an **Investor**.

## 📽️ Scene 2: PRAVAH Central Vault & Business Profile
**Goal: Show how investors maintain a single source of truth for their data.**
1. **[0:35]** Navigate to the **My Business (Vault)** page from the sidebar.
2. **[0:38]** Show the empty state (if applicable), then click **Edit Profile / Setup Business**.
3. **[0:40]** A modal opens. Fill in realistic data (Company Name, PAN, CIN, GSTIN, Date of Incorporation). 
4. **[0:45]** Click **Save Changes**.
6. **[0:42]** Hover over the updated Business Profile card to show the saved details (PAN, GSTIN, CIN).

## 📽️ Scene 3: AI Pre-fill & Application Process
**Goal: Show the magic of AI auto-filling forms using the Central Vault.**
1. **[0:45]** Click on **Services** in the sidebar.
2. **[0:48]** Select a service (e.g., "Factory Licence") and click **Apply**.
3. **[0:52]** On Step 1 of the form, pause. Highlight the **"PRAVAH AI Pre-fill Available"** banner with your mouse.
4. **[0:55]** Click **Auto-fill Data**.
5. **[0:58]** Let the animation run (Connecting to Vault -> Verifying KYC -> AI Mapping). 
6. **[1:02]** Scroll down slowly to show that the fields (Company Name, PAN, CIN, GSTIN, DOI) are magically filled with the "AI Filled" blue badges.
7. **[1:05]** Click **Save Draft & Next**.
8. **[1:08]** On the Document Upload step, upload your prepared files:
   - Upload **Document 1 (Valid)** for the PAN/Identity requirement.
   - Upload **Document 2 (Error)** for another requirement (like Factory Layout or Address Proof).
9. **[1:10]** Click **Pay & Submit**.

## 📽️ Scene 4: Investor Dashboard & Animated Tracking
**Goal: Showcase the premium UI, charts, and real-time tracking.**
1. **[1:12]** You are redirected to the **Investor Dashboard**.
2. **[1:15]** Move your mouse over the **Application Status (Donut Chart)** to show the tooltip hover effect.
3. **[1:20]** Pan your mouse to the **Your Approval Roadmap**. 
4. **[1:22]** Point at the glowing/pulsing blue node ("In Progress") and the animated connecting line.

## 📽️ Scene 5: RAG AI Application Copilot
**Goal: Show the chatbot helping the user.**
1. **[1:25]** Click the floating **AI Chatbot icon** in the bottom right corner.
2. **[1:28]** Type a query: *"What are the mandatory documents for a factory licence?"*
3. **[1:35]** Hit send and wait for the AI to stream the response based on the policy documents.
4. **[1:40]** Close the chat window.

## 📽️ Scene 6: Officer Dashboard (Smart Triage & Risk Scoring)
**Goal: Show how government officials process applications efficiently and how AI flags bad documents.**
1. **[1:45]** Log out of the Investor account.
2. **[1:48]** Log in as an **Officer / Reviewer**.
3. **[1:50]** Open the **Officer Dashboard**.
4. **[1:53]** Point out the **AI Risk Score** (e.g., Low/Medium/High Risk badges) on the pending applications list. Notice that the application you just submitted might be flagged due to the bad document!
5. **[1:56]** Click on the application to review it. 
6. **[2:00]** Focus on the **AI Verification Results** for the uploaded documents.
7. **[2:05]** Click on **Document 1 (Valid)** to show the split-screen view. Highlight that the AI successfully extracted the PAN and matched it to the profile (High Confidence / Passed).
8. **[2:10]** Click on **Document 2 (Error)**. Show how the AI caught the mismatch or missing data, flagging it with a low trust score or error warning.
9. **[2:15]** Based on the error, click **Raise Query** (or Reject/Approve based on what you want to show).

## 📽️ Scene 7: Policy Admin Dashboard
**Goal: Show the top-level configuration and analytics.**
1. **[2:15]** Log out and log in as a **Policy Admin**.
2. **[2:20]** Open the **Policy Dashboard**.
3. **[2:25]** Show the Analytics charts (Bottleneck analytics, processing times).
4. **[2:30]** Navigate to **Configure Workflows** to show the drag-and-drop or configuration UI for changing department routing.
5. **[2:40]** Stop recording.

---
**Tips for Recording:**
- Keep mouse movements deliberate. Don't jitter.
- Count to 2 in your head before clicking anything so the viewer can read the screen.
- Ensure your screen resolution is at least 1080p.
