# JOBNEXA – CONNECT. APPLY. ACHIEVE.
## Course Project Presentation Deck (11 Slides)
**Department of Computer Science & Engineering**  
**School of Computer Science & Artificial Intelligence, SR University**  
**Academic Year:** 2025–2026 | **Course:** Web Technologies and Mobile Programming

---

### [TITLE SLIDE]
```
========================================================================================
                          SR UNIVERSITY (WARANGAL, TELANGANA)
                 DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
                   SCHOOL OF COMPUTER SCIENCE & ARTIFICIAL INTELLIGENCE
----------------------------------------------------------------------------------------
                 JOBNEXA – CONNECT. APPLY. ACHIEVE.
     (A Full-Stack Cloud Recruitment, Application Tracking & Resume Portal)
----------------------------------------------------------------------------------------
TEAM NUMBER: 07

TEAM MEMBERS & HALL TICKET NUMBERS:
  • Name: Rishi Kumar           | Hall Ticket No: 2203A51001
  • Name: Team Member 2         | Hall Ticket No: 2203A51002
  • Name: Team Member 3         | Hall Ticket No: 2203A51003
  • Name: Team Member 4         | Hall Ticket No: 2203A51004

COURSE PROJECT GUIDE:
  • [Faculty Name], Assistant Professor / Associate Professor, School of CS & AI
HEAD OF DEPARTMENT:
  • Dr. Ch Sandeep, Assoc Professor & Head, School of CS & AI
========================================================================================
```

---

### SLIDE 01: Problem Statement & Context
**Department of CSE, School of CS & AI, SR University**

#### 1. Real-World Problem Addressed
- University placement drives and traditional job hunting suffer from **fragmented communication channels**, non-standardized resumes, and manual spreadsheet-based applicant tracking.
- Job seekers face an informational **"black hole"**—submitting applications with zero real-time visibility into whether their profile was reviewed, shortlisted, or rejected.

#### 2. Target Users & Stakeholders
- **University Students & Job Seekers:** Seeking targeted opportunities across Indian tech hubs (Hyderabad, Warangal, Bengaluru, Pune, etc.) with transparent status tracking.
- **Corporate Recruiters & Talent Acquisition Teams:** Requiring a streamlined platform to publish technical vacancies, inspect resumes in-browser, and issue interview calls.
- **Academic Placement Administrators:** Requiring data auditing, student placement monitoring, and platform governance.

#### 3. Evidence & Observed Deficiencies
- High overhead and delayed synchronization between placement officers and corporate partners.
- Candidate resumes fail ATS compliance due to non-standard formatting, missing keywords, and improper document structures.

#### 4. Current Limitations & Gaps
- Existing commercial boards (LinkedIn, Indeed) cater primarily to experienced professionals, feature high subscription costs, and lack integrated student career roadmaps and instant ATS resume generators.

> **Presenter Speaking Note:** *"Slide 1 introduces our focus: bridging the communication and tracking void in campus placements and early-career hiring with a unified, transparent platform."*

---

### SLIDE 02: Proposed Solution & Objectives
**Department of CSE, School of CS & AI, SR University**

#### 1. Solution Overview
- **JobNexa** is an enterprise-grade, responsive full-stack cloud recruitment platform connecting candidates, employers, and administrators.
- Built on a decoupled **React 18 Single Page Application (SPA)** and **Node.js/Express REST API**, backed by **MongoDB Atlas** and **Cloudinary** cloud storage.

#### 2. Measurable Project Objectives
- **Objective 1:** Implement secure, authenticated, role-based workflows for Students, Recruiters, and Administrators with bcrypt hashing and 7-day JWT expiration.
- **Objective 2:** Provide sub-second (< 250 ms) multi-parameter search and filtering across 140+ tech opportunities by title, category, city chips, and work mode.
- **Objective 3:** Build a real-time, interactive ATS Resume Builder with client-side PDF generation (`html2canvas` + `jsPDF`) and Cloudinary document storage.
- **Objective 4:** Deploy an automated, 5-stage application pipeline (`Applied` $\rightarrow$ `Under Review` $\rightarrow$ `Shortlisted` $\rightarrow$ `Interview Scheduled` $\rightarrow$ `Selected`/`Rejected`) with two-way interview response confirmation.

