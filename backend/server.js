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

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Rate limiting (150 requests per 15 minutes)
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

// ============================================================
// HEALTH CHECK ENDPOINT (MANDATORY REQUIREMENT FOR RENDER)
// ============================================================
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected / Connecting';
  res.status(200).json({
    status: 'OK',
    application: 'JobNexa – Connect. Apply. Achieve.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root API Welcome
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to JobNexa REST API. Connect. Apply. Achieve.',
    docs: '/api/health',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/job-alerts', jobAlertRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Not Found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' does not exist on JobNexa server.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Connect Database & Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const startServer = (portToUse) => {
    const serverInstance = app
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
          console.warn(`[JobNexa Port Warning] Port ${portToUse} is currently occupied or reserved. Switching automatically to port ${nextPort}...`);
          startServer(nextPort);
        } else {
          console.error('[JobNexa Server Error]:', err.message);
        }
      });
  };

  startServer(PORT);
});

export default app;
