import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorMiddleware.js';
import ensureDbConnected from './middleware/dbCheckMiddleware.js';
import { initJobSyncCron } from './jobs/syncCron.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import savedJobRoutes from './routes/savedJobRoutes.js';
import jobAlertRoutes from './routes/jobAlertRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

// Initialize Express app
const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration supporting dynamic client origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps or curl/Postman requests)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Allow all origins for academic flexibility on Render
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// HEALTH CHECK ENDPOINTS (REGISTERED BEFORE RATE LIMITER & 404)
// Supported on /api/health, /health, and root /
// ============================================================
const healthCheckHandler = (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const dbStatus = isConnected
    ? 'Connected'
    : mongoose.connection.readyState === 2
    ? 'Connecting'
    : 'Disconnected';

  const responsePayload = {
    status: isConnected ? 'OK' : 'ERROR',
    application: 'JobNexa - Connect. Apply. Achieve.',
    version: '1.0.0',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(isConnected ? 200 : 503).json(responsePayload);
};

// Mount health check on multiple common routes to avoid 404s
app.get('/api/health', healthCheckHandler);
app.get('/health', healthCheckHandler);
app.get('/', healthCheckHandler);

// Root API Welcome endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to JobNexa REST API. Connect. Apply. Achieve.',
    health: '/api/health',
  });
});

// Rate limiting (150 requests per 15 minutes) - placed AFTER health check
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests dispatched from this IP, please try again in 15 minutes.',
  },
});
app.use('/api', limiter);

// Serve local uploads folder statically for resume fallback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routes (Routes requiring database use ensureDbConnected to prevent buffering timeout)
app.use('/api/auth', ensureDbConnected, authRoutes);
app.use('/api/students', ensureDbConnected, studentRoutes);
app.use('/api/recruiter', ensureDbConnected, recruiterRoutes);
app.use('/api/jobs', jobRoutes); // Has built-in resilient fallback if DB is connecting
app.use('/api/applications', ensureDbConnected, applicationRoutes);
app.use('/api/resumes', ensureDbConnected, resumeRoutes);
app.use('/api/notifications', ensureDbConnected, notificationRoutes);
app.use('/api/saved-jobs', ensureDbConnected, savedJobRoutes);
app.use('/api/job-alerts', ensureDbConnected, jobAlertRoutes);
app.use('/api/admin', ensureDbConnected, adminRoutes);
app.use('/api/feedback', ensureDbConnected, feedbackRoutes);

// Catch-all 404 handler (returns JSON error)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' does not exist on JobNexa server.`,
    availableEndpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      jobs: '/api/jobs',
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Connect Database & Start Server
const PORT = process.env.PORT || 5000;

const startServer = (portToUse) => {
  app
    .listen(portToUse, () => {
      console.log(`====================================================`);
      console.log(`🚀 JOBNEXA BACKEND RUNNING ON PORT: ${portToUse}`);
      console.log(`📡 Health Check: http://localhost:${portToUse}/api/health`);
      console.log(`🌐 Environment:  ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);

      // Initialize real-time job synchronization cron engine
      initJobSyncCron();
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = Number(portToUse) + 1;
        console.warn(`[JobNexa Port Warning] Port ${portToUse} is occupied. Switching to ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('[JobNexa Server Error]:', err.message);
      }
    });
};

const isDirectRun =
  !process.env.NO_AUTO_START &&
  (!process.argv[1] ||
    process.argv[1].endsWith('server.js') ||
    process.argv[1].endsWith('server') ||
    process.argv[1].includes('server.js'));

if (isDirectRun) {
  connectDB()
    .then(() => {
      startServer(PORT);
    })
    .catch((err) => {
      console.error('[JobNexa Critical Error] Could not connect to MongoDB Atlas:', err.message);
      if (process.env.NODE_ENV === 'production') {
        console.warn('Backend server starting in recovery mode so health checks and diagnostics remain available.');
      }
      startServer(PORT);
    });
}

export default app;