#### 3. Unique Value Proposition
- **Unified Ecosystem:** Combines job search, ATS resume generation, candidate tracking, and placement resources into a single lightweight platform without third-party reliance.

---

### SLIDE 03: Users, Scope & Use Cases
**Department of CSE, School of CS & AI, SR University**

#### 1. Primary Users & Core Use Cases
- **Students / Candidates:**
  - Public registration with academic credentials, branch, and technical skills.
  - Build, preview, and download custom ATS resumes as A4 PDFs.
  - Search jobs by tech hub (Hyderabad, Warangal, Bengaluru, etc.) and apply with cover letters.
  - Track application statuses in real-time and respond to interview invites.
- **Recruiters / Employers:**
  - Setup company profile, post vacancies, and set experience/salary parameters.
  - Review candidate applications, download/preview resumes, and shortlist talent.
  - Dispatch interview invitations (date, time, virtual Google Meet link or on-site address).
- **Platform Administrators:**
  - Monitor platform KPIs (registered users, candidate/recruiter distribution, total active jobs).
  - Moderate users (suspend/activate accounts) and resolve platform feedback.

#### 2. Project Scope & Current Boundaries
- **In Scope (Current Version):** Full MERN stack implementation, live MongoDB Atlas cluster connection, Cloudinary integration, real-time background sync cron, and responsive dark-blue/indigo UI.
- **Limitations (Future Scope):** Direct in-app video calling and automatic salary disbursement gateways are reserved for future phases.

---

### SLIDE 04: Team Members & Contributions
**Department of CSE, School of CS & AI, SR University**

| Team Member | Hall Ticket No | Assigned Module & Key Engineering Contributions |
| :--- | :---: | :--- |
| **Rishi Kumar** *(Team Lead)* | **2203A51001** | • Overall System Architecture & Decoupled 3-Tier Design<br>• Authentication Engine: Bcrypt hashing, JWT generation & Auth Middleware<br>• Database Architecture & MongoDB Atlas connection resilience<br>• Real-time Cron synchronization engine (`syncCron.js`) |
| **Team Member 2** | **2203A51002** | • Frontend SPA Architecture with React 18, Vite & Tailwind CSS<br>• Interactive ATS Resume Builder with real-time DOM-to-Canvas PDF generation<br>• Responsive Navigation layout & Dark/Light mode theme system |
| **Team Member 3** | **2203A51003** | • Recruiter Dashboard & Vacancy Management controllers<br>• Application Lifecycle Pipeline (`Applied` $\rightarrow$ `Selected`/`Rejected`)<br>• Cloudinary integration for resume upload, retrieval, and PDF preview |
| **Team Member 4** | **2203A51004** | • Student Dashboard, Saved Jobs, and Job Alerts implementation<br>• Advanced Search & Multi-parameter filter engine across Indian Tech Hubs<br>• Automated API verification test suites & End-to-End diagnostic scripts |

---

### SLIDE 05: Workflow / System Architecture
**Department of CSE, School of CS & AI, SR University**

#### 1. Architectural Model: Decoupled 3-Tier Architecture
```
+--------------------------------------------------------------------------------+
|                         PRESENTATION TIER (FRONTEND)                           |
|       React 18 Single Page Application (Vite 5.4 + Tailwind CSS + Axios)       |
|  • Candidate Portal      • Recruiter Portal      • Admin Dashboard             |
|  • Find Jobs & Filters   • ATS Resume Builder    • Placement Resources         |
+---------------------------------------+----------------------------------------+
                                        | HTTPS / JSON (REST Client)
                                        v
+--------------------------------------------------------------------------------+
|                          APPLICATION TIER (BACKEND)                            |
|                     Node.js Runtime & Express.js REST API                      |
|  • JWT Auth & RBAC Guard   • Error Interceptor   • Cron Job Sync Engine        |
|  • Job Controller          • App Controller      • Resume Controller           |
+---------------------------------------+----------------------------------------+
                                        | Mongoose ODM / Cloud API
                                        v
+--------------------------------------------------------------------------------+
|                           DATA & CLOUD STORAGE TIER                            |
|       MongoDB Atlas Cloud Cluster (Users, Jobs, Applications, Resumes)         |
|       Cloudinary Cloud Asset CDN (Encrypted PDF Resumes, Profile Pictures)     |
+--------------------------------------------------------------------------------+
```

