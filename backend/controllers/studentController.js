import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import { uploadImageToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * @desc    Get logged in student profile details
 * @route   GET /api/students/profile
 * @access  Private (Student)
 */
export const getStudentProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = await StudentProfile.create({
        user: req.user.id,
        fullName: req.user.name,
      });
    }

    profile.calculateCompletion();
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
      profileCompletion: profile.profileCompletion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student profile details
 * @route   PUT /api/students/profile
 * @access  Private (Student)
 */
export const updateStudentProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      college,
      degree,
      branch,
      graduationYear,
      skills,
      experience,
      linkedinUrl,
      githubUrl,
    } = req.body;

    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new StudentProfile({ user: req.user.id });
    }

    if (fullName !== undefined) profile.fullName = fullName;
    if (phone !== undefined) profile.phone = phone;
    if (college !== undefined) profile.college = college;
    if (degree !== undefined) profile.degree = degree;
    if (branch !== undefined) profile.branch = branch;
    if (graduationYear !== undefined) profile.graduationYear = graduationYear;
    if (skills !== undefined) profile.skills = skills;
    if (experience !== undefined) profile.experience = experience;
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) profile.githubUrl = githubUrl;

    profile.calculateCompletion();
    await profile.save();

    // If full name changed, update the user account name too
    if (fullName && fullName.trim() !== '') {
      await User.findByIdAndUpdate(req.user.id, { name: fullName.trim() });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: profile,
      profileCompletion: profile.profileCompletion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload or replace candidate profile avatar picture
 * @route   POST /api/students/avatar
 * @access  Private (Student)
 */
export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please attach a JPG, PNG, or WebP image.',
      });
    }

    let profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user.id });
    }

    // Delete existing old avatar from Cloudinary if replacing
    if (profile.profilePicturePublicId) {
      await deleteFromCloudinary(profile.profilePicturePublicId, 'image');
    }

    const { buffer, originalname } = req.file;
    const uploadRes = await uploadImageToCloudinary(buffer, originalname, 'jobnexa_profiles');

    profile.profilePicture = uploadRes.secure_url;
    profile.profilePicturePublicId = uploadRes.public_id;
    profile.calculateCompletion();
    await profile.save();

    // Update user model avatar as well
    await User.findByIdAndUpdate(req.user.id, {
      avatar: uploadRes.secure_url,
      avatarPublicId: uploadRes.public_id,
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully.',
      avatarUrl: uploadRes.secure_url,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete candidate profile picture
 * @route   DELETE /api/students/avatar
 * @access  Private (Student)
 */
export const deleteProfilePicture = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (profile && profile.profilePicturePublicId) {
      await deleteFromCloudinary(profile.profilePicturePublicId, 'image');
      profile.profilePicture = '';
      profile.profilePicturePublicId = '';
      profile.calculateCompletion();
      await profile.save();
    }

    await User.findByIdAndUpdate(req.user.id, {
      avatar: '',
      avatarPublicId: '',
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
