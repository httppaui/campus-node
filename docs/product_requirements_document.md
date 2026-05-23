# Product Requirements Document (PRD) - CampusNode

## 1. Document Overview & Metadata
* **Project Name:** CampusNode
* **Status:** Draft / Pending Review
* **Target Audience:** Student Organizations, Executive Boards, Committee Members, Applicants, Alumni, and Development Agents
* **Author:** Antigravity (Senior Full-Stack Software Engineer & UI/UX Expert)
* **Date:** May 23, 2026

---

## 2. Executive Summary
Student organizations are the lifeblood of campus engagement, but they frequently suffer from massive operational inefficiencies. These inefficiencies stem from fragmented tools (using Discord/Slack for chat, Google Sheets for tracking points, Trello for tasks, Google Drive for minutes, and Typeform for applications), manual and tedious workflows, poor officer turnover, lack of accountability, and disconnected communication.

**CampusNode** is a centralized, full-stack collaborative platform (MVP) designed specifically for university student organizations. It consolidates recruitment, event operations, communications, knowledge management, member engagement (gamified tracking), compliance/finance, and project management into a single, intuitive, high-aesthetic workspace.

---

## 3. User Personas & Permissions (RBAC)
CampusNode implements a strict Role-Based Access Control (RBAC) system. The application adapts its features, dashboards, and views dynamically based on the logged-in user's role:

| Role | Description | Access Level / Permissions |
| :--- | :--- | :--- |
| **Admin (Executive Board)** | President, VP, Secretary, Treasurer. Ultimate decision-makers. | Full system access. Create/delete committees, manage permissions, edit budget allocations, approve liquidations, publish global pinned announcements, view overall analytics. |
| **Officer (Committee Head)** | Project managers, committee directors, coordinators. | Workspace management for their specific committee. Create and assign tasks, schedule committee events, manage registration lists, review applicants in their pipeline, log manual member points. |
| **Member** | Active members of the organization. | View global announcements, check task board for assignments, RSVP/register for events, access documentation (SOPs, minutes), view point leaderboard, check-in to events via QR. |
| **Alumni** | Graduated members who wish to stay connected. | Read-only access to global updates, alumni outreach newsletter hub, historical event reports, and the constitution/by-laws archive. No task/budget access. |
| **Applicant** | Students applying to join the organization. | Access to application forms, progress tracker for screening pipeline (e.g., applied, scheduled for interview, offered). Limited sandbox dashboard. |

---

## 4. Epic & Feature Specifications

### Epic 1: Dashboard System
* **Objective:** Provide a tailored landing page summarizing important updates, actions, and metrics based on the user's role.
* **Requirements:**
  * **Role-Specific Widgets:**
    * *Admins:* Pending budget approvals, pending member applications, global activity chart, active member ratio.
    * *Officers:* Committee task completion progress, upcoming event RSVPs, pending task reviews.
    * *Members:* Unfinished assigned tasks, upcoming RSVP'd events, current points & leaderboard rank, check-in quick actions.
    * *Applicants:* Current application status, onboarding checklist (if offered admission).
  * **Activity Overview:** Graph showing organization activity trends (task completions, event attendances, document edits) over time.

### Epic 2: Recruitment & Onboarding
* **Objective:** Streamline the application, screening, and onboarding pipeline for new recruits.
* **Requirements:**
  * **Application Forms:** Customizable form templates (e.g., text fields, file uploads for resumes, committee preferences).
  * **Screening Pipeline:** A Kanban-style pipeline interface for Admins/Officers. Stages: `Applied` $\rightarrow$ `Screening` $\rightarrow$ `Interview Scheduled` $\rightarrow$ `Offered` $\rightarrow$ `Rejected`. Includes scoring, comments, and interview feedback logs.
  * **Member Onboarding Workflows:** Once an applicant accepts an offer, they transition to a "New Member" status. A checklist of onboarding tasks (e.g., "Sign code of conduct", "Join Slack/Discord", "Attend orientation event") is automatically assigned.

### Epic 3: Event Management
* **Objective:** Simplify planning, execution, volunteer coordination, and attendance tracking for organization events.
* **Requirements:**
  * **Event Creation & Scheduling:** Fields for title, description, start/end time, location (physical/virtual), cover image, and point values.
  * **RSVP & Registration System:** Members and general students can register. Custom questions can be added to registrations.
  * **Volunteer Assignment Matrix:** Assign members to specific roles (e.g., Tech Support, Logistics, Emcee) and shifts.
  * **Attendance Monitoring (Dynamic QR):**
    * Generating a dynamic QR code page for the event. The QR code must rotate every 10–15 seconds to prevent screenshot sharing/cheating.
    * Mobile scanner UI that validates the scanner’s current geolocation (optional) and the rotating token.
    * Manual attendance override panel for officers (for members without smartphones or technical errors).
  * **Post-Event Reports & Announcements:** Form to write summaries, upload photos, document final budgets, and record total attendance metrics.

