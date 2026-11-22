import Resume from '../models/Resume.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import path from 'path';

/**
 * @desc    Upload candidate resume to persistent cloud storage
 * @route   POST /api/resumes/upload
 * @access  Private (Student)
 */
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume document provided. Please attach a PDF or DOCX file.',
      });
    }

    const { buffer, originalname, size, mimetype } = req.file;

    // Upload to Cloudinary or storage
    const uploadResult = await uploadToCloudinary(buffer, originalname);

    // Check if this is the first resume for the student
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

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully.',
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
    const resumes = await Resume.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a resume from cloud storage and database
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

    // Delete from Cloudinary
    await deleteFromCloudinary(resume.publicId);

    // Remove from MongoDB
    await Resume.findByIdAndDelete(req.params.id);

    // If deleted resume was default, assign another resume as default if available
    if (resume.isDefault) {
      const remaining = await Resume.findOne({ student: req.user.id });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set a resume as the default choice for one-click applications
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

    // Set all other resumes to false
    await Resume.updateMany({ student: req.user.id }, { isDefault: false });

    resume.isDefault = true;
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume set as default.',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};
