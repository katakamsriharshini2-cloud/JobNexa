import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB, { getRawMongoUri } from '../config/db.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import generateToken from '../utils/generateToken.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config();

const results = [];

function recordTest(name, passed, details = '') {
  results.push({ name, passed, details });
  const badge = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${badge}: ${name} ${details ? '(' + details + ')' : ''}`);
}

async function runAuthSuite() {
  console.log('====================================================');
  console.log('JobNexa Comprehensive Authentication Test Suite');
  console.log('====================================================');

  try {
    // Test 1: MongoDB Atlas Connection
    console.log('\n--- 1. Database Connection & Health Verification ---');
    const rawUri = getRawMongoUri();
    recordTest('Environment URI detected', Boolean(rawUri), `URI Scheme: ${rawUri ? rawUri.split('://')[0] : 'None'}`);

    const conn = await connectDB();
    const isConnected = mongoose.connection.readyState === 1;
    recordTest('MongoDB Atlas Connection', isConnected, `Host: ${conn.connection.host}, DB: ${conn.connection.name}`);

    // Health payload verification
    const healthPayload = {
      status: isConnected ? 'OK' : 'ERROR',
      application: 'JobNexa - Connect. Apply. Achieve.',
      version: '1.0.0',
      database: isConnected ? 'Connected' : 'Disconnected',
      environment: process.env.NODE_ENV || 'development',
    };
    recordTest(
      'Health Check Payload Match',
      healthPayload.status === 'OK' && healthPayload.database === 'Connected',
      `Database status: ${healthPayload.database}`
    );

    // Test 2: Data Preservation Check
    console.log('\n--- 2. Data Preservation Check ---');
    const jobCount = await Job.countDocuments();
    recordTest('Existing Jobs Preserved', jobCount >= 123, `Found ${jobCount} jobs intact`);

    // Test 3: Admin Account (admin@ecosphere.org) Verification
    console.log('\n--- 3. Admin (admin@ecosphere.org) Verification ---');
    const adminUser = await User.findOne({ email: 'admin@ecosphere.org' }).select('+password');
    recordTest('Admin Account Exists in Database', Boolean(adminUser), `User ID: ${adminUser?._id}`);
    recordTest('Admin Role is Correct', adminUser?.role === 'admin', `Role: ${adminUser?.role}`);
    recordTest('Admin Account is Active & Approved', adminUser?.status === 'active' && adminUser?.isApproved === true);

    const adminPassword = process.env.ADMIN_PASSWORD || 'Ecosphere@Admin2026!';
    const adminPassMatch = await adminUser.matchPassword(adminPassword);
    recordTest('Admin Password Match (bcrypt)', adminPassMatch);

    const adminWrongMatch = await adminUser.matchPassword('WrongPassword123!');
    recordTest('Admin Invalid Password Rejected', !adminWrongMatch);

    // Test 4: Demo Recruiter Verification
    console.log('\n--- 4. Recruiter Verification ---');
    const recruiterUser = await User.findOne({ email: 'recruiter@jobnexa.dev' }).select('+password');
    recordTest('Recruiter Account Exists', Boolean(recruiterUser), `ID: ${recruiterUser?._id}`);
    recordTest('Recruiter Role is Correct', recruiterUser?.role === 'recruiter', `Role: ${recruiterUser?.role}`);
    const recruiterPassMatch = await recruiterUser.matchPassword('Recruiter@123');
    recordTest('Recruiter Password Match (bcrypt)', recruiterPassMatch);

    // Test 5: Demo Student Verification
    console.log('\n--- 5. Student Verification ---');
    const studentUser = await User.findOne({ email: 'student@jobnexa.dev' }).select('+password');
    recordTest('Student Account Exists', Boolean(studentUser), `ID: ${studentUser?._id}`);
    recordTest('Student Role is Correct', studentUser?.role === 'student', `Role: ${studentUser?.role}`);
    const studentPassMatch = await studentUser.matchPassword('Student@123');
    recordTest('Student Password Match (bcrypt)', studentPassMatch);

    // Test 6: JWT Token Generation & Verification
    console.log('\n--- 6. JWT Generation & Verification ---');
    const jwtSecret = process.env.JWT_SECRET || 'jobnexa_development_jwt_secret_key_2026';
    const adminToken = generateToken(adminUser._id, adminUser.role);
    recordTest('JWT Generated for Admin', Boolean(adminToken));

    const decoded = jwt.verify(adminToken, jwtSecret);
    recordTest('JWT Decoded Successfully', decoded.id === adminUser._id.toString() && decoded.role === 'admin', `Role in token: ${decoded.role}`);

    // Test 7: Role Authorization Middleware Logic
    console.log('\n--- 7. Authorization Middleware Logic ---');
    const reqMock = { user: { role: 'admin' } };
    let authPassed = false;
    const adminAuthMiddleware = authorize('admin');
    adminAuthMiddleware(reqMock, {}, (err) => {
      if (!err) authPassed = true;
    });
    recordTest('Admin Middleware Authorization Pass', authPassed);

    let recruiterBlocked = false;
    const recruiterOnlyMiddleware = authorize('recruiter');
    const resMock = {
      status: (code) => ({
        json: (data) => {
          if (code === 403) recruiterBlocked = true;
        },
      }),
    };
    recruiterOnlyMiddleware(reqMock, resMock, () => {});
    recordTest('Role Isolation (Admin blocked on recruiter-only route)', recruiterBlocked);

    console.log('\n====================================================');
    console.log('SUMMARY REPORT');
    console.log('====================================================');
    const allPassed = results.every((r) => r.passed);
    console.log(`Total Tests Run: ${results.length}`);
    console.log(`Passed: ${results.filter((r) => r.passed).length}`);
    console.log(`Failed: ${results.filter((r) => !r.passed).length}`);
    console.log(`Status: ${allPassed ? 'ALL SYSTEMS OPERATIONAL ✅' : 'SOME TESTS FAILED ❌'}`);
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('Test Suite Failed with unexpected error:', error);
    process.exit(1);
  }
}

runAuthSuite();
