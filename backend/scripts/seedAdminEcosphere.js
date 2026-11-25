import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import connectDB, { getRawMongoUri } from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import Job from '../models/Job.js';
import generateToken from '../utils/generateToken.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config();

async function seedAdminAndAccounts() {
  console.log('====================================================');
  console.log('JobNexa Secure Admin & Role Seeding Script');
  console.log('====================================================');

  try {
    const rawUri = getRawMongoUri();
    if (!rawUri) {
      throw new Error('No MongoDB URI found in environment variables (MONGO_URL, MONGO_URI, or MONGODB_URI).');
    }

    console.log('[1/5] Connecting to MongoDB Atlas...');
    const conn = await connectDB();
    console.log(`[1/5] Connected to MongoDB host: ${conn.connection.host}, database: ${conn.connection.name}`);

    // Check existing jobs count to ensure no data is affected
    const initialJobCount = await Job.countDocuments();
    console.log(`[2/5] Current Job count in database: ${initialJobCount} (preserving all records)`);

    // Specifically ensure admin@ecosphere.org exists as requested
    const targetAdminEmail = (process.argv[2] && process.argv[2].includes('@')) 
      ? process.argv[2].toLowerCase().trim() 
      : 'admin@ecosphere.org';
    const adminPassword = process.env.ADMIN_PASSWORD || (process.argv[3] || 'Ecosphere@Admin2026!');

    console.log(`[3/5] Setting up Admin account for: "${targetAdminEmail}"...`);
    let adminUser = await User.findOne({ email: targetAdminEmail }).select('+password');

    if (!adminUser) {
      // Create admin user (pre-save hook will hash password with bcrypt salt 10)
      adminUser = await User.create({
        name: 'Ecosphere Administrator',
        email: targetAdminEmail,
        password: adminPassword,
        role: 'admin',
        status: 'active',
        isApproved: true,
        isEmailVerified: true,
      });
      console.log(`[3/5] Admin account created successfully with ID: ${adminUser._id}`);
    } else {
      adminUser.role = 'admin';
      adminUser.status = 'active';
      adminUser.isApproved = true;
      adminUser.isEmailVerified = true;
      adminUser.password = adminPassword; // Triggers pre-save hash update
      await adminUser.save();
      console.log(`[3/5] Existing account updated with Admin role and new password hash.`);
    }

    // Determine recruiter and student demo passwords
    const recruiterEmail = 'recruiter@jobnexa.dev';
    const recruiterPassword = process.env.RECRUITER_PASSWORD || 'Recruiter@123';
    let recruiterUser = await User.findOne({ email: recruiterEmail }).select('+password');

    if (!recruiterUser) {
      recruiterUser = await User.create({
        name: 'Sarah Jenkins',
        email: recruiterEmail,
        password: recruiterPassword,
        role: 'recruiter',
        status: 'active',
        isApproved: true,
        isEmailVerified: true,
        phone: '+91 98765 11111',
      });

      await RecruiterProfile.findOneAndUpdate(
        { user: recruiterUser._id },
        {
          user: recruiterUser._id,
          companyName: 'NexaTech Global Labs',
          designation: 'Head of University Talent',
          companyWebsite: 'https://nexatech.example.com',
          phone: '+91 98765 11111',
          companyDescription: 'Leading enterprise cloud and full-stack software development partner.',
        },
        { upsert: true, new: true }
      );
      console.log(`[4/5] Seeded demo Recruiter account: ${recruiterEmail}`);
    }

    const studentEmail = 'student@jobnexa.dev';
    const studentPassword = process.env.STUDENT_PASSWORD || 'Student@123';
    let studentUser = await User.findOne({ email: studentEmail }).select('+password');

    if (!studentUser) {
      studentUser = await User.create({
        name: 'Rahul Sharma',
        email: studentEmail,
        password: studentPassword,
        role: 'student',
        status: 'active',
        isApproved: true,
        isEmailVerified: true,
        phone: '+91 98765 22222',
      });

      await StudentProfile.findOneAndUpdate(
        { user: studentUser._id },
        {
          user: studentUser._id,
          fullName: 'Rahul Sharma',
          phone: '+91 98765 22222',
          college: 'National Institute of Technology',
          degree: 'B.Tech',
          branch: 'Computer Science and Engineering',
          graduationYear: '2026',
          skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Python', 'Git'],
          experience: 'Completed 6-month capstone project on recruitment portals and full-stack web applications.',
          linkedinUrl: 'https://linkedin.com/in/rahulsharma-demo',
          githubUrl: 'https://github.com/rahulsharma-demo',
          profileCompletion: 85,
        },
        { upsert: true, new: true }
      );
      console.log(`[4/5] Seeded demo Student account: ${studentEmail}`);
    }

    // Verify authentication on the created admin account
    console.log('[5/5] Testing password verification & JWT generation...');
    const reloadedAdmin = await User.findOne({ email: targetAdminEmail }).select('+password');
    const isPasswordValid = await reloadedAdmin.matchPassword(adminPassword);
    const token = generateToken(reloadedAdmin._id, reloadedAdmin.role);

    console.log('Verification Results:');
    console.log(`  - Admin Email:       ${reloadedAdmin.email}`);
    console.log(`  - Admin Role:        ${reloadedAdmin.role}`);
    console.log(`  - Password Match:    ${isPasswordValid ? 'PASS (bcrypt verified)' : 'FAIL'}`);
    console.log(`  - JWT Generation:    ${token ? 'PASS (Token generated successfully)' : 'FAIL'}`);

    // Final job count check to be 100% sure existing jobs were untouched
    const finalJobCount = await Job.countDocuments();
    console.log(`  - Preserved Jobs:    ${finalJobCount} jobs (unchanged: ${initialJobCount === finalJobCount})`);

    const totalUsers = await User.countDocuments();
    console.log(`  - Total Users Now:   ${totalUsers}`);

    console.log('====================================================');
    console.log('JobNexa Admin & Account Setup COMPLETE!');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[JobNexa Seed Error]:', err.message);
    process.exit(1);
  }
}

seedAdminAndAccounts();
