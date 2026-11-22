import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import Job from '../models/Job.js';

dotenv.config();

const seedInitialData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobnexa';
    console.log(`Connecting to database for seeding: ${connStr.replace(/:([^@]+)@/, ':****@')}`);
    await mongoose.connect(connStr);

    console.log('[JobNexa Seed] Database connected.');

    // 1. Seed or Verify Administrator
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@jobnexa.dev').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: process.env.ADMIN_NAME || 'JobNexa System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        status: 'active',
        isApproved: true,
      });
      console.log(`[JobNexa Seed] Created initial Admin account: ${adminEmail}`);
    } else {
      admin.role = 'admin';
      admin.password = adminPassword;
      await admin.save();
      console.log(`[JobNexa Seed] Updated existing Admin account: ${adminEmail}`);
    }

    // 2. Seed Demo Recruiter if not present (for easy professor demo)
    const recruiterEmail = 'recruiter@jobnexa.dev';
    let recruiter = await User.findOne({ email: recruiterEmail });
    if (!recruiter) {
      recruiter = await User.create({
        name: 'Sarah Jenkins',
        email: recruiterEmail,
        password: 'Recruiter@123',
        role: 'recruiter',
        status: 'active',
        isApproved: true,
      });
      await RecruiterProfile.create({
        user: recruiter._id,
        companyName: 'NexaTech Global Labs',
        designation: 'Head of University Talent',
        companyWebsite: 'https://nexatech.example.com',
        phone: '+91 98765 11111',
        companyDescription: 'Leading enterprise cloud and full-stack software development partner.',
      });
      console.log(`[JobNexa Seed] Created demo Recruiter account: ${recruiterEmail}`);

      // Seed 2 demo jobs for immediate display
      const job1 = await Job.create({
        title: 'Associate Full-Stack Engineer',
        recruiter: recruiter._id,
        companyName: 'NexaTech Global Labs',
        description: `We are seeking motivated graduate engineers to join our dynamic web technologies engineering team.
You will be architecting resilient REST APIs, crafting intuitive React single-page interfaces, and managing MongoDB Atlas databases.

Responsibilities:
• Develop modular frontend components in React and Tailwind CSS.
• Write clean, testable Node.js / Express backend endpoints.
• Collaborate on campus technology transformation projects.`,
        requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'],
        location: 'Bangalore, India (Hybrid)',
        salaryRange: '₹8 - 12 LPA',
        jobType: 'Full-time',
        experienceLevel: 'Fresher / Entry-Level',
        vacancies: 3,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const job2 = await Job.create({
        title: 'Junior React Frontend Developer',
        recruiter: recruiter._id,
        companyName: 'NexaTech Global Labs',
        description: `Exciting opening for passionate frontend specialists with solid fundamentals in React hooks, responsive Tailwind styling, and asynchronous state handling.`,
        requiredSkills: ['React', 'JavaScript', 'Tailwind CSS', 'Git', 'HTML5'],
        location: 'Remote',
        salaryRange: '₹6 - 9 LPA',
        jobType: 'Remote',
        experienceLevel: 'Fresher / Entry-Level',
        vacancies: 2,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      });

      console.log(`[JobNexa Seed] Created 2 sample active job postings.`);
    }

    // 3. Seed Demo Student if not present
    const studentEmail = 'student@jobnexa.dev';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      student = await User.create({
        name: 'Rahul Sharma',
        email: studentEmail,
        password: 'Student@123',
        role: 'student',
        status: 'active',
        isApproved: true,
      });

      await StudentProfile.create({
        user: student._id,
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
      });
      console.log(`[JobNexa Seed] Created demo Student account: ${studentEmail}`);
    }

    console.log('====================================================');
    console.log('JOBNEXA DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Accounts Ready for College Demonstration:');
    console.log('1. Admin:     admin@jobnexa.dev     / Admin@123');
    console.log('2. Recruiter: recruiter@jobnexa.dev / Recruiter@123');
    console.log('3. Student:   student@jobnexa.dev   / Student@123');
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[JobNexa Seed Error]:', error);
    process.exit(1);
  }
};

seedInitialData();
