# JOBNEXA – JOB ALERT AND RESUME PORTAL
## ACADEMIC PROJECT REPORT
**Subject:** Web Technologies and Mobile Programming  
**Degree:** Bachelor of Technology (B.Tech) – Computer Science and Engineering  
**Application Name:** JobNexa  
**Tagline:** Connect. Apply. Achieve.  

---

## 1. Abstract
In modern higher education institutions and competitive recruitment environments, campus placement processes are often fragmented across disparate communication channels, leading to asymmetric job matching and delayed hiring lifecycles. **JobNexa** is a comprehensive, full-stack recruitment portal designed to seamlessly connect three core stakeholders—Students (candidates), Corporate Recruiters, and Academic Placement Administrators—into an integrated digital ecosystem.

Built with a strictly decoupled architecture comprising a **React.js** Single Page Application frontend and a **Node.js/Express.js** RESTful backend, JobNexa incorporates a deterministic **Skill-Based Recommendation Algorithm**, encrypted **Cloudinary** cloud resume storage, automated in-app **Job Alerts**, and robust **Role-Based Access Control (RBAC)** powered by JSON Web Tokens and bcrypt cryptographic hashing. The system eliminates placement friction and duplicate submissions, achieving transparent recruitment tracking from initial application to final interview scheduling.

---

## 2. Introduction & Background
The transition from academic curricula to industry employment is a defining milestone for undergraduate engineering students. Traditional recruitment drives rely heavily on disparate spreadsheets, physical resume copies, or unindexed email threads. This antiquated approach introduces substantial overhead for recruiters, prevents students from objectively assessing their skill deficiencies, and limits administrative visibility.

JobNexa addresses these systemic limitations through a modern, cloud-native web application adhering to industry software engineering best practices, accessibility standards, and production-ready security protocols.

---

## 3. Problem Statement
Existing campus placement workflows present critical challenges:
1. **Inefficient Skill Matching:** Recruiters must manually parse hundreds of unstructured resumes without automated quantification of candidate suitability.
2. **Data Ephemerality & Storage Loss:** Locally stored candidate resumes are prone to data loss, unauthorized access, or corruption.
3. **Communication Disconnect:** Candidates experience prolonged uncertainty regarding application review stages, lacking a centralized interview schedule tracker.
4. **Administrative Blindspots:** Placement cell officers lack centralized analytics to monitor department-wide placement ratios, company participation, and student engagement.

---

## 4. Existing System vs. Proposed JobNexa System

| Dimension | Existing Traditional System | Proposed JobNexa System |
| :--- | :--- | :--- |
| **Architecture** | Monolithic or disconnected spreadsheets | Strictly separated React SPA frontend and Express REST API backend |
| **Job Discovery** | Manual browsing through email notices | Search by keyword, location, salary, experience, plus algorithmic recommendations |
| **Skill Assessment** | Subjective, unquantified resume scanning | Mathematical skill match percentage calculated in real time |
| **Resume Handling** | Unorganized email attachments | Secure Cloudinary cloud storage with PDF/DOCX validation & download links |
| **Alerts & Updates** | Static campus bulletin boards | Real-time in-app notifications with unread counts and direct links |
| **Application Tracking** | Opaque, unidirectional communication | 4-stage lifecycle tracker (Applied $\rightarrow$ Shortlisted $\rightarrow$ Interview $\rightarrow$ Offer) |
| **Administration** | Manual manual tallying | Centralized administrative portal with interactive charts and moderation tools |

---

## 5. Project Objectives
1. Implement a responsive, accessible, and Gen-Z-inspired web user interface using React, Tailwind CSS, and Lucide icons.
2. Establish a modular, MVC-compliant Node.js and Express backend adhering to RESTful API conventions.
3. Integrate MongoDB Atlas with Mongoose ODM to model 10 distinct collections with strict constraints and compound indexes.
4. Develop a deterministic mathematical skill-matching algorithm to score student profiles against recruiter requirements.
5. Provide persistent cloud binary storage for candidate resumes using Cloudinary.
6. Provide role-based authorization to protect candidate, recruiter, and administrator access boundaries.
7. Deploy the complete full-stack platform to Render (Render Static Site for frontend and Render Web Service for backend).

---

## 6. Technology Stack

