# PRAVAH - SIH Hackathon Demo Screen Recording Runbook

This runbook outlines the exact sequence of actions you need to record on your screen. Do this smoothly, pausing slightly between clicks so the voiceover can catch up. **No need to talk while recording**, your teammate will use the voiceover script to narrate over this video.

## 🎬 Pre-Recording Setup
1. Ensure the frontend (`npm run dev`) and backend (`uvicorn main:app`) are running.
2. Clear browser cache or use Incognito mode.
3. Have your cursor visible but don't move it erratically.
4. Open the PRAVAH landing page.

---

## 📽️ Scene 1: Introduction & Trilingual Support
**Goal: Show the landing page and the language switching capability.**
1. **[0:00]** Start recording on the Landing Page (`/`). 
2. **[0:05]** Scroll down slowly to show the UI, then scroll back up.
3. **[0:10]** Click the **Language Switcher** in the top navigation.
4. **[0:12]** Select **Hindi (हिंदी)**. Wait 2 seconds so the UI updates and the viewer can see the text change.
5. **[0:15]** Click the switcher again and select **Marathi (मराठी)**. Wait 2 seconds.
6. **[0:18]** Switch back to **English**.

## 📽️ Scene 2: PRAVAH Central Vault & Business Profile
**Goal: Show how investors maintain a single source of truth for their data.**
1. **[0:20]** Click **Login** and log in as an **Investor**.
2. **[0:25]** Navigate to the **My Business (Vault)** page from the sidebar.
3. **[0:28]** Show the empty state (if applicable), then click **Edit Profile / Setup Business**.
4. **[0:30]** A modal opens. Fill in realistic data (Company Name, PAN, CIN, GSTIN, Date of Incorporation). 
5. **[0:40]** Click **Save Changes**.
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
8. **[1:08]** Briefly show the document upload step and the final review step, then click **Pay & Submit**.

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
**Goal: Show how government officials process applications efficiently.**
1. **[1:45]** Log out of the Investor account.
2. **[1:48]** Log in as an **Officer / Reviewer**.
3. **[1:50]** Open the **Officer Dashboard**.
4. **[1:55]** Point out the **AI Risk Score** (e.g., Low/Medium/High Risk badges) on the pending applications list.
5. **[2:00]** Click on an application to review it. 
6. **[2:05]** Show the split-screen view where the Officer can see the submitted documents alongside the AI verification confidence score.
7. **[2:10]** Click **Approve**.

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
