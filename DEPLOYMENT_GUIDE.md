# JobNexa – Step-by-Step Render & Cloud Deployment Guide
**Tagline:** Connect. Apply. Achieve.  
**Platform Architecture:** Render Static Site (Frontend) + Render Web Service (Backend) + MongoDB Atlas + Cloudinary

---

## 1. Prerequisites Checklist

Before beginning deployment, ensure you have active accounts on:
1. **GitHub:** [https://github.com](https://github.com) (Source Code Repository)
2. **Render:** [https://render.com](https://render.com) (Hosting both Frontend & Backend)
3. **MongoDB Atlas:** [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) (Managed Cloud Database)
4. **Cloudinary:** [https://cloudinary.com](https://cloudinary.com) (Persistent Cloud Resume Storage)

---

## 2. Step 1: Git & GitHub Repository Preparation

Open your terminal in the JobNexa root folder (`JOB PORTAL/`):

```bash
# 1. Initialize Git repository
git init

# 2. Stage all source code and documentation
git add .

# 3. Create your initial commit
git commit -m "feat: complete JobNexa recruitment and resume portal"

# 4. Create main branch
git branch -M main

# 5. Link your GitHub remote repository (replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/JobNexa.git

# 6. Push to GitHub
git push -u origin main
```

> [!IMPORTANT]
> The root `.gitignore` guarantees that `.env` files, `node_modules`, and local resumes are never committed to GitHub.

---

## 3. Step 2: MongoDB Atlas Database Setup

1. **Log in** to [MongoDB Atlas](https://cloud.mongodb.com).
2. **Create a Free Cluster:** Select the **M0 Shared Free Tier** in your nearest cloud region (e.g., AWS Mumbai / ap-south-1).
3. **Create Database User:**
   - Navigate to **Security $\rightarrow$ Database Access**.
   - Click **Add New Database User**.
   - Choose **Password Authentication**.
   - Enter a username (e.g., `jobnexa_user`) and a secure password.
   - Assign the **Built-in Role:** `Read and write to any database`.
4. **Configure Network Access (Whitelisting):**
   - Navigate to **Security $\rightarrow$ Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`). *(Render instances use dynamic IP pools).*
5. **Obtain Connection String:**
   - In **Database Deployments**, click **Connect $\rightarrow$ Drivers (Node.js)**.
   - Copy your connection string:
     ```
     mongodb+srv://jobnexa_user:<password>@cluster0.xxxxx.mongodb.net/jobnexa?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user's password and ensure `/jobnexa` is specified as the database name.

---

## 4. Step 3: Cloudinary Setup (Persistent Resume Storage)

1. **Log in** to your [Cloudinary Dashboard](https://cloudinary.com/console).
2. On your Dashboard homepage, locate your **Product Environment Credentials**:
   - **Cloud Name** (e.g., `dyxxxxxxx`)
   - **API Key** (e.g., `824817294719284`)
   - **API Secret** (e.g., `kLx99xxxxxxxxxxxxxx`)
3. Keep these three keys ready to paste into Render backend environment variables.

---

## 5. Step 4: Backend Deployment (Render Web Service)

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New + $\rightarrow$ Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `JobNexa` repository.
4. Configure service parameters:
   - **Name:** `jobnexa-backend`
   - **Region:** Nearest region (e.g., Singapore or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan Type:** `Free`
5. **Configure Environment Variables (in "Environment" tab):**

| Key | Value / Instructions |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` *(or Render automatic)* |
| `MONGODB_URI` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | A secure random 32+ character string |
| `CLIENT_URL` | Temporarily `http://localhost:5173` (we will update this once frontend is deployed) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API Secret |

6. Click **Create Web Service**.
7. Render will install dependencies and start the server.
8. Once deployed, Render will provide your public backend URL (e.g., `https://jobnexa-backend.onrender.com`).
9. **Verify Backend Health:** Open `https://jobnexa-backend.onrender.com/api/health` in your browser. You should receive:
   ```json
   {
     "status": "OK",
     "application": "JobNexa – Connect. Apply. Achieve.",
     "database": "Connected"
   }
   ```

---

## 6. Step 5: Frontend Deployment (Render Static Site)

1. In Render Dashboard, click **New + $\rightarrow$ Static Site**.
2. Select your `JobNexa` GitHub repository.
3. Configure the Static Site parameters:
   - **Name:** `jobnexa-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. **Configure Frontend Environment Variable:**
   - Under **Environment Variables**, add:
     - **Key:** `VITE_API_BASE_URL`
     - **Value:** `https://jobnexa-backend.onrender.com/api` *(Use your exact backend Render URL)*
5. **Configure Rewrite Rules (Critical for Single Page Apps):**
   - In your static site settings, click **Redirects/Rewrites**.
   - Add rule:
     - **Type:** `Rewrite`
     - **Source:** `/*`
     - **Destination:** `/index.html`
   - *(This ensures refreshing `/jobs`, `/student/dashboard`, or other nested routes does not trigger 404 errors).*
6. Click **Create Static Site**.
7. Once built, Render will assign your live website URL (e.g., `https://jobnexa-frontend.onrender.com`).

---

## 7. Step 6: Frontend-Backend Integration Handshake

1. Return to your **jobnexa-backend** Web Service on Render.
2. In the **Environment** tab, update `CLIENT_URL` to match your deployed frontend:
   - `CLIENT_URL = https://jobnexa-frontend.onrender.com`
3. Click **Save Changes**. Render will automatically redeploy the backend with the updated CORS policy.

---

## 8. Step 7: Live Website Verification Checklist

Perform these tests on your deployed live URL:
- [ ] **Home Page:** Verify branding, hero search, stats, and theme toggling (Dark/Light).
- [ ] **Registration:** Register a new student account (`rahul@example.com`).
- [ ] **Profile Completion:** Add technical skills (React, Node.js, MongoDB) and verify completion percentage updates.
- [ ] **Resume Upload:** Upload a PDF resume and confirm it saves to Cloudinary.
- [ ] **Recruiter Login:** Register or sign in as recruiter and post a vacancy.
- [ ] **Job Application:** Apply for the job from the student dashboard and verify no duplicates can be submitted.
- [ ] **Interview Scheduling:** Log in as recruiter and schedule an interview. Verify the in-app notification appears on the student's notification bell!

---

## 9. Render Blueprint Option (`render.yaml`)

JobNexa includes a root `render.yaml` blueprint. If using Render Blueprints:
1. In Render, select **New + $\rightarrow$ Blueprint**.
2. Select the repository.
3. Render automatically provisions the Static Site and Web Service simultaneously, prompting you only for secret keys (`MONGODB_URI`, `CLOUDINARY_*`).

---

## 10. Troubleshooting & Common Pitfalls

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **Backend sleeps after inactivity** | Render Free Tier spins down containers after 15 min of idle time. | The first request will take 30-50s to wake up the server. This is normal on the free tier. |
| **CORS Error in Browser Console** | `CLIENT_URL` in backend does not match frontend origin. | Update `CLIENT_URL` in Render backend settings to match `https://jobnexa-frontend.onrender.com` exactly (no trailing slash). |
| **404 on page reload** | Missing rewrite rule on Render Static Site. | Add Rewrite rule in Render: Source `/*` $\rightarrow$ Destination `/index.html`. |
| **Resume upload fails with 500** | Missing Cloudinary environment variables. | Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are configured. |