### Frontend Architecture:
- **Framework:** React.js 18 (Vite build engine)
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS with Dark/Light mode dynamic switching
- **HTTP Client:** Axios with request/response interceptors
- **Visual Analytics:** Recharts (responsive bar and pie charts)
- **Icons:** Lucide React

### Backend Architecture:
- **Runtime:** Node.js v26 LTS (Event-driven asynchronous I/O)
- **Framework:** Express.js 4.x
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs (Salt rounds: 10)
- **Security Hardening:** Helmet HTTP headers, CORS origin whitelisting, Express Rate Limit
- **File Ingestion:** Multer (Memory buffer storage)

### Cloud Infrastructure:
- **Database:** MongoDB Atlas (M0 Multi-Cloud cluster)
- **Binary Storage:** Cloudinary Cloud Media Services
- **Hosting Platforms:** Render Static Site & Render Web Service
- **Version Control:** Git & GitHub

---

## 7. System Architecture & Modules

### 7.1 Architecture Diagram
```
[ Client Browser ] <==== HTTPS / JSON ====> [ Render Web Service (Express.js) ]
 (React.js SPA)                                     |
                                        +-----------+-----------+
                                        |                       |
                                        v                       v
                              [ MongoDB Atlas ]       [ Cloudinary Storage ]
                             (10 Collections)            (PDF/DOCX Resumes)
```

### 7.2 Functional Modules

#### Module 1: Authentication & RBAC
- Multi-role user registration (`student`, `recruiter`).
- Protected administrative account generated via secure server initialization script.
- Stateless token verification via Bearer authorization headers.

#### Module 2: Candidate & Profile Management
- Comprehensive profile maintenance (college, degree, branch, graduation year, LinkedIn, GitHub).
- Interactive skill manager with dynamic tags and popular technology suggestions.
- Automatic profile strength/completion percentage computation.

#### Module 3: Resume Management & Cloud Storage
- Validation of document extensions (`.pdf`, `.docx`, `.doc`) and file size ($\le 5\text{MB}$).
- Streaming uploads to Cloudinary with metadata recorded in MongoDB.
- Single default resume designation for rapid job application.

#### Module 4: Job Publishing & Recruiter Hub
- Vacancy creation with rich criteria: title, required technical skills, salary range, job type, experience level, vacancies, and application deadline.
- Real-time applicant pipeline review.
- Direct interview scheduler linking video conference links and instructions.

#### Module 5: Job Matching & Recommendation Algorithm
- Formula: $\text{Match } \% = (\text{Matching Skills} / \text{Total Required}) \times 100$.
- Pre-processing normalization eliminating discrepancies from capitalization, hyphens, and whitespace.

#### Module 6: Alerts & Notification Engine
- Customizable target skill and location alert preferences.
- Server-side event hook triggering in-app notifications whenever matching jobs are posted.

#### Module 7: Administrative Oversight & Analytics
- Platform-wide telemetry (Total Students, Total Recruiters, Total Jobs, Placement Ratios).
- Interactive Recharts visualisations.
- Account moderation (suspension/activation) and job posting deletion.

---

## 8. Database Design & Collections

```
+---------------+        1:1        +--------------------+
|     User      |-------------------|   StudentProfile   |
+---------------+                   +--------------------+
        | 1:N                                 |
        |                                     | 1:N
        v                                     v
+---------------+                   +--------------------+
|  Application  |<------------------|       Resume       |
+---------------+                   +--------------------+
        ^
        | N:1
+---------------+        1:1        +--------------------+
|      Job      |<------------------|  RecruiterProfile  |
+---------------+                   +--------------------+
```

