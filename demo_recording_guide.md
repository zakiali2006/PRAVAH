# PRAVAH - Screen Recording Guide (For the Video Recorder)

This guide provides the exact steps and clicks you need to perform while recording the screen. Your teammate will read the `demo_script.md` voice-over that matches these steps exactly.

**Pre-Recording Setup:**
1. Start both the frontend (`npm start`) and backend servers locally.
2. Ensure you have seeded the database (if needed) so data appears.
3. Open a clean browser window at `http://localhost:5173`.
4. Maximize your browser to 1920x1080 (or your largest resolution).
5. Start screen recording!

---

## Scene 1: Introduction & Landing Page (0:00 - 0:15)
- **Action:** Open `http://localhost:5173`.
- **Action:** Scroll down slightly to show the features, then scroll back up.
- **Action:** Click on the **"Investor Login"** (or just **Login**) button.

## Scene 2: Trilingual Investor Dashboard (0:15 - 0:45)
- **Action:** Login as an Investor.
- **Action:** Land on the **Investor Dashboard**. Scroll smoothly to show the unified layout (stats, charts, roadmap).
- **Action:** Click the **Language Toggle** in the top navigation bar. Change it from English to **Marathi**, then to **Hindi**, and back to **English**. (Shows seamless trilingual support).
- **Action:** Open the **AI Chatbot** (bottom right). Type a quick query like *"How to apply for factory license?"* and let the bot answer. Close the chatbot.

## Scene 3: DigiLocker & Document Vault (0:45 - 1:10)
- **Action:** Click on **"Document Vault"** or **"My Documents"** in the sidebar.
- **Action:** Click the **"Fetch from DigiLocker"** button.
- **Action:** A mock DigiLocker modal/screen will appear. Click **"Authorize"** or enter the mock OTP.
- **Action:** Show the documents successfully populated with the green "Verified" badge.

## Scene 4: Single Window Application (1:10 - 1:30)
- **Action:** Go to **"Apply for Service"**.
- **Action:** Click on **"Factory License"** (or any available form).
- **Action:** Quickly scroll through the dynamic form. Show how fields auto-populate from the Document Vault.
- **Action:** Click **"Submit"**. Show the success confirmation.

## Scene 5: Officer AI Dashboard & Workload Balancer (1:30 - 2:00)
- **Action:** Log out of the Investor account.
- **Action:** Log in as **Department Officer**.
- **Action:** Show the **Officer Dashboard**. Highlight the "High Risk" and "Pending" cards.
- **Action:** Click on **"Duplicate Alerts"** in the sidebar.
- **Action:** Show the duplicate logic working (the page we just built). Point out the `95% Match` or `100% Match` badges.

## Scene 6: AI Risk Triage (2:00 - 2:20)
- **Action:** Go back to the **"Queue"** or **"Processing"** tab.
- **Action:** Click the **"Process"** button on the first pending application.
- **Action:** The **Action Required Modal** will pop up. Scroll through the AI Risk Analysis (highlighting Document Trust Score, Entity Reputation, and Risk Level).
- **Action:** Click **"Approve"**.

## Scene 7: Policy Admin / Analytics (2:20 - 2:50)
- **Action:** Log out of the Officer account.
- **Action:** Log in as **System Admin / Policy Maker**.
- **Action:** Show the **Admin Dashboard** (Macro Analytics, State-wide clearance rates).
- **Action:** Navigate to the **"CAF Builder"** or **"Service Manager"** page to show how admins can dynamically create new application forms without coding.
- **Action:** Log out and end recording.
