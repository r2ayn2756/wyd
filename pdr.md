# PDR: "wyd" Daily Time Leaderboard
---

| **Document Status** | **DRAFT** |
| :--- | :--- |
| **Author** | [Your Name/Company] |
| **Date** | 2025-11-13 |
| **Version** | 1.3 |

## 1. Executive Summary

**"wyd" (What You Doing)** is a minimalist, invite-only web application designed to foster productivity and accountability within a closed group. It combines a simple time tracker with a gamified leaderboard system. The core problem it solves is the lack of a simple, real-time motivator for remote or self-directed teams. By requiring users to state their task on clock-in and ranking them by total time, it encourages both "showing up" and "being intentional" with that time.

The app's primary interface is a single tab containing the time tracking controls and a set of leaderboards (Daily, Weekly, Monthly, Yearly, All-Time), with the daily board resetting every morning at 5:00 AM.

## 2. User Personas

* **Admin ("The Head Person"):** This user is responsible for the workspace. Their primary role is to invite members and manage the team. They are also a participant who tracks their time and appears on the leaderboards.
* **Member (Standard User):** This user is invited to the app by the Admin. Their goal is to track their productive time, see how their efforts compare to their peers, and use the leaderboards as a daily, weekly, and long-term motivator.

## 3. Core Features & Requirements

### 3.1. User Authentication & Profile

* **Sign Up:** Users can **only** sign up via an invite link. The signup page will require:
    * Email
    * Password (with confirmation)
    * Full Name (this will be on the leaderboard)
    * LinkedIn Profile URL (e.g., `https://linkedin.com/in/username`)
* **Login:** Standard Email & Password login.
* **Profile Editing:** Once logged in, a user must be able to edit their **Full Name**. Other fields (Email, LinkedIn) should also be editable in a simple "Profile" or "Settings" area.
* **Identity:** Users are identified on the leaderboard by their **Full Name**. Their name will be a hyperlink that directs to their **LinkedIn Profile URL**.

### 3.2. Invite-Only System (Admin Function)

* **Admin Role:** One user (the initial creator of the "team") must be designated as the Admin.
* **Invite Link Generation:** The Admin will have access to a function (e.g., a button) to "Generate Invite Link".
* **Single-Use Links:** Each generated link is **single-use**. Once a new user successfully signs up using the link, that link is permanently invalidated and cannot be used again.
* **No Public Registration:** The app must not have a public "Sign Up" page. Access is gated *only* by the Admin's invite links.

### 3.3. Core Time Tracking Loop

The main page will feature the core tracking controls.

* **State 1: Clocked Out**
    * User sees a "Clock In" button.
    * **Action:** When the user clicks "Clock In", the timer starts immediately (no modal/prompt).
* **State 2: Clocked In**
    * The UI updates to show "Status: Clocked In".
    * A live-updating timer displays the duration of the *current* session (e.g., `00:45:12`).
    * The button changes to "Clock Out".
* **Action:** When the user clicks "Clock Out", a modal or prompt **must** appear, asking: "What did you work on?" (or "wyd?")
    * The user **must** enter a text description of what they accomplished.
    * The session (Start Time, End Time, Duration, Task Description) is saved to the database after they submit this description.

### 3.4. Time Verification & Manual Fix

This app does **not** have a traditional "manual time entry" feature (i.e., adding time from scratch). It only has a "manual fix" workflow.

* **Verification Trigger:** After a user clocks out, if the *just-completed session* was **longer than 1 hour**, a verification prompt will appear.
    * **Prompt:** "You tracked [Session Duration, e.g., 2h 30m] for '[Task Description]'. Is this correct?"
    * **Buttons:** [Yes, Correct] and [No, Fix It].
* **Workflow 1: "Yes, Correct"**
    * The session is confirmed and added to their daily total. The prompt disappears.
* **Workflow 2: "No, Fix It"**
    * A "Manual Fix" modal appears.
    * This modal is **pre-filled** with the session's details (Task Description, Start Time, End Time).
    * The user can **only edit the Start Time and End Time** of that specific session. They cannot create a new entry.
    * On saving, the corrected session is used for the daily total.
* **Note:** Sessions 1 hour or less are auto-confirmed without this prompt to reduce friction.

### 3.5. Leaderboard System

