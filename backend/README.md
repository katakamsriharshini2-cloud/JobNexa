# JobNexa – Real-Time Job Alert and Resume Portal Backend

> **Tagline:** Connect. Apply. Achieve.  
> **Course:** Web Technologies and Mobile Programming (B.Tech Capstone Academic Project)

---

## 1. System Overview

JobNexa Backend is an enterprise-grade, asynchronous RESTful API service built on Node.js, Express.js, MongoDB Atlas (Mongoose), and Cloudinary. It integrates **real-time job feeds from global and Indian recruitment APIs (Arbeitnow, Remotive, Adzuna, Jooble)**, automatically synchronizes and deduplicates listings via scheduled `node-cron` background tasks, and provides intelligent skill-matching recommendations for university students.

---

## 2. Technology Stack

* **Runtime:** Node.js (ES Modules, modern async/await)
* **Framework:** Express.js
* **Database:** MongoDB Atlas (Cloud) / Local MongoDB fallback with Mongoose ORM
* **Authentication:** JSON Web Tokens (JWT) & bcrypt password hashing
* **File Storage:** Cloudinary Persistent Cloud Storage (with local disk fallback in `uploads/`)
* **Scheduled Tasks:** `node-cron` (automated recurring multi-source sync)
* **HTTP Client:** Axios with timeout and rate-limit safeguards
* **Security:** Helmet (HTTP headers), CORS origin validation, Express Rate Limiting

---

## 3. Directory Architecture

```
backend/
├── config/
│   ├── db.js                     # MongoDB connection with retry logic
│   └── cloudinary.js             # Cloudinary SDK config & memoryStream upload
├── controllers/
│   ├── authController.js         # Register, Login, Me verification
│   ├── studentController.js      # Student profile & completion scoring
│   ├── recruiterController.js    # Recruiter dashboard metrics & company profile
│   ├── jobController.js          # CRUD jobs, search regex, skill matching
│   ├── applicationController.js  # Candidate application & interview scheduling
│   ├── resumeController.js       # Resume upload, default selection & delete
│   ├── notificationController.js # Real-time user notifications
│   ├── savedJobController.js     # Job bookmarks
│   ├── jobAlertController.js     # Student alert criteria preferences
│   └── adminController.js        # Admin metrics, user moderation & manual sync
├── models/
│   ├── User.js                   # Auth credentials & roles (student/recruiter/admin)
│   ├── StudentProfile.js         # Education, technical skills & completion %
│   ├── RecruiterProfile.js       # Company name, designation, website
│   ├── Company.js                # Enterprise details & branding
│   ├── Job.js                    # Jobs schema with real-time API fields & indexes
│   ├── Application.js            # Job applications & interview timestamps
│   ├── Resume.js                 # Cloudinary references & PDF/DOCX metadata
│   ├── SavedJob.js               # User job bookmarks (unique compound index)
│   ├── JobAlert.js               # Desired skills & locations for alerts
│   └── Notification.js           # In-app alerts and application status changes
├── routes/
│   ├── authRoutes.js             # /api/auth
│   ├── studentRoutes.js          # /api/students
│   ├── recruiterRoutes.js        # /api/recruiter
│   ├── jobRoutes.js              # /api/jobs
│   ├── applicationRoutes.js      # /api/applications
│   ├── resumeRoutes.js           # /api/resumes
│   ├── notificationRoutes.js     # /api/notifications
│   ├── savedJobRoutes.js         # /api/saved-jobs
│   ├── jobAlertRoutes.js         # /api/job-alerts
│   └── adminRoutes.js            # /api/admin
├── middleware/
│   ├── authMiddleware.js         # JWT verification (protect)
│   ├── roleMiddleware.js         # Role-Based Access Control (authorizeRoles)
│   ├── uploadMiddleware.js       # Multer 5MB PDF/DOCX memory storage
│   └── errorMiddleware.js        # Centralized HTTP error handler
├── services/
│   ├── arbeitnowService.js       # Live EU & Global tech feed parser
│   ├── remotiveService.js        # Live remote developer listings parser
│   ├── adzunaService.js          # Indian tech hub API integration (Hyderabad, etc.)
│   ├── joobleService.js          # Jooble job feed provider
│   └── jobSyncService.js         # Multi-source parallel sync & MongoDB bulkWrite
├── utils/
│   ├── calculateJobMatch.js      # Skill matching percentage algorithm
│   ├── deduplicateJobs.js        # Fingerprinting, HTML strip & location normalize
│   └── generateToken.js          # JWT signing utility
├── jobs/
│   └── syncCron.js               # Recurring node-cron engine
├── uploads/                      # Temporary local storage fallback
├── scripts/
│   └── createAdmin.js            # Database seeding script (Admin, Recruiter, Student)
├── server.js                     # Main Express server entry point
├── package.json                  # Dependencies & scripts
├── .env.example                  # Environment template
└── README.md                     # Backend guide
```

---

## 4. Setup & Running in VS Code

### Step 1: Open Terminal in VS Code
Open VS Code in the project root and navigate to the backend folder:
```powershell
cd backend
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Ensure your MongoDB URI is set. For local MongoDB:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/jobnexa
```
Or for MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jobnexa?retryWrites=true&w=majority
```

### Step 4: Seed Initial Accounts
Populate pre-configured demonstration accounts and verified jobs:
```powershell
npm run seed:admin
```
**Demo Credentials:**
* **Admin:** `admin@jobnexa.dev` / `Admin@123`
* **Recruiter:** `recruiter@jobnexa.dev` / `Recruiter@123`
* **Student:** `student@jobnexa.dev` / `Student@123`

### Step 5: Start Backend Server
Development Mode (with auto-reload):
```powershell
npm run dev
```
Production Mode:
```powershell
npm start
```

Backend URL: `http://localhost:5000`  
Health Check: `http://localhost:5000/api/health`

---

## 5. Background Job Synchronization Engine

1. **Automatic Startup Sync:** The server runs a lightweight sync 4 seconds after boot to fetch fresh opportunities from Arbeitnow and Remotive.
2. **Recurring Cron:** Runs every 6 hours (`0 */6 * * *`) automatically fetching, standardizing, and deduplicating jobs.
3. **Manual Admin Trigger:** An admin can trigger sync on demand via `POST /api/admin/sync-jobs`.
4. **Targeted Indian Cities:** Hyderabad, Warangal, Bengaluru, Chennai, Mumbai, and Delhi NCR.
5. **Deduplication:** Jobs are fingerprinted using compound unique indexes `{ source: 1, externalId: 1 }` to prevent duplicates.
