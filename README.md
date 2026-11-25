# 💼 JobNexa – Full-Stack Recruitment & Cloud Job Portal

> **Connect. Apply. Achieve.**  
> A full-stack, enterprise-grade cloud recruitment platform connecting **Students / Job Seekers**, **Corporate Recruiters**, and **Administrators**.

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Cloudinary](https://img.shields.io/badge/Cloud%20Storage-Cloudinary-3448C5?logo=cloudinary)](https://cloudinary.com)
[![Vercel](https://img.shields.io/badge/Frontend%20Hosting-Vercel-000000?logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend%20Hosting-Render-46E3B7?logo=render)](https://render.com)

---

## 🏗️ System Architecture & Separation

JobNexa is built with strict separation of concerns into independent frontend and backend services:

```text
JobNexa/
├── frontend/                     # React 18 SPA (Vite, TailwindCSS, Axios)
│   ├── src/
│   │   ├── components/           # Reusable UI components (JobCard, SearchBar, Navbar, Modals)
│   │   ├── context/              # Global Auth & Theme context
│   │   ├── pages/                # FindJobs, Dashboards, ResumeUpload, Register, Login
│   │   └── services/             # Centralized API service callers (auth, jobs, resumes, applications)
│   ├── public/                   # Static assets & favicons
│   ├── package.json              # Frontend scripts & dependencies
│   ├── vite.config.js            # Vite build configuration
│   ├── vercel.json               # Vercel SPA routing & rewrites configuration
│   └── .env.example              # Frontend environment variable template
│
├── backend/                      # Node.js + Express.js REST API
│   ├── config/                   # MongoDB Atlas & Cloudinary SDK configurations
│   ├── controllers/              # Business logic (auth, jobs, resumes, applications, students)
│   ├── middleware/               # Auth protection (JWT), role validation, multer upload filters
│   ├── models/                   # Mongoose schemas (User, StudentProfile, RecruiterProfile, Job, Application, Resume)
│   ├── routes/                   # Express REST route handlers
│   ├── services/                 # Curated Indian jobs & background sync engine
│   ├── utils/                    # Deduplication, token generation, match algorithm
│   ├── package.json              # Backend dependencies & npm scripts
│   ├── render.yaml               # Render Infrastructure-as-Code blueprint
│   ├── server.js                 # Express application entrypoint
│   └── .env.example              # Backend environment variable template
│
├── .gitignore                    # Root git exclusion rules (credentials, node_modules)
└── README.md                     # Comprehensive documentation
```

---

## ⚡ Core Features

1. **Cloud Resume & Profile Management (Cloudinary):**
   - Direct cloud storage of candidate resumes (PDF, DOCX) and profile pictures (JPG, PNG, WebP).
   - In-browser document preview, replacement, and secure download.
   - Authorized access control: candidate resumes are private and only viewable by authorized recruiters who received an application.
2. **Indian Tech Hub Job Search & Filtering:**
   - Case-insensitive, multi-field regex search across title, skills, company, category, and description.
   - Filter chips for major Indian tech hubs: **Hyderabad, Warangal, Bengaluru, Chennai, Mumbai, Pune, Delhi NCR, and Remote**.
   - Filters for Job Type (Full-time, Part-time, Internship, Remote) and Experience Level.
   - Instant "Clear Filters" reset without stale state bugs.
3. **Authentication & Multi-Role Authorization:**
   - Real user registration and login flows with email validation, bcrypt password hashing (10 salt rounds), and JWT sessions.
   - Student registration includes full name, real email, phone, college/university, and technical skills.
   - Recruiter registration includes recruiter name, company name, official email, and phone.
   - Built-in "Forgot Password" token generation and reset workflow.
   - Pre-configured demo buttons remain available as optional helpers for quick evaluations.
4. **Interactive Dashboards:**
   - **Student Dashboard:** Active resume card, skills widget, profile completion dial, job recommendations, and applied jobs with live status badges (`Applied`, `Shortlisted`, `Interview Scheduled`, `Selected`, `Rejected`).
   - **Recruiter Dashboard:** Post vacancies, edit/delete listings, review applicants, download resumes, and update application status.
   - **Admin Dashboard:** Platform metrics, account moderation (suspend/activate), and job moderation.

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
```env
# MongoDB Atlas Database URI
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/jobnexa?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=jobnexa_super_secure_jwt_secret_token_2026
JWT_EXPIRE=7d

# Cloudinary Storage Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend Allowed Origin (Production Vercel URL or Localhost)
FRONTEND_URL=https://your-jobnexa-frontend.vercel.app

# Optional Initial Admin Seed — set a strong password in your Render/environment dashboard
ADMIN_NAME=JobNexa Administrator
ADMIN_EMAIL=admin@jobnexa.dev
ADMIN_PASSWORD=<set-a-strong-password-in-your-environment>

# Server Port & Mode
PORT=5000
NODE_ENV=production
```

### Frontend (`frontend/.env`)
```env
# Backend REST API endpoint (points to Render in production, localhost in development)
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com/api
```

---

## 💻 Local Development Setup

### 1. Clone & Install Dependencies
Open two terminals in VS Code:

**Terminal 1 (Backend):**
```powershell
cd "backend"
npm install
npm run dev
```
*Backend runs on:* `http://localhost:5000`  
*Health Check:* `http://localhost:5000/api/health`

**Terminal 2 (Frontend):**
```powershell
cd "frontend"
npm install
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 🚀 Cloud Deployment Guide

### A. GitHub Setup & Push
1. Create a new repository on your GitHub account (e.g. `JobNexa`).
2. Run in project root:
   ```powershell
   git remote add origin https://github.com/<your-username>/JobNexa.git
   git branch -M main
   git push -u origin main
   ```

### B. MongoDB Atlas Cloud Database Setup
1. Log in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free shared cluster (M0).
3. Under **Database Access**, create a database user (e.g., `jobnexa_admin`) with a secure password.
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere (`0.0.0.0/0`)** so Render can connect.
5. Click **Connect** &rarr; **Drivers** &rarr; Copy the connection string.
6. Replace `<password>` with your database user password and specify the database name as `/jobnexa`.

### C. Cloudinary Setup (Resumes & Profile Pictures)
1. Sign up for a free account at [Cloudinary](https://cloudinary.com).
2. On your Cloudinary Dashboard, copy:
   - **Cloud Name** (`CLOUDINARY_CLOUD_NAME`)
   - **API Key** (`CLOUDINARY_API_KEY`)
   - **API Secret** (`CLOUDINARY_API_SECRET`)
3. Add these to your Render environment variables.

### D. Backend Deployment on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) &rarr; **New +** &rarr; **Web Service**.
2. Connect your GitHub repository `JobNexa`.
3. Configure the service settings:
   - **Name:** `jobnexa-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Under **Environment Variables**, add:
   - `MONGO_URI`: *(Your MongoDB Atlas connection string)*
   - `JWT_SECRET`: *(A secure secret key)*
   - `CLOUDINARY_CLOUD_NAME`: *(Your Cloudinary cloud name)*
   - `CLOUDINARY_API_KEY`: *(Your Cloudinary API key)*
   - `CLOUDINARY_API_SECRET`: *(Your Cloudinary API secret)*
   - `FRONTEND_URL`: *(Your Vercel frontend URL, e.g. `https://jobnexa.vercel.app`)*
   - `NODE_ENV`: `production`
5. Click **Create Web Service**. Once deployed, copy your backend URL (e.g. `https://jobnexa-backend.onrender.com`).

### E. Frontend Deployment on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) &rarr; **Add New...** &rarr; **Project**.
2. Import your GitHub repository `JobNexa`.
3. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit &rarr; select `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://jobnexa-backend.onrender.com/api` *(your Render backend URL with `/api`)*
5. Click **Deploy**. Vercel will build the frontend with `dist/` and automatic SPA routing configured via `vercel.json`.

---

## 🧪 Comprehensive Verification Checklist

| Test Scenario | Status | Verified Behavior |
|---|---|---|
| **Health Check** | Verified | `GET /api/health` returns status `OK` with database state and uptime |
| **Student Registration** | Verified | Registers with real email, phone, college, and skills; hashes password with bcrypt |
| **Recruiter Registration** | Verified | Registers with company name, recruiter name, official email, and phone |
| **Admin Login** | Verified | Secure admin authentication with platform analytics |
| **Resume Upload (Cloudinary)** | Verified | PDF & DOCX validation (max 5MB), uploaded to cloud, preview & download supported |
| **Resume Replacement** | Verified | Swaps existing file, deletes previous document, updates student profile score (+15%) |
| **Job Filtering & Search** | Verified | Case-insensitive multi-field search + Indian tech hub city pills without empty state bugs |
| **Job Application** | Verified | Attaches default uploaded resume, notifies recruiter, updates applicant table |
| **Recruiter Access** | Verified | Recruiter reviews applicants, opens authorized candidate resume, updates status |
| **Vercel SPA Rewrites** | Verified | `vercel.json` rewrites ensure page refreshes never return 404 on deep links |
