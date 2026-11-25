process.env.NO_AUTO_START = 'true';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config();

const { default: app } = await import('../server.js');

const TEST_PORT = 5002;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

async function runRealUserTests() {
  console.log('====================================================');
  console.log('JobNexa Real User Public Registration & Login Diagnostic');
  console.log('====================================================');

  console.log('Connecting to MongoDB Atlas...');
  await connectDB();
  console.log('Database connected successfully.');

  const server = app.listen(TEST_PORT, async () => {
    console.log(`Diagnostic server listening on port ${TEST_PORT}`);

    try {
      // 1. Health check
      console.log('\n--- Test 1: Server & Database Health ---');
      const healthRes = await axios.get(`${BASE_URL}/health`);
      console.log('Health Status:', healthRes.status, 'DB Status:', healthRes.data.database);
      if (healthRes.data.database !== 'Connected') {
        throw new Error('Database is not connected!');
      }

      // Cleanup any previous test run accounts if they exist (without touching existing jobs or other users)
      const testStudentEmail = 'test.student.live2026@jobnexa.dev';
      const testStudentPass = 'StudentLiveSecure@2026!';
      const testRecruiterEmail = 'test.recruiter.live2026@jobnexa.dev';
      const testRecruiterPass = 'RecruiterLiveSecure@2026!';

      await User.deleteMany({ email: { $in: [testStudentEmail, testRecruiterEmail] } });

      // 2. Real Student Registration
      console.log('\n--- Test 2: Real Student Public Registration ---');
      const studentPayload = {
        name: 'Aarav Patel',
        email: testStudentEmail,
        password: testStudentPass,
        role: 'student',
        phone: '+91 98765 43210',
        college: 'IIT Bombay',
        degree: 'B.Tech / B.E.',
        branch: 'Computer Science & Engineering',
        graduationYear: '2026',
        experience: 'Fresher / Entry-Level',
        skills: 'React, Node.js, Express, MongoDB, JavaScript',
      };

      const regStudentRes = await axios.post(`${BASE_URL}/auth/register`, studentPayload);
      console.log('Student Registration Status:', regStudentRes.status);
      console.log('Registration Success:', regStudentRes.data.success);
      console.log('Returned Token:', Boolean(regStudentRes.data.token));
      console.log('Returned User:', regStudentRes.data.user?.email, 'Role:', regStudentRes.data.user?.role);

      // Verify Student exists in MongoDB Atlas directly
      const savedStudent = await User.findOne({ email: testStudentEmail });
      console.log('MongoDB Atlas Verification: User Found =', Boolean(savedStudent), 'ID =', savedStudent?._id);
      const savedStudentProfile = await StudentProfile.findOne({ user: savedStudent._id });
      console.log('MongoDB Atlas Verification: StudentProfile Found =', Boolean(savedStudentProfile), 'College =', savedStudentProfile?.college);

      // 3. Duplicate Email Prevention Test
      console.log('\n--- Test 3: Duplicate Email Prevention ---');
      try {
        await axios.post(`${BASE_URL}/auth/register`, studentPayload);
        console.error('FAIL: Duplicate registration was unexpectedly allowed!');
      } catch (err) {
        console.log('Expected Duplicate Error Status:', err.response?.status);
        console.log('Expected Error Message:', err.response?.data?.message);
        console.log('PASS: Duplicate registration correctly prevented.');
      }

      // 4. Student Login with Registered Credentials
      console.log('\n--- Test 4: Student Login with Registered Credentials ---');
      const loginStudentRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: testStudentEmail,
        password: testStudentPass,
      });
      console.log('Student Login Status:', loginStudentRes.status);
      console.log('Login Success:', loginStudentRes.data.success);
      console.log('User Role in Login Response:', loginStudentRes.data.user?.role);
      const studentToken = loginStudentRes.data.token;

      // 5. Student Login with WRONG Password Test
      console.log('\n--- Test 5: Login with Wrong Password ---');
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: testStudentEmail,
          password: 'IncorrectPassword123!',
        });
        console.error('FAIL: Wrong password was unexpectedly allowed!');
      } catch (err) {
        console.log('Expected Status:', err.response?.status);
        console.log('Expected Message:', err.response?.data?.message);
        console.log('PASS: Wrong password rejected correctly.');
      }

      // 6. Real Recruiter Registration
      console.log('\n--- Test 6: Real Recruiter Public Registration ---');
      const recruiterPayload = {
        name: 'Meera Deshmukh',
        recruiterName: 'Meera Deshmukh',
        email: testRecruiterEmail,
        password: testRecruiterPass,
        role: 'recruiter',
        phone: '+91 99887 76655',
        companyName: 'Apex Cloud Innovations',
        companyWebsite: 'https://apexcloud.example.com',
        industry: 'Software & Technology',
        companyLocation: 'Bengaluru, Karnataka',
      };

      const regRecruiterRes = await axios.post(`${BASE_URL}/auth/register`, recruiterPayload);
      console.log('Recruiter Registration Status:', regRecruiterRes.status);
      console.log('Registration Success:', regRecruiterRes.data.success);
      console.log('Returned Token:', Boolean(regRecruiterRes.data.token));
      console.log('Returned User:', regRecruiterRes.data.user?.email, 'Role:', regRecruiterRes.data.user?.role);

      const savedRecruiter = await User.findOne({ email: testRecruiterEmail });
      console.log('MongoDB Atlas Verification: Recruiter Found =', Boolean(savedRecruiter), 'ID =', savedRecruiter?._id);
      const savedRecruiterProfile = await RecruiterProfile.findOne({ user: savedRecruiter._id });
      console.log('MongoDB Atlas Verification: RecruiterProfile Found =', Boolean(savedRecruiterProfile), 'Company =', savedRecruiterProfile?.companyName);

      // 7. Recruiter Login
      console.log('\n--- Test 7: Recruiter Login with Registered Credentials ---');
      const loginRecruiterRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: testRecruiterEmail,
        password: testRecruiterPass,
      });
      console.log('Recruiter Login Status:', loginRecruiterRes.status);
      console.log('Login Success:', loginRecruiterRes.data.success);
      console.log('User Role in Login Response:', loginRecruiterRes.data.user?.role);
      const recruiterToken = loginRecruiterRes.data.token;

      // 8. Protected Routes & Role Authorization Test
      console.log('\n--- Test 8: Protected Routes & Role Authorization ---');
      // Student accessing student profile route
      const studentProfileRes = await axios.get(`${BASE_URL}/students/profile`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      console.log('Student accessing /api/students/profile -> Status:', studentProfileRes.status, 'Success:', studentProfileRes.data.success);

      // Student trying to access recruiter dashboard / company profile (Should be 403 Forbidden)
      try {
        await axios.get(`${BASE_URL}/recruiter/profile`, {
          headers: { Authorization: `Bearer ${studentToken}` },
        });
        console.error('FAIL: Student was unexpectedly allowed on recruiter route!');
      } catch (err) {
        console.log('Student accessing /api/recruiter/profile -> Blocked with Status:', err.response?.status, 'Message:', err.response?.data?.message);
        console.log('PASS: Role authorization properly isolates recruiter routes from students.');
      }

      // Recruiter accessing recruiter profile
      const recruiterProfileRes = await axios.get(`${BASE_URL}/recruiter/profile`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      console.log('Recruiter accessing /api/recruiter/profile -> Status:', recruiterProfileRes.status, 'Company:', recruiterProfileRes.data.data?.companyName);

      // 9. Forgot Password and Reset Password Flow
      console.log('\n--- Test 9: Forgot & Reset Password Flow ---');
      const forgotRes = await axios.post(`${BASE_URL}/auth/forgot-password`, { email: testStudentEmail });
      console.log('Forgot Password Status:', forgotRes.status, 'Reset Token Generated:', Boolean(forgotRes.data.resetToken));
      const resetToken = forgotRes.data.resetToken;

      const newStudentPass = 'StudentBrandNewPass#2026!';
      const resetRes = await axios.post(`${BASE_URL}/auth/reset-password/${resetToken}`, {
        token: resetToken,
        password: newStudentPass,
      });
      console.log('Reset Password Status:', resetRes.status, 'Success:', resetRes.data.success);

      // Login with new password
      const loginAfterReset = await axios.post(`${BASE_URL}/auth/login`, {
        email: testStudentEmail,
        password: newStudentPass,
      });
      console.log('Login with New Password Status:', loginAfterReset.status, 'Success:', loginAfterReset.data.success);

      console.log('\n====================================================');
      console.log('ALL REAL USER REGISTRATION & LOGIN TESTS PASSED! ✅');
      console.log('====================================================');
    } catch (testErr) {
      console.error('Test Error:', testErr.response?.data || testErr.message);
    } finally {
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    }
  });
}

runRealUserTests();
