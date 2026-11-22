# JobNexa – Project Architecture & Technical Explanation
**Tagline:** Connect. Apply. Achieve.  
**Subject:** Web Technologies and Mobile Programming (Academic Capstone Project)

---

## 1. Introduction & Problem Statement

### 1.1 The Challenge in Campus & Tech Recruitment
Traditional campus recruitment processes often suffer from:
- **Disorganized Submissions:** Students manually emailing static resume files without structured skill records.
- **Placement Asymmetry:** Recruiters spending countless hours filtering through hundreds of mismatched applications.
- **Lack of Transparency:** Students having no real-time visibility into whether their application is under review, shortlisted, or scheduled for an interview.
- **Missed Opportunities:** No automated matching or notification mechanism alerting candidates when roles aligning with their technical skill stack become available.

### 1.2 The JobNexa Solution
**JobNexa** is an end-to-end recruitment ecosystem that centralizes all three key stakeholders—**Students**, **Recruiters**, and **Placement Administrators**—into a unified, responsive platform.

Key highlights include:
1. **Mathematical Skill Matching Algorithm:** Computes an objective match score between student competencies and job specifications.
2. **Persistent Cloud Resume Management:** Encrypted cloud storage via Cloudinary and MongoDB metadata tracking for PDF/DOCX resumes.
3. **Real-Time Job Alerts & Notifications:** In-app event-driven alert triggers that automatically notify candidates when matching positions are published.
4. **Interactive Lifecycle Tracking:** An application progress tracker taking candidates through Applied $\rightarrow$ Shortlisted $\rightarrow$ Interview Scheduled $\rightarrow$ Selected/Rejected states.
5. **Decoupled Architecture:** Strict physical separation between the React frontend client and the Node.js/Express backend server.

---

## 2. System Architecture & Modularity

JobNexa implements the **Client-Server Architecture** following the **Model-View-Controller (MVC)** architectural design pattern in the backend.

```
                           +----------------------------+
                           |  React.js Frontend Client  |
                           | (Vite + Tailwind + Router) |
                           +--------------+-------------+
                                          |
                              REST APIs / JSON Payloads
                              (Axios with JWT Bearer)
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                            JobNexa Express.js Backend                             |
|                                                                                   |
|  +---------------------+   +---------------------+   +-------------------------+  |
|  |  Security & Auth    |   |     Controllers     |   |    Algorithm & Utils    |  |
|  |  (Helmet/CORS/JWT)  |-->|  (Auth, Jobs, Apps) |-->|   (Job Match Engine)    |  |
|  +---------------------+   +----------+----------+   +-------------------------+  |
|                                       |                                           |
|                                       v                                           |
|                            +---------------------+                                |
|                            |   Mongoose Models   |                                |
|                            |  (Schemas, Indexes) |                                |
|                            +----------+----------+                                |
+---------------------------------------|-------------------------------------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
    +-------------------------+                   +-------------------------+
    |   MongoDB Atlas Cloud   |                   | Cloudinary File Storage |
    |  (Database Collections) |                   |  (Encrypted Resumes)    |
    +-------------------------+                   +-------------------------+
```

---

## 3. Technology Stack Breakdown

### Frontend:
- **React.js 18:** Component-based UI rendering with virtual DOM diffing for high responsiveness.
- **Vite:** High-performance frontend toolchain offering instant Hot Module Replacement (HMR).
- **React Router DOM v6:** Declarative, nested client-side routing with route guards (`ProtectedRoute`).
- **Tailwind CSS:** Utility-first responsive CSS styling with dark mode and light mode theming.
- **Lucide React:** Modern, accessible iconography.
- **Axios:** Promise-based HTTP client with request and response interceptors for automatic Bearer token injection.
- **Recharts:** Composable SVG charting library for administrator and recruiter dashboard visual analytics.

### Backend:
- **Node.js:** Event-driven, asynchronous JavaScript runtime built on Chrome's V8 engine.
- **Express.js:** Fast, unopinionated, minimalist web framework for building RESTful APIs.
- **JWT (JSON Web Tokens):** Stateless token-based user authentication.
- **bcryptjs:** Salted one-way cryptographic hashing for passwords.
- **Multer:** Multipart/form-data handler configured with in-memory buffer streaming.
- **Cloudinary SDK:** Cloud-native persistent binary object storage for resumes.
- **Helmet:** HTTP response header security hardening.
- **Express Rate Limit:** Brute-force and DoS mitigation on `/api` routes.

### Database:
- **MongoDB Atlas:** Fully-managed multi-cloud document database.
- **Mongoose:** Object Data Modeling (ODM) providing typed schemas, validation, middleware pre-hooks, and compound indexing.