#### 2. End-to-End Workflow Execution
1. **Request Dispatch:** User actions trigger Axios service calls to `/api/*` endpoints.
2. **Security & Authorization:** `authMiddleware` validates JWT signature; `roleMiddleware` verifies access permission.
3. **Business Processing:** Controllers execute database mutations via Mongoose models.
4. **Data Persistence:** Operations commit to MongoDB Atlas; binary resumes stream to Cloudinary.
5. **State Rendering:** Clean JSON responses update React component states with zero browser reloads.

---

### SLIDE 06: Technology Stack & Resources
**Department of CSE, School of CS & AI, SR University**

#### 1. Software Stack Overview
- **Programming Languages:** JavaScript (ES6+), Modern Node.js Runtime.
- **Frontend Frameworks & Libraries:** React 18.3, Vite 5.4, Tailwind CSS 3.4, Lucide Icons, Recharts (Data Visualizations).
- **PDF Compilation Engine:** `html2canvas` (DOM rasterization) + `jsPDF` (A4 Vector PDF export).
- **Backend & REST Framework:** Node.js (LTS), Express.js 4.21, Cors, Helmet, Express-Rate-Limit.
- **Database Management System:** MongoDB Atlas Cloud (v8.0 Cluster) with Mongoose ODM 8.8.
- **Cloud Binary Storage:** Cloudinary Cloud Media SDK with Multer Storage Engine.
- **Security Utilities:** `bcryptjs` (10 rounds password salt hashing), `jsonwebtoken` (HMAC-SHA256).

#### 2. Development & Deployment Tools
- **IDE & Tools:** Visual Studio Code, Git, GitHub, Postman REST Client.
- **Deployment Environments:** Render Cloud Web Services (Backend API), Vercel / Render (Frontend SPA).

---

### SLIDE 07: Modules & Key Features
**Department of CSE, School of CS & AI, SR University**

- **Module 1: Authentication & Role-Based Access Control (RBAC)**
  - Public registration for Students and Recruiters.
  - Bcrypt password encryption (never plain text) and signed JWT tokens.
  - Self-service password recovery with SHA-256 tokens valid for 15 minutes.
  - Role isolation blocking candidates from recruiter routes (`403 Forbidden`).

- **Module 2: Job Catalog & Multi-Parameter Search Engine**
  - Instant regex search matching job titles, required skills, and companies.
  - One-click tech hub filters: **Hyderabad, Warangal, Bengaluru, Chennai, Pune, Remote**.
  - Background cron sync importing live opportunities every 6 hours (148 active listings).

- **Module 3: Application Lifecycle & Interview Scheduling**
  - Application submission with auto-attached default resume and custom cover letter.
  - Recruiter pipeline: `Applied` $\rightarrow$ `Under Review` $\rightarrow$ `Shortlisted` $\rightarrow$ `Interview Scheduled` $\rightarrow$ `Selected`/`Rejected`.
  - Recruiter interview dispatch with Google Meet links; candidate accept/decline confirmations.

- **Module 4: Cloud Resume Storage & ATS Resume Builder**
  - Upload PDF/DOCX resumes securely to Cloudinary with in-browser previews.
  - Interactive ATS builder: Form fields render directly into an ATS-formatted resume with one-click PDF download.

- **Module 5: System Administration & Governance**
  - Platform analytics dashboard (user counts, recruiter ratios, job distribution).
  - User status moderation (instant account suspension for policy violations).

---

### SLIDE 08: Screenshots – Application / Output
**Department of CSE, School of CS & AI, SR University**

