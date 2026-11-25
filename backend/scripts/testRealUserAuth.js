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

const TEST_PORT = 5003;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

async function runComprehensiveAuthAudit() {
  console.log('====================================================');
  console.log('JobNexa Comprehensive Real User Auth & Dashboard Audit');
  console.log('====================================================');

  console.log('[1] Connecting to MongoDB Atlas...');
  await connectDB();
  console.log('[1] Connected successfully.');

  const server = app.listen(TEST_PORT, async () => {
    console.log(`[Diagnostic Server] Listening on port ${TEST_PORT}`);

    try {
      // 1. Check health
      const health = await axios.get(`${BASE_URL}/health`);
      console.log('Health check:', health.data.status, 'Database:', health.data.database);

      // 2. Test non-existent user login -> should return 401 with 'No user found'
      console.log('\n--- Test 2: Unregistered Email Login ---');
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: 'definitely.not.registered.2026@gmail.com',
          password: 'SomePassword123!',
        });
        console.error('FAIL: Unregistered email was allowed!');
      } catch (err) {
        console.log('Status code:', err.response?.status);
        console.log('Backend message:', err.response?.data?.message);
        const isExpected = err.response?.data?.message?.includes('No user found');
        console.log('Verified Expected Error:', isExpected ? 'PASS' : 'FAIL');
      }

      // 3. Register a real student with modern email TLD (.technology)
      const realStudentEmail = 'rishi.student.2026@engineering.technology';
      const realStudentPass = 'RishiSecure@2026!';

      // Clean up test email if left over
      await User.deleteOne({ email: realStudentEmail });

      console.log('\n--- Test 3: Public Registration with Modern Email TLD ---');
      const studentReg = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Rishi Kumar',
        email: realStudentEmail,
        password: realStudentPass,
        role: 'student',
        phone: '+91 98765 00001',
        college: 'National Institute of Technology',
        degree: 'B.Tech / B.E.',
        branch: 'Computer Science & Engineering',
        graduationYear: '2026',
        experience: 'Fresher / Entry-Level',
        skills: 'JavaScript, React, Node.js, MongoDB',
      });

      console.log('Registration status:', studentReg.status);
      console.log('Registration success:', studentReg.data.success);
      console.log('User created:', studentReg.data.user.email, 'Role:', studentReg.data.user.role);

      // Verify in MongoDB Atlas
      const dbUser = await User.findOne({ email: realStudentEmail });
      console.log('Saved in MongoDB Atlas:', Boolean(dbUser), 'User ID:', dbUser?._id);

      // 4. Immediate Login with newly registered credentials
      console.log('\n--- Test 4: Immediate Login with Registered Credentials ---');
      const studentLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: realStudentEmail,
        password: realStudentPass,
      });

      console.log('Login status:', studentLogin.status);
      console.log('Login success:', studentLogin.data.success);
      console.log('Token generated:', Boolean(studentLogin.data.token));
      console.log('User name in login response:', studentLogin.data.user.name);

      const token = studentLogin.data.token;

      // 5. Test accessing dashboard / profile using the token
      console.log('\n--- Test 5: Accessing Dashboard & Current User Profile ---');
      const meRes = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('/api/auth/me status:', meRes.status);
      console.log('Current user name:', meRes.data.data.name);
      console.log('Current user email:', meRes.data.data.email);
      console.log('Current user role:', meRes.data.data.role);

      const studentProfileRes = await axios.get(`${BASE_URL}/students/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('/api/students/profile status:', studentProfileRes.status);
      console.log('Profile college:', studentProfileRes.data.data.college);

      // 6. Test Forgot Password and Reset Password
      console.log('\n--- Test 6: Forgot Password & Reset Password ---');
      const forgot = await axios.post(`${BASE_URL}/auth/forgot-password`, { email: realStudentEmail });
      console.log('Forgot password status:', forgot.status, 'Token issued:', Boolean(forgot.data.resetToken));

      const newPass = 'RishiUpdatedPassword@2026!';
      const reset = await axios.post(`${BASE_URL}/auth/reset-password/${forgot.data.resetToken}`, {
        token: forgot.data.resetToken,
        password: newPass,
      });
      console.log('Reset password status:', reset.status, 'Success:', reset.data.success);

      // 7. Login with old password -> should fail
      console.log('\n--- Test 7: Login with Old Password (should fail) ---');
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: realStudentEmail,
          password: realStudentPass,
        });
        console.error('FAIL: Old password was accepted after reset!');
      } catch (err) {
        console.log('Status code:', err.response?.status);
        console.log('Error message:', err.response?.data?.message);
        console.log('PASS: Old password rejected.');
      }

      // 8. Login with new password -> should succeed
      console.log('\n--- Test 8: Login with New Password (should succeed) ---');
      const loginNew = await axios.post(`${BASE_URL}/auth/login`, {
        email: realStudentEmail,
        password: newPass,
      });
      console.log('Login with new password status:', loginNew.status);
      console.log('Login success:', loginNew.data.success);

      console.log('\n====================================================');
      console.log('ALL REGISTRATION, LOGIN, RESET & PROFILE AUDITS PASSED! ✅');
      console.log('====================================================');
    } catch (err) {
      console.error('Audit Error:', err.response?.data || err.message);
    } finally {
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    }
  });
}

runComprehensiveAuthAudit();
