# JobNexa – REST API Documentation
**Base URL:** `/api`  
**Authentication Scheme:** Bearer Token (`Authorization: Bearer <JWT>`)

---

## 1. Authentication Endpoints

### 1.1 Register Account
* **URL:** `/api/auth/register`
* **Method:** `POST`
* **Access:** Public
* **Description:** Creates a new candidate or recruiter account.
* **Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "Password@123",
  "role": "student"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "674033f2a893c52e893e1101",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "role": "student"
  }
}
```
* **Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "An account with this email address is already registered."
}
```

---

### 1.2 User Login
* **URL:** `/api/auth/login`
* **Method:** `POST`
* **Access:** Public
* **Description:** Verifies credentials and generates a signed JWT.
* **Request Body:**
```json
{
  "email": "student@jobnexa.dev",
  "password": "<your-password>"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "674033f2a893c52e893e1101",
    "name": "Rahul Sharma",
    "email": "student@jobnexa.dev",
    "role": "student"
  }
}
```

---

### 1.3 Get Current User Session
* **URL:** `/api/auth/me`
* **Method:** `GET`
* **Access:** Private (Authenticated)
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "674033f2a893c52e893e1101",
    "name": "Rahul Sharma",
    "email": "student@jobnexa.dev",
    "role": "student"
  }
}
```

---

## 2. Student Endpoints

### 2.1 Get Student Profile
* **URL:** `/api/students/profile`
* **Method:** `GET`
* **Access:** Private (`student`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "fullName": "Rahul Sharma",
    "phone": "+91 98765 22222",
    "college": "National Institute of Technology",
    "degree": "B.Tech",
    "branch": "Computer Science",
    "graduationYear": "2026",
    "skills": ["React", "JavaScript", "Node.js", "MongoDB", "Python"],
    "profileCompletion": 85
  },
  "profileCompletion": 85
}
```

---

### 2.2 Update Student Profile
* **URL:** `/api/students/profile`
* **Method:** `PUT`
* **Access:** Private (`student`)
* **Request Body:**
```json
{
  "college": "National Institute of Technology",
  "degree": "B.Tech",
  "branch": "Computer Science & Engineering",
  "graduationYear": "2026",
  "skills": ["React", "JavaScript", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
  "linkedinUrl": "https://linkedin.com/in/rahulsharma",
  "githubUrl": "https://github.com/rahulsharma"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": { ... },
  "profileCompletion": 90
}
```

---

## 3. Job Endpoints

### 3.1 Get All Jobs (Search & Filter)
* **URL:** `/api/jobs?keyword=React&location=Bangalore&jobType=Full-time&page=1&limit=9`
* **Method:** `GET`
* **Access:** Public
* **Query Parameters:** `keyword`, `location`, `jobType`, `experienceLevel`, `sortBy`, `page`, `limit`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "674034f1a893c52e893e2202",
      "title": "Associate Full-Stack Engineer",
      "companyName": "NexaTech Global Labs",
      "location": "Bangalore, India",
      "jobType": "Full-time",
      "salaryRange": "₹8 - 12 LPA",
      "requiredSkills": ["React", "Node.js", "Express", "MongoDB"],
      "vacancies": 3,
      "createdAt": "2026-11-22T08:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

---

### 3.2 Get Single Job by ID (With Skill Match Details)
* **URL:** `/api/jobs/:id`
* **Method:** `GET`
* **Access:** Public / Optional Auth
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "674034f1a893c52e893e2202",
    "title": "Associate Full-Stack Engineer",
    "companyName": "NexaTech Global Labs",
    "description": "Full stack engineer openings...",
    "requiredSkills": ["React", "Node.js", "Express", "MongoDB", "JavaScript"],
    "hasApplied": false,
    "matchDetails": {
      "matchPercentage": 80,
      "matchingSkills": ["React", "Node.js", "MongoDB", "JavaScript"],
      "missingSkills": ["Express"]
    }
  },
  "hasApplied": false
}
```

---

### 3.3 Get Skill-Based Recommended Jobs
* **URL:** `/api/jobs/recommended`
* **Method:** `GET`
* **Access:** Private (`student`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "674034f1a893c52e893e2202",
      "title": "Associate Full-Stack Engineer",
      "matchPercentage": 90,
      "matchingSkills": ["React", "Node.js", "MongoDB", "JavaScript"],
      "missingSkills": ["Docker"]
    }
  ]
}
```

---

### 3.4 Post a New Job
* **URL:** `/api/jobs`
* **Method:** `POST`
* **Access:** Private (`recruiter`)
* **Request Body:**
```json
{
  "title": "Associate Full-Stack Developer",
  "companyName": "NexaTech Global Labs",
  "description": "Responsibilities include designing React components and Express endpoints.",
  "requiredSkills": ["React", "Node.js", "Express", "MongoDB"],
  "location": "Bangalore",
  "salaryRange": "₹7 - 10 LPA",
  "jobType": "Full-time",
  "experienceLevel": "Fresher / Entry-Level",
  "vacancies": 2,
  "deadline": "2026-12-31"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Job vacancy published successfully.",
  "data": { ... }
}
```

---

## 4. Application Endpoints

### 4.1 Apply for Job
* **URL:** `/api/applications`
* **Method:** `POST`
* **Access:** Private (`student`)
* **Request Body:**
```json
{
  "jobId": "674034f1a893c52e893e2202",
  "resumeId": "674035a1a893c52e893e3303",
  "coverLetter": "Excited to apply with strong full-stack skills."
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Application submitted successfully.",
  "data": { ... }
}
```
* **Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "You have already submitted an application for this position."
}
```

---

### 4.2 Update Application Status
* **URL:** `/api/applications/:id/status`
* **Method:** `PUT`
* **Access:** Private (`recruiter`, `admin`)
* **Request Body:**
```json
{
  "status": "Shortlisted"
}
```

---

### 4.3 Schedule Interview
* **URL:** `/api/applications/:id/interview`
* **Method:** `PUT`
* **Access:** Private (`recruiter`, `admin`)
* **Request Body:**
```json
{
  "date": "2026-11-28",
  "time": "11:00 AM IST",
  "link": "https://meet.google.com/xyz-abc-def",
  "notes": "Technical coding round covering React hooks and Node.js REST APIs."
}
```

---

## 5. Resume Endpoints

### 5.1 Upload Resume
* **URL:** `/api/resumes/upload`
* **Method:** `POST`
* **Access:** Private (`student`)
* **Content-Type:** `multipart/form-data`
* **Form Field:** `resume` (PDF or DOCX file, $\le 5\text{MB}$)
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Resume uploaded successfully.",
  "data": {
    "_id": "674035a1a893c52e893e3303",
    "originalName": "Rahul_Sharma_Resume.pdf",
    "fileUrl": "https://res.cloudinary.com/.../Rahul_Sharma_Resume.pdf",
    "fileType": "pdf",
    "fileSize": 412030,
    "isDefault": true
  }
}
```

---

## 6. Health Check Endpoint

### 6.1 Server Health & Status
* **URL:** `/api/health`
* **Method:** `GET`
* **Access:** Public
* **Success Response (200 OK):**
```json
{
  "status": "OK",
  "application": "JobNexa – Connect. Apply. Achieve.",
  "version": "1.0.0",
  "timestamp": "2026-11-22T09:20:00.000Z",
  "uptimeSeconds": 124,
  "database": "Connected",
  "environment": "production"
}
```