### Collection Specifications:
1. **Users:** `_id`, `name`, `email` (Unique Index), `password` (Hashed), `role`, `status`, `isApproved`, `createdAt`, `updatedAt`.
2. **StudentProfiles:** `_id`, `user` (Ref), `college`, `degree`, `branch`, `graduationYear`, `skills` (Array, Indexed), `profileCompletion`.
3. **RecruiterProfiles:** `_id`, `user` (Ref), `companyName`, `designation`, `companyWebsite`, `phone`.
4. **Jobs:** `_id`, `title`, `recruiter` (Ref), `companyName`, `description`, `requiredSkills` (Indexed), `location`, `salaryRange`, `jobType`, `vacancies`, `deadline`, `applicantCount`.
5. **Applications:** `_id`, `job` (Ref), `student` (Ref), `resume` (Ref), `coverLetter`, `status`, `interview`, `createdAt`. **Compound Index:** `{ job: 1, student: 1 }` (Unique).
6. **Resumes:** `_id`, `student` (Ref), `originalName`, `fileUrl`, `publicId`, `fileType`, `fileSize`, `isDefault`.
7. **Notifications:** `_id`, `user` (Ref), `title`, `message`, `type`, `link`, `isRead`.
8. **SavedJobs:** `_id`, `user` (Ref), `job` (Ref). **Compound Index:** `{ user: 1, job: 1 }` (Unique).
9. **JobAlerts:** `_id`, `user` (Ref, Unique), `preferredSkills`, `preferredLocations`, `jobType`, `isActive`.
10. **Companies:** `_id`, `name`, `logo`, `website`, `recruiter` (Ref).

---

## 9. Comprehensive Testing & Verification Matrix

| # | Test Scenario | Expected Outcome | Result |
| :---: | :--- | :--- | :---: |
| 1 | Student registration with valid inputs | User document created; JWT issued; 201 Created | **PASS** |
| 2 | Duplicate email registration attempt | Rejected with descriptive error message; 400 Bad Request | **PASS** |
| 3 | Public registration attempt with `role='admin'` | Forbidden; 403 response | **PASS** |
| 4 | Student and Recruiter authentication | Returns valid JWT token & role-specific redirection | **PASS** |
| 5 | Protected route access without Bearer token | Denied; 401 Unauthorized | **PASS** |
| 6 | Student accessing recruiter dashboard | Denied; 403 Forbidden | **PASS** |
| 7 | Job search by keyword and location filter | Returns filtered matching job records | **PASS** |
| 8 | Multi-skill job recommendation calculation | Computes exact mathematical match percentage | **PASS** |
| 9 | Skill normalization (`Node.js` vs `nodejs`) | Matches successfully despite punctuation/case differences | **PASS** |
| 10 | PDF/DOCX resume upload $\le 5\text{MB}$ | Stored in Cloudinary; metadata saved in MongoDB | **PASS** |
| 11 | Non-supported file upload (`.exe`, `.png`) | Multer rejects file with validation error | **PASS** |
| 12 | Candidate job application submission | Application recorded; job applicantCount incremented | **PASS** |
| 13 | Duplicate job application attempt | MongoDB compound unique index rejects duplicate; 400 response | **PASS** |
| 14 | Bookmarking and removing saved jobs | SavedJob document created and removed accordingly | **PASS** |
| 15 | Job Alert triggering upon job creation | New Notification document created for matching students | **PASS** |
| 16 | Notification bell unread count badge | Displays accurate unread count and marks read on demand | **PASS** |
| 17 | Recruiter application status modification | Candidate application status updated; candidate notified | **PASS** |
| 18 | Recruiter interview scheduling | Interview date, time, and link recorded and candidate alerted | **PASS** |
| 19 | Admin user account suspension | User prevented from further authentication | **PASS** |
| 20 | Admin job listing removal | Job and child applications deleted from database | **PASS** |
| 21 | Health check endpoint (`GET /api/health`) | Returns 200 OK with server uptime & MongoDB status | **PASS** |
| 22 | Dark mode toggle | Theme persisted in localStorage and applied across components | **PASS** |
| 23 | Client-side 404 fallback | Displays custom NotFound component | **PASS** |
| 24 | Vite production build compilation | Compiles all modules into optimized production bundles | **PASS** |

---

## 10. Conclusion & Future Scope

### Conclusion
**JobNexa** successfully delivers an end-to-end recruitment and resume portal adhering to modern full-stack web engineering standards. By decoupling the frontend and backend architectures, enforcing strict database uniqueness constraints, and incorporating algorithmic skill matching, the portal provides a reliable and transparent recruitment solution for academic institutions.

### Future Scope
1. **NLP Resume Parsing:** Integration of automated resume keyword parsing to automatically extract student skills from uploaded PDF text.
2. **WebRTC Video Conferencing:** In-browser peer-to-peer video calling for direct campus interviews.
3. **Automated Email Reminders:** Delivery of transactional interview reminder emails via SendGrid or AWS SES.
4. **Mobile Native Application:** Building companion React Native mobile applications for iOS and Android.
