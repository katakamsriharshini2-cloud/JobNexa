# JobNexa – Real-Time Backend Architecture & Viva Technical Explanation

> **Subject:** Web Technologies and Mobile Programming  
> **Degree:** B.Tech Computer Science & Engineering  
> **Project Name:** JobNexa – Job Alert and Resume Portal  
> **Tagline:** Connect. Apply. Achieve.

---

## 1. System Architecture & Design Philosophy

JobNexa is built using an asynchronous 3-tier architecture:
1. **Client Tier:** React.js Single Page Application (SPA) styled with Tailwind CSS, consuming REST APIs via Axios with JWT interceptors.
2. **Server Tier:** Node.js runtime with Express.js micro-framework executing non-blocking I/O event loops.
3. **Data Tier:** MongoDB Atlas cloud document database managed by Mongoose ODM with specialized schema indexes and text search weights.

```
[ React.js Frontend (Vite) ]
           │ (HTTP/REST + JWT)
           ▼
[ Express.js Server (Port 5000) ]
   ├── Middleware: Helmet, CORS, RateLimit, Auth, RBAC, Multer
   ├── Scheduled Cron: Node-Cron (Every 6 hrs sync)
   ├── Sync Engine: Parallel API Collectors (Arbeitnow, Remotive, Adzuna, Jooble)
   └── Services: Deduplication, HTML Strip, Skill Extraction
           │
           ├──▶ [ MongoDB Atlas ] (10 Collections, Compound Indexes)
           └──▶ [ Cloudinary ] (Raw PDF/DOCX Storage via MemoryStream)
```

---

## 2. Real-Time External Job Aggregation Engine

### Why Real External Job Integration?
Traditional college demo projects rely on static or mock hardcoded data. JobNexa integrates live employment data pipelines to deliver production relevance.

### Data Aggregation Pipeline:
1. **Multi-Source Ingestion:** When triggered by either the scheduled `node-cron` or an administrator endpoint, `jobSyncService.js` executes `Promise.allSettled()` across 4 service modules:
   * **Arbeitnow API:** Fetches 300+ live European and global software engineering postings without requiring API key authorization.
   * **Remotive API:** Pulls high-paying worldwide remote software roles with real salary ranges and job types.
   * **Adzuna API:** Pulls specialized developer vacancies in major Indian technology hubs (**Hyderabad, Warangal, Bengaluru, Chennai, Mumbai**).
   * **Jooble API:** Pulls enterprise IT listings across India.
2. **Data Normalization:** Each API returns varying JSON formats. Our parser standardizes fields:
   * `stripHtml()` clears arbitrary HTML markup and entities (`&nbsp;`, `&amp;`).
   * `extractSkills()` scans the title and description against a technical dictionary (50+ technologies like React, Node.js, Python, AWS, Docker).
   * `normalizeLocation()` maps geographic labels to Indian cities and sets the `isRemote` boolean.
   * `categorizeJobTitle()` assigns roles to 6 standardized categories (`Software Engineering`, `Frontend & UI/UX`, `Data & AI / ML`, `Cloud & DevOps`, `Cybersecurity`, `Product & Tech Sales`).
3. **Deduplication:** A fingerprint string `${source}:${externalId}` or `${title}:${company}` removes duplicates in memory.
4. **Optimized Database Upsert:** We use `Job.bulkWrite()` with `updateOne` + `upsert: true`. Existing jobs are updated with fresh timestamps; new jobs are inserted in a single non-blocking MongoDB transaction.
5. **Auto-Purge Expired Listings:** Entries with `isExternal: true` older than 60 days are automatically pruned to prevent database bloat.

---

## 3. Skill-Matching & Recommendation Algorithm

The matching algorithm is implemented in `backend/utils/calculateJobMatch.js`:

$$\text{Match Percentage} = \left(\frac{|\text{Candidate Skills} \cap \text{Job Required Skills}|}{|\text{Job Required Skills}|}\right) \times 100$$

### Algorithmic Execution Steps:
1. Candidate skills are normalized using `normalizeSkill()` (lowercasing, removing whitespace, dots, and hyphens so `Node.js` matches `nodejs`).
2. An $O(1)$ Hash Set of normalized candidate skills is created.
3. The job's `requiredSkills` array is iterated over. Each matching skill is recorded in `matchingSkills`; unmatched skills are collected in `missingSkills`.
4. The calculated percentage is returned to the frontend where it renders visually as green ($\ge 70\%$), amber ($40\text{--}69\%$), or gray ($< 40\%$).
5. The `/api/jobs/recommended` endpoint applies this algorithm across active jobs and sorts results in descending order of compatibility.

---

## 4. Security & Cryptographic Defenses

1. **Password Hashing:** Passwords are never stored in plaintext. They are salted with 10 rounds using `bcrypt.genSalt(10)` and hashed before saving via Mongoose `pre('save')` hooks.
2. **Stateless JWT Authorization:** On login, `jsonwebtoken` creates a signed token with `{ id, role }` and an expiration period (`7d`). Each protected route validates the token with `authMiddleware.js`.
3. **Role-Based Access Control (RBAC):** `roleMiddleware.js` verifies if the authenticated user's role exists in the permitted roles array (`authorizeRoles('recruiter', 'admin')`).
4. **Helmet Security Headers:** Prevents Clickjacking (`X-Frame-Options`), MIME-sniffing (`X-Content-Type-Options`), and Cross-Site Scripting (XSS).
5. **Rate Limiting:** Protects `/api` endpoints against brute-force attacks and Denial of Service (DoS) by restricting users to 150 requests per 15-minute window.
6. **Input Sanitization & Unique Constraints:** MongoDB compound unique indexes prevent duplicate applications and bookmark records.

---

## 5. College Viva Questions & Answers for Backend

### Q1: Why did you choose Node.js and Express for the backend?
**Answer:** Node.js uses an event-driven, single-threaded non-blocking I/O model based on the V8 engine, making it exceptionally fast for I/O-intensive web applications. Express.js provides a minimalist, unopinionated routing and middleware architecture that allows us to build RESTful APIs with fine-grained control over error handling and authentication.

### Q2: How does JobNexa fetch external jobs without blocking the main event loop?
**Answer:** We use asynchronous JavaScript with `Promise.allSettled()` in `jobSyncService.js`. When fetching jobs from Arbeitnow and Remotive, the HTTP requests are delegated to Node.js's underlying libuv thread pool. The main thread remains responsive to user requests while external data is downloaded and parsed.

### Q3: How do you prevent duplicate job entries in MongoDB?
**Answer:** At the database level, we established a compound unique index on `{ source: 1, externalId: 1 }` with `sparse: true`. In the application layer, `deduplicateJobBatch()` creates a deterministic fingerprint hash to eliminate duplicate items before writing to MongoDB. We also use `Job.bulkWrite()` with `upsert: true` so existing records are updated rather than duplicated.

### Q4: How is resume storage implemented?
**Answer:** Resumes are accepted via `multer.memoryStorage()`, limiting uploads to PDF/DOCX files under 5MB. In production, the file buffer is streamed directly to Cloudinary's raw storage via `upload_stream()`. In local development without Cloudinary credentials, the backend falls back to saving files in the `uploads/` directory served statically.

### Q5: What is the purpose of the `/api/health` endpoint?
**Answer:** Cloud platforms like Render require a health check endpoint to verify that the containerized web service is healthy and connected to the database before routing traffic to it. Our `/api/health` endpoint inspects `mongoose.connection.readyState` and returns uptime, database connection state, and version.