---

## 4. Database Schema Design (10 Collections)

| Collection | Key Fields | Purpose |
| :--- | :--- | :--- |
| **Users** | `name`, `email` (unique index), `password` (hashed), `role`, `status`, `isApproved` | Core identity & role-based authentication |
| **StudentProfiles** | `user` (ref), `college`, `degree`, `branch`, `skills` (indexed array), `profileCompletion` | Academic background & technical skills |
| **RecruiterProfiles**| `user` (ref), `companyName`, `designation`, `companyWebsite`, `phone` | Corporate hiring manager verification |
| **Companies** | `name`, `logo`, `website`, `recruiter` (ref) | Registered corporate entities |
| **Jobs** | `title`, `companyName`, `requiredSkills` (indexed array), `location`, `salaryRange`, `jobType`, `experienceLevel`, `vacancies`, `deadline`, `applicantCount` | Job vacancy postings with skill requirements |
| **Applications** | `job` (ref), `student` (ref), `resume` (ref), `coverLetter`, `status`, `interview` | Job application state machine with unique compound index `{ job: 1, student: 1 }` |
| **Resumes** | `student` (ref), `originalName`, `fileUrl`, `publicId`, `fileType`, `fileSize`, `isDefault` | Resume metadata linked to persistent cloud binary |
| **Notifications** | `user` (ref), `title`, `message`, `type`, `link`, `isRead` | In-app alerts and real-time candidate updates |
| **SavedJobs** | `user` (ref), `job` (ref) | Candidate bookmarks with compound unique index |
| **JobAlerts** | `user` (ref), `preferredSkills`, `preferredLocations`, `jobType`, `isActive` | User alert matching criteria for automated trigger |

---

## 5. Algorithmic Skill-Matching Engine

The core matching algorithm is implemented in `backend/utils/calculateJobMatch.js`.

### 5.1 Mathematical Formulation:
$$\text{Match Percentage} = \left( \frac{\text{Number of Matching Required Skills}}{\text{Total Required Skills}} \right) \times 100$$

### 5.2 Algorithmic Steps:
1. **Normalization:** Skill strings are scrubbed of whitespace, punctuation, hyphens, and converted to lowercase (e.g., `"Node.js"` $\rightarrow$ `"nodejs"` and `"React-JS"` $\rightarrow$ `"reactjs"`).
2. **Lookup Efficiency:** Candidate skills are loaded into a `Set` data structure for $O(1)$ amortized membership verification.
3. **Set Intersection:** Every required skill in the job posting is checked against the candidate's skill set.
4. **Classification:** Skills are classified into `matchingSkills` and `missingSkills`.
5. **Output Generation:** The algorithm outputs the integer percentage score, which is rendered as color-coded badges (Green $\ge 70\%$, Amber $\ge 40\%$, Slate $< 40\%$).

---

## 6. Authentication & Security Architecture

1. **Password Encryption:** Plaintext passwords are never stored. A 10-round bcrypt salt is generated, hashing the password before database persistence.
2. **Stateless JWTs:** Upon authentication, a signed JWT containing `{ id, role }` is returned and stored in the client's `localStorage`.
3. **Route Protection (`protect` middleware):** Every private route extracts the token from the `Authorization: Bearer <token>` header, verifies the signature against `JWT_SECRET`, checks if the user is suspended, and attaches `req.user`.
4. **Role-Based Access Control (`authorizeRoles` middleware):** Ensures that students cannot access recruiter actions (such as posting jobs or viewing candidate resumes of other applicants), and recruiters cannot access administrative moderation features.
5. **Duplicate Application Prevention:** A compound unique index on `{ job: 1, student: 1 }` in MongoDB ensures at the database engine level that no student can submit duplicate entries for the same vacancy.
6. **Strict Mongoose Schema Validation:** Incoming payloads are filtered against allowed schema attributes.

---

## 7. Cloud Deployment on Render

- **Frontend:** Deployed as a **Render Static Site** connected to the `frontend/` directory, built via `npm install && npm run build`, publishing `dist/` with rewrite rules routing `/*` $\rightarrow$ `/index.html` to eliminate 404s on browser reloads.
- **Backend:** Deployed as a **Render Web Service** connected to the `backend/` directory, using `npm install` and `npm start` listening dynamically on `process.env.PORT`.
- **Database:** Hosted on **MongoDB Atlas** with IP Access List configured to allow cloud traffic.
- **Resume Storage:** Hosted on **Cloudinary**, ensuring permanent file persistence that survives container rebuilds.
