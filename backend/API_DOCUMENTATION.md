# JobNexa – Complete Backend API Documentation

**Application:** JobNexa – Job Alert and Resume Portal  
**Base URL:** `http://localhost:5000/api` (or deployed URL on Render: `https://jobnexa-backend.onrender.com/api`)  
**Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication APIs (`/api/auth`)

### 1.1 Register User
* **Method:** `POST`
* **Route:** `/api/auth/register`
* **Access:** Public
* **Request Body:**
```json
{
  "name": "Sriharshini Kata",
  "email": "student@jobnexa.dev",
  "password": "Student@123",
  "role": "student"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "674052f588aa4b23d0a1b001",
    "name": "Sriharshini Kata",
    "email": "student@jobnexa.dev",
    "role": "student"
  }
}
```

### 1.2 Login User
* **Method:** `POST`
* **Route:** `/api/auth/login`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "student@jobnexa.dev",
  "password": "Student@123"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "674052f588aa4b23d0a1b001",
    "name": "Sriharshini Kata",
    "email": "student@jobnexa.dev",
    "role": "student"
  }
}
```

### 1.3 Get Current User Session
* **Method:** `GET`
* **Route:** `/api/auth/me`
* **Access:** Private (`student`, `recruiter`, `admin`)

---

## 2. Jobs APIs (`/api/jobs`)

### 2.1 Get Public Jobs (Search, Filter, Pagination)
* **Method:** `GET`
* **Route:** `/api/jobs`
* **Query Parameters:**
  * `keyword` (string): Title, category, skill or company search
  * `location` (string): E.g. "Hyderabad", "Bengaluru", "Remote"
  * `city` (string): E.g. "Warangal", "Mumbai"
  * `jobType` (string): "Full-time", "Part-time", "Internship", "Remote"
  * `experienceLevel` (string): "Fresher / Entry-Level", "1-3 Years", etc.
  * `source` (string): "internal", "arbeitnow", "remotive", "adzuna", "jooble", "external"
  * `page` (number, default: 1)
  * `limit` (number, default: 10)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6740552b88aa4b23d0a1b120",
      "title": "Software Development Engineer (SDE-1)",
      "companyName": "NexaTech Global Labs",
      "category": "Software Engineering",
      "requiredSkills": ["React", "JavaScript", "Node.js", "MongoDB"],
      "location": "Bangalore, India (Hybrid)",
      "city": "Bengaluru",
      "isRemote": false,
      "isExternal": false,
      "source": "internal",
      "salaryRange": "₹8 - 14 LPA",
      "jobType": "Full-time",
      "experienceLevel": "Fresher / Entry-Level"
    }
  ],
  "total": 52,
  "page": 1,
  "pages": 6
}
```

### 2.2 Get Single Job by ID (With Skill Match & Application Status)
* **Method:** `GET`
* **Route:** `/api/jobs/:id`
* **Access:** Public (Enriched if authenticated student)

### 2.3 Get Recommended Jobs (Skill-Matching Algorithm)
* **Method:** `GET`
* **Route:** `/api/jobs/recommended`
* **Access:** Private (`student`)
* **Response:** Returns top matching jobs sorted by `matchPercentage` descending.

### 2.4 Create Job Posting
* **Method:** `POST`
* **Route:** `/api/jobs`
* **Access:** Private (`recruiter`)

### 2.5 Update Job Posting
* **Method:** `PUT`
* **Route:** `/api/jobs/:id`
* **Access:** Private (`recruiter`, `admin`)

### 2.6 Delete Job Posting
* **Method:** `DELETE`
* **Route:** `/api/jobs/:id`
* **Access:** Private (`recruiter`, `admin`)

---

## 3. Student & Resume APIs

### 3.1 Get Profile
* **Method:** `GET`
* **Route:** `/api/students/profile`
* **Access:** Private (`student`)

### 3.2 Update Profile
* **Method:** `PUT`
* **Route:** `/api/students/profile`
* **Access:** Private (`student`)
* **Request Body:**
```json
{
  "fullName": "Sriharshini Kata",
  "phone": "+91 98765 43210",
  "college": "National Institute of Technology",
  "degree": "B.Tech",
  "branch": "Computer Science and Engineering",
  "graduationYear": "2026",
  "skills": ["React", "JavaScript", "Node.js", "Express", "MongoDB", "Python"]
}
```

