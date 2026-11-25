import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import Job from '../models/Job.js';

dotenv.config();

const seedInitialData = async () => {
  try {
    await connectDB();

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

    // 2. Seed Demo Recruiter
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
    }

    // 3. Ensure Sample Recruiter Jobs across all Popular Categories
    const existingRecruiterJobCount = await Job.countDocuments({ isExternal: { $ne: true } });
    if (existingRecruiterJobCount < 6) {
      await Job.deleteMany({ isExternal: { $ne: true } }); // Refresh internal demo jobs without touching real external jobs
      
      const sampleJobs = [
        {
          title: 'Software Development Engineer (SDE-1)',
          recruiter: recruiter._id,
          companyName: 'NexaTech Global Labs',
          category: 'Software Engineering',
          description: `We are looking for an ambitious SDE-1 to design and build scalable web applications.
Responsibilities:
• Architect resilient backend APIs in Node.js and Express.
• Integrate MongoDB Atlas databases with optimized indexing.
• Build reusable, responsive React components with Tailwind CSS.`,
          requiredSkills: ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
          location: 'Bangalore, India (Hybrid)',
          salaryRange: '₹8 - 14 LPA',
          jobType: 'Full-time',
          experienceLevel: 'Fresher / Entry-Level',
          vacancies: 4,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Frontend React & UI/UX Developer',
          recruiter: recruiter._id,
          companyName: 'Creative Pixel Systems',
          category: 'Frontend & UI/UX',
          description: `Join our design engineering team to craft delightful user interfaces and high-performance SPAs.
Requirements:
• Strong grasp of modern JavaScript (ES6+), React hooks, and Context API.
• Expertise in responsive layout design using Tailwind CSS or CSS3.`,
          requiredSkills: ['React', 'JavaScript', 'Tailwind CSS', 'HTML5', 'Git'],
          location: 'Remote',
          salaryRange: '₹6 - 10 LPA',
          jobType: 'Remote',
          experienceLevel: 'Fresher / Entry-Level',
          vacancies: 3,
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Junior Machine Learning & Data Engineer',
          recruiter: recruiter._id,
          companyName: 'Cognitive Data Works',
          category: 'Data & AI / ML',
          description: `Looking for junior data engineers skilled in Python, data processing pipelines, and basic machine learning model integration.`,
          requiredSkills: ['Python', 'SQL', 'MongoDB', 'Git', 'Data Structures'],
          location: 'Hyderabad, India',
          salaryRange: '₹7 - 12 LPA',
          jobType: 'Full-time',
          experienceLevel: 'Fresher / Entry-Level',
          vacancies: 2,
          deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Cloud DevOps & Platform Associate',
          recruiter: recruiter._id,
          companyName: 'CloudSphere Technologies',
          category: 'Cloud & DevOps',
          description: `Work with CI/CD automation, cloud deployment on Render/AWS, containerization with Docker, and Linux server management.`,
          requiredSkills: ['Docker', 'Git', 'Linux', 'AWS', 'Node.js'],
          location: 'Pune, India (Hybrid)',
          salaryRange: '₹8 - 13 LPA',
          jobType: 'Full-time',
          experienceLevel: '1-3 Years',
          vacancies: 2,
          deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Cybersecurity & Application Security Analyst',
          recruiter: recruiter._id,
          companyName: 'SecureShield Defenses',
          category: 'Cybersecurity',
          description: `Monitor security headers, evaluate vulnerabilities, assess authentication protocols (JWT, bcrypt), and maintain defense postures.`,
          requiredSkills: ['Cybersecurity', 'Linux', 'Python', 'Networking', 'Git'],
          location: 'Bangalore, India',
          salaryRange: '₹9 - 15 LPA',
          jobType: 'Full-time',
          experienceLevel: 'Fresher / Entry-Level',
          vacancies: 2,
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Associate Technical Product Specialist',
          recruiter: recruiter._id,
          companyName: 'GrowthSync Enterprise',
          category: 'Product & Tech Sales',
          description: `Translate technical architecture into product solutions. Excellent verbal communication and understanding of web software stacks required.`,
          requiredSkills: ['JavaScript', 'SQL', 'Git', 'Communication', 'Agile'],
          location: 'Mumbai, India',
          salaryRange: '₹7 - 11 LPA',
          jobType: 'Full-time',
          experienceLevel: 'Fresher / Entry-Level',
          vacancies: 3,
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        },
      ];

      await Job.insertMany(sampleJobs);
      console.log(`[JobNexa Seed] Seeded ${sampleJobs.length} active jobs across all categories.`);
    }

    // 4. Seed Demo Student
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
    console.log('Accounts Ready for Demonstration:');
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