### Epic 4: Communications & Announcement Hub
* **Objective:** Replace cluttered messaging threads with organized channels of communication.
* **Requirements:**
  * **Announcement Hub:** Official announcements with rich text, image attachments, and categorization (e.g., Executive, Finance, Social).
  * **Pinned Posts:** Admins can pin critical announcements (e.g., Constitution vote, fee payments) to the top of the dashboard.
  * **Cross-Committee Coordination Space:** Threaded bulletin boards for committees to discuss shared projects without spamming other members.
  * **Alumni Outreach:** Newsletter composer that filters and emails published updates to the Alumni database.

### Epic 5: Knowledge & Documentation (Institutional Memory)
* **Objective:** Ensure continuity and archive vital documents across academic years.
* **Requirements:**
  * **Meeting Minutes Repository:** Standardized markdown templates for meeting minutes with fields for date, attendees, agenda, and action items.
  * **Constitution & By-Laws Archive:** Safe, version-controlled repository of the organization's governing documents.
  * **Standard Operating Procedures (SOPs):** Storage for process guidelines (e.g., "How to book an auditorium", "How to submit a layout request").
  * **Turnover Documentation System:** Offgoing officers compile structured turnover manuals containing logins, contact logs, project histories, and tips. These are locked to succeeding officers.

### Epic 6: Project & Task Tracking
* **Objective:** Enable structured project management with built-in accountability.
* **Requirements:**
  * **Kanban Board:** Smooth drag-and-drop interface with columns: `To Do`, `In Progress`, `Under Review`, `Done`.
  * **Committee Workspaces:** Task boards are isolated by default to committees (e.g., Marketing, Logistics) but visible globally.
  * **Task Details:** Priority level (Low, Medium, High), due dates, assignees, description, sub-task checklists, and file attachments (e.g., Figma links, write-ups).
  * **Accountability Monitoring:** Flags tasks that are overdue or have been stuck in `In Progress` for too long. Sends dashboard notifications.

### Epic 7: Member Engagement & Gamification
* **Objective:** Motivate active member participation through points, recognition, and friendly competition.
* **Requirements:**
  * **Officer/Member Points System:** Assign points automatically for event attendance (+10 pts), task completion (+15 pts), volunteering (+20 pts), or manual adjustments.
  * **Leaderboard:** Public ranking of members based on points. Resets or archives at the end of each term/semester.
  * **Achievement Badges:** Visual badges (e.g., "Logistics Guru" for 5 volunteer shifts, "Perfect Attendance", "Documentarian").
  * **"Most Active Member" Recognition:** Monthly showcase widget on the main dashboard for the top point scorer.

### Epic 8: Compliance & Finance
* **Objective:** Establish financial transparency and reduce manual paper-chasing.
* **Requirements:**
  * **Budget Tracking:** Central dashboard listing available funds, allocations per committee, and real-time remaining balance.
  * **Liquidation Workflows:** Officers submit receipts, amount spent, description, and event link. Admins (Treasurer) approve or request revisions.
  * **Sponsorship Pipeline:** Track prospective sponsors, stage (Contacted, Pitching, Contract Signed), deliverables required (e.g., logo placement), and money/goods received.
  * **Financial Reporting:** Auto-generate simple reports (receipt exports, income statement views) for university auditing.

### Epic 9: Member Management
* **Objective:** Maintain a comprehensive directory of members and their roles.
* **Requirements:**
  * **Directory & Profiles:** Detailed profiles showing name, profile picture, committee assignment, course, year level, active/inactive status, contact details.
  * **Role/Permission Admin Controls:** Admins can promote, demote, or suspend users from a centralized table.

---

## 5. Non-Functional Requirements (NFRs)
1. **Security & Privacy:**
   * Restrict registration strictly to authorized university email domains (e.g., `@*.edu`, `@g.edu`).
   * Password hashing (if local credentials are used) and session security via JWT/NextAuth.
   * Access checking on all REST endpoints to prevent horizontal or vertical privilege escalation.
2. **Performance & Reliability:**
   * Database queries optimized via Prisma index definitions.
   * Responsive layout that works on desktop, tablet, and mobile browsers.
   * Fast initial page load ($< 2.0$ seconds for main dashboards).
3. **UI/UX Excellence:**
   * Clean, modern design adopting an executive slate-and-neon-indigo aesthetic.
   * Accessible contrast ratios meeting WCAG AA standards.
   * Clear loading states and micro-interactions (e.g., skeleton loaders, button transition states).

---

## 6. Out of Scope for MVP
* Real-time text/voice chat (e.g., replacing Discord servers entirely). We focus on forums/bulletin threads.
* Integration with university payroll or external banking systems.
* Multi-tenant hosting (allowing multiple universities to register on a single instance). This MVP is configured for a single university organization workspace.
* Native mobile apps (Android/iOS) on the app store; the web app will be fully responsive and PWA-compatible.