The leaderboard is a core component of the app. It must be queryable by different time ranges.
*(Assumption: All leaderboard resets happen at the 5:00 AM time, in the app's designated timezone, to maintain consistency.)*

* **Scope:** All leaderboards display **all** users who are part of the Admin's team.
* **Ranking:** Users are ranked in descending order by **Total Time Tracked** for the selected period.
* **Format:** `[Rank] - [User Full Name (as LinkedIn hyperlink)] - [Total Time HH:MM:SS]`
* **Real-Time:** All boards must update in near-real-time as users clock out and log time.

#### 3.5.1. Daily Leaderboard (Default View)
* **Reset:** Resets to `00:00:00` for all users every morning at **5:00:00 AM**.

#### 3.5.2. Weekly Leaderboard
* **Reset:** Resets every **Monday at 5:00:00 AM**.
* **Data:** Displays total time tracked from the reset (Monday 5:00 AM) to the following Monday (4:59:59 AM).

#### 3.5.3. Monthly Leaderboard
* **Reset:** Resets on the **1st of every month at 5:00:00 AM**.
* **Data:** Displays total time tracked from the 1st (at 5:00 AM) to the 1st of the next month (at 4:59:59 AM).

#### 3.5.4. Yearly Leaderboard
* **Reset:** Resets on **January 1st of every year at 5:00:00 AM**.
* **Data:** Displays total time tracked from Jan 1st (at 5:00 AM) to Dec 31st (at 4:59:59 AM).

#### 3.5.5. All-Time Leaderboard
* **Reset:** **Never resets.**
* **Data:** Displays the cumulative total time tracked by each user since they joined the app.

### 3.6. System: The 5 AM Reset Edge Case

This is the core "heartbeat" of the app.

* **Edge Case: Active User at 5 AM:** If a user is **actively clocked in** when *any* 5:00 AM reset occurs (daily, weekly, monthly, yearly):
    1.  The system automatically **clocks out** their active session at `04:59:59 AM` and attributes that time to the *previous* period (previous day, week, month, or year).
    2.  The system immediately and automatically **clocks in** a *new* session for that same user at `05:00:00 AM`, applying it to the *new* period.
    3.  This new session **reuses the same task description** from the session that was just split.

## 4. UI/UX Flow (The "One Tab")

The app will be a single primary page after login.

* **Header:**
    * App Logo/Name (wyd)
    * User's Name (with a dropdown for "Profile" and "Logout")
    * (If Admin) A link to "Invite Members"
* **Main Content (Two-Column Layout):**
    * **Column 1: Time Tracker**
        * Current Status: (e.g., "Clocked Out" or "Clocked In")
        * Task: (e.g., "Working on: 'Client Emails'")
        * Session Timer: `HH:MM:SS` (live)
        * The main [Clock In] / [Clock Out] button.
    * **Column 2: Leaderboards**
        * **Tab Navigation:** A set of tabs (using shadcn/ui "Tabs" component) will allow users to select the leaderboard view.
            * `[ Daily ]` `[ Weekly ]` `[ Monthly ]` `[ Yearly ]` `[ All Time ]`
        * **Title:** A dynamic title, e.g., "Today's Leaderboard" or "This Week's Leaderboard".
        * **Subtitle:** A dynamic subtitle, e.g., "Resets at 5:00 AM" or "Resets Monday at 5:00 AM" or "Never Resets".
        * **List:** The ranked list of users for the selected time period.

## 5. Design & Technical Constraints

### 5.1. Visual Design (Aesthetic)

* **Monochrome:** The entire application UI must adhere to a strict monochrome color palette (e.A. black, white, and shades of gray).
* **Focus on Typography:** With color removed, emphasis must be on clean typography, spacing, and hierarchy to guide the user.
* **Minimalist:** The UI should be free of unnecessary decoration or visual clutter.

### 5.2. UI/UX Framework

* **Component Library:** The app's user experience (UX) and user interface (UI) components must be built using **shadcn/ui**.
* **Component Usage:** This includes, but is not limited to:
    * **Buttons:** (e.g., "Clock In", "Logout")
    * **Modals/Dialogs:** (e.g., "What are you working on?", "Manual Fix")
    * **Input Fields:** (e.g., Login, Profile Edit, Task Description)
    * **Dropdowns/Menus:** (e.g., User Profile menu)
    * **Tabs:** (For switching between leaderboard views)
    * **Tables/Lists:** (For the Leaderboard)