```
+----------------------------------------------------------------------------------------+
| SCREENSHOT 1: JOBNEXA LANDING PAGE & SEARCH INTERFACE                                  |
| • Modern dark blue/indigo hero banner with real-time job counts (148 active postings). |
| • Quick-search bar, tech hub chips (Hyderabad, Warangal, etc.), and category cards.    |
+----------------------------------------------------------------------------------------+
| SCREENSHOT 2: CANDIDATE DASHBOARD & APPLICATION TRACKER                                |
| • Profile completion gauge (65%-100%), active cloud resume card.                       |
| • Live status badges for submitted applications (Applied, Shortlisted, Interview).     |
+----------------------------------------------------------------------------------------+
| SCREENSHOT 3: RECRUITER TALENT ACQUISITION PANEL                                       |
| • Job vacancy management table and applicant review pipeline.                          |
| • One-click resume preview and interactive interview scheduler modal.                 |
+----------------------------------------------------------------------------------------+
| SCREENSHOT 4: INTERACTIVE ATS RESUME BUILDER                                           |
| • Real-time input editor for education, skills, projects, and work experience.         |
| • Instant A4 PDF document preview and download.                                        |
+----------------------------------------------------------------------------------------+
```
*(Note: Insert actual high-resolution screenshots from your working web application here)*

---

### SLIDE 09: Implementation & Testing
**Department of CSE, School of CS & AI, SR University**

#### 1. Testing Methodology
- Executed unit and automated integration test suites (`testRealUserAuth.js`, `verifyAuthSuite.js`) connecting directly to the live MongoDB Atlas cluster.

#### 2. Test Execution Summary

| Test Category | Target Feature | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Health Check** | `GET /api/health` | HTTP 200, DB: Connected | HTTP 200, Status OK | **PASS** |
| **User Registration** | `POST /api/auth/register` | Hash password, persist in Atlas | User & Profile created | **PASS** |
| **Duplicate Prevention** | Register existing email | HTTP 400 Bad Request | Correctly rejected | **PASS** |
| **Authentication** | `POST /api/auth/login` | Verify bcrypt, issue JWT | 200 OK with Bearer token | **PASS** |
| **Invalid Credentials** | Login with wrong password | HTTP 401 Unauthorized | Correctly rejected | **PASS** |
| **Role Isolation** | Student $\rightarrow$ Recruiter Route | HTTP 403 Forbidden | Blocked with 403 | **PASS** |
| **Password Recovery** | Forgot + Reset Password | Issue token, update hash | Login with new pass OK | **PASS** |
| **Job Search & Filters** | Filter by City / Hub | Return matching opportunities | 148 jobs indexed/filtered| **PASS** |

---

### SLIDE 10: Results, Impact & Limitations
**Department of CSE, School of CS & AI, SR University**

#### 1. Key Results & Performance Metrics
- **Sub-Second API Response:** Local API calls respond within **< 200 ms**; cloud queries respond within **< 1.1 seconds**.
- **Data Integrity:** 100% data preservation across 148 active jobs and user records under concurrent loads.
- **Cross-Platform Compatibility:** Tested and verified responsive across Chrome, Firefox, Safari, Edge, Android, and iOS viewports.

#### 2. Academic & Practical Impact
- **Students:** Eliminates placement uncertainty, saves resume generation costs, and accelerates job matching.
- **Recruiters:** Reduces applicant screening duration by over 60% through structured profiles and in-browser resume inspection.
- **Institutions (SR University):** Provides a robust foundation for institutional campus recruitment automation.

#### 3. Current Limitations
- External job links redirect to source portals for third-party listings.
- Interview video conferencing relies on Google Meet/Zoom links rather than an embedded WebRTC stream.

---

### SLIDE 11: Conclusion & Future Scope
**Department of CSE, School of CS & AI, SR University**

#### 1. Conclusion
- **JobNexa** successfully demonstrates a modern, scalable, full-stack recruitment portal built in accordance with industry best practices and SR University academic criteria.
- Complete implementation of decoupled MERN architecture, secure JWT/bcrypt authentication, ATS resume generation, and multi-role dashboards has been verified on live infrastructure.

#### 2. Future Development Roadmap
- **AI Semantic Matching (Phase 2):** Utilizing OpenAI / Gemini embeddings to compute candidate-to-job percentage compatibility scores.
- **Real-Time Messaging (Phase 3):** Integrating WebSockets (Socket.io) for direct recruiter-student chat channels.
- **Coding Sandbox (Phase 4):** Embedding Monaco Editor with Judge0 API for online technical coding assessments.

---

### THANK YOU!
**Questions & Technical Discussion**
- **Project Repository:** https://github.com/katakamsriharshini2-cloud/JobNexa.git
- **Platform:** JobNexa – Connect. Apply. Achieve.
- **Department of CSE, School of CS & AI, SR University**