### 3.3 Upload Resume (PDF / DOCX $\le$ 5MB)
* **Method:** `POST`
* **Route:** `/api/resumes/upload`
* **Access:** Private (`student`)
* **Content-Type:** `multipart/form-data`
* **Field:** `resume`

### 3.4 Get Resumes
* **Method:** `GET`
* **Route:** `/api/resumes`
* **Access:** Private (`student`)

### 3.5 Delete Resume
* **Method:** `DELETE`
* **Route:** `/api/resumes/:id`
* **Access:** Private (`student`)

---

## 4. Job Applications & Interviews (`/api/applications`)

### 4.1 Apply for Job
* **Method:** `POST`
* **Route:** `/api/applications`
* **Access:** Private (`student`)
* **Request Body:**
```json
{
  "jobId": "6740552b88aa4b23d0a1b120",
  "resumeId": "6740562e88aa4b23d0a1b220",
  "coverLetter": "Excited to apply for the SDE-1 position at NexaTech."
}
```

### 4.2 Get Student Applications
* **Method:** `GET`
* **Route:** `/api/applications/my-applications`
* **Access:** Private (`student`)

### 4.3 Get Applicants for Job
* **Method:** `GET`
* **Route:** `/api/applications/job/:jobId`
* **Access:** Private (`recruiter`, `admin`)

### 4.4 Update Application Status
* **Method:** `PUT`
* **Route:** `/api/applications/:id/status`
* **Access:** Private (`recruiter`, `admin`)
* **Request Body:**
```json
{
  "status": "Shortlisted"
}
```

### 4.5 Schedule Interview
* **Method:** `PUT`
* **Route:** `/api/applications/:id/interview`
* **Access:** Private (`recruiter`, `admin`)
* **Request Body:**
```json
{
  "date": "2026-11-28",
  "time": "11:00 AM IST",
  "link": "https://meet.google.com/xyz-abc-def",
  "notes": "Technical coding assessment on React and Node.js REST APIs."
}
```

---

## 5. Saved Jobs & Job Alerts

### 5.1 Bookmark Job
* **Method:** `POST`
* **Route:** `/api/saved-jobs`
* **Body:** `{ "jobId": "<id>" }`

### 5.2 Get Bookmarked Jobs
* **Method:** `GET`
* **Route:** `/api/saved-jobs`

### 5.3 Set Job Alert Preferences
* **Method:** `POST`
* **Route:** `/api/job-alerts`
* **Body:**
```json
{
  "preferredSkills": ["React", "Node.js"],
  "preferredLocations": "Hyderabad",
  "jobType": "Full-time",
  "isActive": true
}
```

---

## 6. Real-Time Job Sync & Admin APIs (`/api/admin`)

### 6.1 Trigger Manual Real-Time Job Sync
* **Method:** `POST`
* **Route:** `/api/admin/sync-jobs`
* **Access:** Private (`admin`)
* **Request Body:**
```json
{
  "limitPerSource": 50
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Job synchronization completed.",
  "data": {
    "sourceStats": {
      "arbeitnow": 30,
      "remotive": 16,
      "adzuna": 0,
      "jooble": 0
    },
    "totalRawFetched": 46,
    "uniqueProcessed": 46,
    "newJobsInserted": 5,
    "existingJobsUpdated": 41,
    "totalActiveJobsInDatabase": 52,
    "timeTakenMs": 627,
    "timestamp": "2026-11-22T10:15:37.104Z"
  }
}
```

### 6.2 Get Real-Time Sync Status
* **Method:** `GET`
* **Route:** `/api/admin/sync-status`
* **Access:** Private (`admin`)
* **Response:**
```json
{
  "success": true,
  "data": {
    "totalJobs": 52,
    "externalJobs": 46,
    "internalJobs": 6,
    "sourceBreakdown": {
      "internal": 6,
      "arbeitnow": 30,
      "remotive": 16
    },
    "syncSchedule": "0 */6 * * *"
  }
}
```

### 6.3 System Health Check (Render Deployment Monitor)
* **Method:** `GET`
* **Route:** `/api/health`
* **Access:** Public
* **Response (200 OK):**
```json
{
  "status": "OK",
  "application": "JobNexa – Connect. Apply. Achieve.",
  "version": "1.0.0",
  "timestamp": "2026-11-22T10:15:00.000Z",
  "uptimeSeconds": 1450,
  "database": "Connected",
  "environment": "development"
}
```
