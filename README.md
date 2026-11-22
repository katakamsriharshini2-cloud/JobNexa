# 💼 JOBNEXA – Connect. Apply. Achieve.
### Full-Stack Job Alert and Resume Portal
**Academic Project for Web Technologies and Mobile Programming**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Render](https://img.shields.io/badge/Deployment-Render-46E3B7?logo=render)](https://render.com)
[![Cloudinary](https://img.shields.io/badge/Resume%20Storage-Cloudinary-3448C5?logo=cloudinary)](https://cloudinary.com)

---

## 🌟 Introduction & Project Overview

**JobNexa** is a modern, responsive, and secure full-stack recruitment portal that connects **Students/Job Seekers**, **Corporate Recruiters**, and **Placement Administrators** through one centralized platform.

Designed specifically to meet the rigorous criteria of undergraduate university capstone evaluations, JobNexa features:
- **Strict Full-Stack Separation:** Completely independent `frontend/` (React + Vite) and `backend/` (Node.js + Express) codebases.
- **Skill-Based Matching Algorithm:** A mathematical algorithm calculating real-time candidate compatibility scores against job requirements.
- **Persistent Cloud Resume Management:** Direct upload of PDF/DOCX resumes to Cloudinary cloud storage with metadata tracking in MongoDB.
- **In-App Job Alerts & Notifications:** Automated notification triggers whenever a newly posted job matches a student's preferences.
- **Complete Recruitment Pipeline:** Seamless tracking from application submission to shortlisting, video interview scheduling, and final decision.
- **Dual Deployment on Render:** React frontend deployed as a Render Static Site and Node.js backend deployed as a Render Web Service.

---

## 🚀 Quick Demo Credentials (For College Professor Evaluation)

You can instantly log in to any role using the pre-configured accounts:

| Portal | Role | Demo Email | Demo Password | Key Features to Demonstrate |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Candidate | `student@jobnexa.dev` | `Student@123` | Skill match scores, resume upload, job applications, saved jobs, alerts |
| **Recruiter** | Employer | `recruiter@jobnexa.dev` | `Recruiter@123` | Post vacancies, review applicants, download resumes, schedule interviews |
| **Admin** | System Admin | `admin@jobnexa.dev` | `Admin@123` | Platform analytics, user account moderation, job posting moderation |

*(Clicking the **"Quick Demo Credentials"** buttons on the Login page automatically pre-fills these inputs).*

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v6, Tailwind CSS, Recharts, Lucide React, Axios |
| **Backend** | Node.js, Express.js, RESTful APIs, MVC Architecture |
| **Database** | MongoDB Atlas, Mongoose ODM (10 distinct collections, compound unique indexes) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing (Salt: 10 rounds) |
| **Cloud Storage** | Cloudinary persistent cloud storage for PDF/DOCX resumes |
| **Deployment** | Render Static Site (Frontend) & Render Web Service (Backend) |
| **Security** | Helmet HTTP headers, CORS whitelisting, Express Rate Limit, Input sanitization |

---

## 📁 Project Directory Structure

```
JobNexa/
│
├── frontend/                     # React.js Single Page Application
│   ├── public/                   # Static assets & JobNexa SVG logo
│   ├── src/
│   │   ├── components/           # Reusable UI components (Navbar, JobCard, SearchBar, etc.)
│   │   ├── context/              # Context API (AuthContext, ThemeContext, NotificationContext)
│   │   ├── layouts/              # Role-specific dashboard layouts (Student, Recruiter, Admin)
│   │   ├── pages/                # Public and protected portal pages
│   │   ├── services/             # Axios API integration modules
│   │   ├── App.jsx               # Client-side routes & guards
│   │   ├── main.jsx              # Application entry point
│   │   └── index.css             # Tailwind base & custom styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                      # Node.js & Express REST API Server
│   ├── config/                   # MongoDB Atlas & Cloudinary connections
│   ├── controllers/              # Business logic controllers (Auth, Jobs, Apps, Resumes)
│   ├── middleware/               # Auth, Role (RBAC), Upload (Multer), and Error handlers
│   ├── models/                   # 10 Mongoose schemas (User, Job, Application, Resume, etc.)
│   ├── routes/                   # Modular Express API routes
│   ├── scripts/                  # Initial admin and demo seed script (createAdmin.js)
│   ├── utils/                    # Job match algorithm & JWT generator
│   ├── server.js                 # Express server entry point
│   ├── package.json
│   └── .env.example
│
├── render.yaml                   # Root Render Blueprint configuration
├── PROJECT_EXPLANATION.md        # Comprehensive architecture & logic explanation
├── VIVA_QUESTIONS.md             # 45 beginner-friendly viva questions & answers
├── API_DOCUMENTATION.md          # REST API endpoints, schemas & payloads
├── DEPLOYMENT_GUIDE.md           # Step-by-step Render and Atlas deployment guide
├── PROJECT_REPORT.md             # Full academic project report for college submission
└── .gitignore
```

---

## 💻 Local Execution Guide (VS Code)

### Prerequisites:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **VS Code**

### Step 1: Open Project in VS Code
Open the `JOB PORTAL` folder in VS Code.

### Step 2: Open Two Separate Terminals
In VS Code, press ``Ctrl + ` `` to open the terminal. Click the **+** or **Split** icon to create two separate terminals.

---

### Terminal 1: Backend Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies (only required first time)
npm install

# (Optional) Seed the database with Admin and Demo accounts
npm run seed:admin

# Start backend server in development mode
npm run dev
```

* Backend will run at: `http://localhost:5000`
* Health check endpoint: `http://localhost:5000/api/health`

---

### Terminal 2: Frontend Client

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (only required first time)
npm install

# Start Vite React development server
npm run dev
```

* Frontend will run at: `http://localhost:5173`
* Open `http://localhost:5173` in your browser.

---

## 🌐 Deploying to Render (Mandatory College Requirement)

Complete, foolproof instructions are documented in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

### Summary:
1. **Push to GitHub:**
   ```bash
   git init && git add . && git commit -m "feat: complete JobNexa portal"
   git remote add origin https://github.com/YOUR_USERNAME/JobNexa.git
   git push -u origin main
   ```
2. **Backend on Render:**
   - Create **Render Web Service** connected to `backend/`.
   - Set Build Command: `npm install`, Start Command: `npm start`.
   - Configure Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `CLOUDINARY_*`).
3. **Frontend on Render:**
   - Create **Render Static Site** connected to `frontend/`.
   - Set Build Command: `npm install && npm run build`, Publish Directory: `dist`.
   - Set Environment Variable: `VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com/api`.
   - Add Rewrite rule: Source `/*` $\rightarrow$ Destination `/index.html`.

---

## 📚 Academic Documentation Deliverables

This repository contains comprehensive documentation files designed for university viva and project report submission:
- **[PROJECT_EXPLANATION.md](PROJECT_EXPLANATION.md):** In-depth technical breakdown of the architecture, algorithms, and modules.
- **[VIVA_QUESTIONS.md](VIVA_QUESTIONS.md):** 45 questions with clear answers covering React, Node, Express, MongoDB, JWT, and Cloud storage.
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md):** Complete REST API contract with request/response schemas.
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md):** Step-by-step cloud deployment instructions.
- **[PROJECT_REPORT.md](PROJECT_REPORT.md):** Academic report complete with abstract, objectives, architecture, test cases, and conclusions.

---

## 📄 License
This project is open-source and developed for the academic course **Web Technologies and Mobile Programming**.
