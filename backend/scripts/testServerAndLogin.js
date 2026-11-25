import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config();

// Import and start the actual server app
const { default: app } = await import('../server.js');

const TEST_PORT = 5000;

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('====================================================');
  console.log('JobNexa Live Backend & Login API Diagnostic v2');
  console.log('====================================================');

  // Wait for MongoDB to connect (server.js starts connectDB then startServer)
  console.log('Waiting 4 seconds for MongoDB Atlas connection...');
  await wait(4000);

  const dbState = mongoose.connection.readyState;
  console.log(`MongoDB readyState: ${dbState} (1=Connected, 2=Connecting, 0=Disconnected)`);

  const BASE = `http://127.0.0.1:${TEST_PORT}`;

  // Step 1: Health Check
  console.log('\n[Step 1] GET /api/health');
  try {
    const r = await axios.get(`${BASE}/api/health`, { timeout: 5000 });
    console.log('Status:', r.status);
    console.log('Response:', JSON.stringify(r.data, null, 2));
  } catch (err) {
    console.error('Health Error:', err.response?.status, JSON.stringify(err.response?.data));
  }

  // Step 2: Login admin@ecosphere.org
  console.log('\n[Step 2] POST /api/auth/login → admin@ecosphere.org');
  try {
    const adminPw = process.env.ADMIN_PASSWORD || 'Ecosphere@Admin2026!';
    const r = await axios.post(`${BASE}/api/auth/login`, { email: 'admin@ecosphere.org', password: adminPw }, { timeout: 10000 });
    console.log('Status:', r.status);
    console.log('Success:', r.data.success);
    console.log('Role:', r.data.user?.role);
    console.log('Token Present:', Boolean(r.data.token));
  } catch (err) {
    console.error('Admin Login Error:', err.response?.status, JSON.stringify(err.response?.data));
  }

  // Step 3: Login admin@jobnexa.dev
  console.log('\n[Step 3] POST /api/auth/login → admin@jobnexa.dev');
  try {
    const r = await axios.post(`${BASE}/api/auth/login`, { email: 'admin@jobnexa.dev', password: 'Ecosphere@Admin2026!' }, { timeout: 10000 });
    console.log('Status:', r.status);
    console.log('Success:', r.data.success);
    console.log('Role:', r.data.user?.role);
  } catch (err) {
    console.error('admin@jobnexa.dev Error:', err.response?.status, JSON.stringify(err.response?.data));
  }

  // Step 4: Login student@jobnexa.dev
  console.log('\n[Step 4] POST /api/auth/login → student@jobnexa.dev');
  try {
    const r = await axios.post(`${BASE}/api/auth/login`, { email: 'student@jobnexa.dev', password: 'Student@123' }, { timeout: 10000 });
    console.log('Status:', r.status);
    console.log('Success:', r.data.success);
    console.log('Role:', r.data.user?.role);
  } catch (err) {
    console.error('Student Error:', err.response?.status, JSON.stringify(err.response?.data));
  }

  // Step 5: Login recruiter@jobnexa.dev
  console.log('\n[Step 5] POST /api/auth/login → recruiter@jobnexa.dev');
  try {
    const r = await axios.post(`${BASE}/api/auth/login`, { email: 'recruiter@jobnexa.dev', password: 'Recruiter@123' }, { timeout: 10000 });
    console.log('Status:', r.status);
    console.log('Success:', r.data.success);
    console.log('Role:', r.data.user?.role);
  } catch (err) {
    console.error('Recruiter Error:', err.response?.status, JSON.stringify(err.response?.data));
  }

  // Step 6: Confirm invalid password is rejected
  console.log('\n[Step 6] Invalid credential rejection test');
  try {
    await axios.post(`${BASE}/api/auth/login`, { email: 'admin@ecosphere.org', password: 'WrongPassword!' }, { timeout: 5000 });
    console.error('FAIL: Invalid password was incorrectly accepted!');
  } catch (err) {
    console.log('Expected Rejection Status:', err.response?.status);
    console.log('Message:', err.response?.data?.message);
    if (err.response?.status === 401) {
      console.log('PASS: Invalid credentials correctly rejected');
    }
  }

  console.log('\n====================================================');
  console.log('Live Diagnostic COMPLETE');
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(0);
}

runTests();
