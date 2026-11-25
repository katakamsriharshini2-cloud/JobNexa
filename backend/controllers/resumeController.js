import path from 'path';
import fs from 'fs';
import Resume from '../models/Resume.js';
import StudentProfile from '../models/StudentProfile.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * Helper to sync resume status on student profile
 */
const syncProfileResumeStatus = async (studentId) => {
  try {
    const resumes = await Resume.find({ student: studentId }).sort({ isDefault: -1, createdAt: -1 });
    const profile = await StudentProfile.findOne({ user: studentId });
    if (profile) {
      if (resumes.length > 0) {
        profile.hasResumeUploaded = true;
        profile.resumeName = resumes[0].originalName;
        profile.resumeUrl = resumes[0].fileUrl;
      } else {
        profile.hasResumeUploaded = false;
        profile.resumeName = '';
        profile.resumeUrl = '';
      }
      profile.calculateCompletion();
      await profile.save();
    }
  } catch (err) {
    console.error('Error syncing student resume profile status:', err);
  }
};

/**
 * @desc    Upload candidate resume to persistent cloud storage or local storage
 * @route   POST /api/resumes/upload
 * @access  Private (Student)
 */
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume document provided. Please attach a PDF or DOCX file (max 5MB).',
      });
    }

    const { buffer, originalname, size, mimetype } = req.file;

    // Validate size (5MB)
    if (size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Resume file size exceeds the 5MB maximum limit.',
      });
    }

    // Upload to Cloudinary or local storage
    const uploadResult = await uploadToCloudinary(buffer, originalname);

    // Check existing count for default selection
    const existingCount = await Resume.countDocuments({ student: req.user.id });
    const isDefault = existingCount === 0;

    const ext = path.extname(originalname).replace('.', '').toLowerCase();

    const resume = await Resume.create({
      student: req.user.id,
      originalName: originalname,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileType: ext || 'pdf',
      fileSize: size,
      isDefault,
    });

    // Update student profile status
    await syncProfileResumeStatus(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully to persistent storage.',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Replace an existing resume file
 * @route   PUT /api/resumes/:id/replace
 * @access  Private (Student)
 */
export const replaceResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new PDF or DOCX resume file to replace the existing one.',
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      student: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found.' });
    }

    // Delete existing file from storage
    if (resume.publicId) {
      await deleteFromCloudinary(resume.publicId);
    }

    const { buffer, originalname, size } = req.file;
    const uploadResult = await uploadToCloudinary(buffer, originalname);
    const ext = path.extname(originalname).replace('.', '').toLowerCase();

    resume.originalName = originalname;
    resume.fileUrl = uploadResult.secure_url;
    resume.publicId = uploadResult.public_id;
    resume.fileType = ext || 'pdf';
    resume.fileSize = size;
    await resume.save();

    await syncProfileResumeStatus(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Resume replaced successfully.',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all resumes of logged in student
 * @route   GET /api/resumes
 * @access  Private (Student)
 */
export const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ student: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a resume from storage and database
 * @route   DELETE /api/resumes/:id
 * @access  Private (Student)
 */
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      student: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    // Delete from storage
    await deleteFromCloudinary(resume.publicId);

    // Remove from MongoDB
    await Resume.findByIdAndDelete(req.params.id);

    // If deleted resume was default, assign another resume as default if available
    if (resume.isDefault) {
      const remaining = await Resume.findOne({ student: req.user.id }).sort({ createdAt: -1 });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    await syncProfileResumeStatus(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set a resume as the default choice for applications
 * @route   PUT /api/resumes/:id/default
 * @access  Private (Student)
 */
export const setDefaultResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      student: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    // Set all other resumes of this student to false
    await Resume.updateMany({ student: req.user.id }, { isDefault: false });

    resume.isDefault = true;
    await resume.save();

    await syncProfileResumeStatus(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Resume set as default choice.',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Securely view or download a resume (Authorized Student, Admin, or Recruiter who received an application)
 * @route   GET /api/resumes/:id/download or GET /api/resumes/:id/view
 * @access  Private (Student, Recruiter, Admin)
 */
export const downloadResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume file record not found.' });
    }

    // Check authorization:
    // 1. Owner student
    const isOwner = resume.student.toString() === req.user.id;
    // 2. Admin
    const isAdmin = req.user.role === 'admin';
    // 3. Recruiter who has an application for their job with this resume
    let isAuthorizedRecruiter = false;
    if (req.user.role === 'recruiter') {
      const recruiterJobs = await Job.find({ recruiter: req.user.id }).select('_id');
      const jobIds = recruiterJobs.map((j) => j._id);
      const application = await Application.findOne({
        job: { $in: jobIds },
        resume: resume._id,
      });
      if (application) {
        isAuthorizedRecruiter = true;
      }
    }

    if (!isOwner && !isAdmin && !isAuthorizedRecruiter) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this candidate resume.',
      });
    }

    // If file is stored on Cloudinary (starts with http/https)
    if (resume.fileUrl.startsWith('http')) {
      return res.redirect(resume.fileUrl);
    }

    // If local file stored in uploads
    const cleanFileName = path.basename(resume.fileUrl);
    const localPath = path.resolve('uploads', cleanFileName);

    if (fs.existsSync(localPath)) {
      const isInline = req.path.includes('/view');
      const disposition = isInline ? 'inline' : 'attachment';
      res.setHeader('Content-Disposition', `${disposition}; filename="${resume.originalName || cleanFileName}"`);
      if (resume.fileType === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      } else {
        res.setHeader('Content-Type', 'application/octet-stream');
      }
      return res.sendFile(localPath);
    } else {
      // Return URL for client resolution
      return res.status(404).json({
        success: false,
        message: 'Local resume file not found on disk storage.',
      });
    }
  } catch (error) {
    next(error);
  }
};
