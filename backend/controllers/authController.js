import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new Student or Recruiter with real user fields
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const {
      name,
      recruiterName,
      email,
      password,
      role = 'student',
      phone,
      college,
      skills,
      degree,
      branch,
      companyName,
    } = req.body;

    // Reject attempt to register as admin directly through public API
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts cannot be registered publicly.',
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.',
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format.',
      });
    }

    const displayName = (role === 'recruiter' && recruiterName) ? recruiterName : name;
    if (!displayName || !displayName.trim()) {
      return res.status(400).json({
        success: false,
        message: role === 'recruiter' ? 'Please provide your recruiter name.' : 'Please provide your full name.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address is already registered. Please sign in or use another email.',
      });
    }

    // Create user in database with hashed password (via pre-save hook)
    const user = await User.create({
      name: displayName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone ? phone.trim() : undefined,
      isEmailVerified: true,
    });

    // Parse skills array if provided as comma-separated string or array
    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof skills === 'string' && skills.trim()) {
      parsedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    // Create appropriate role profile
    if (role === 'student') {
      const studentProfile = new StudentProfile({
        user: user._id,
        fullName: displayName.trim(),
        phone: phone ? phone.trim() : undefined,
        college: college ? college.trim() : undefined,
        degree: degree ? degree.trim() : undefined,
        branch: branch ? branch.trim() : undefined,
        skills: parsedSkills,
      });
      studentProfile.calculateCompletion();
      await studentProfile.save();
    } else if (role === 'recruiter') {
      const finalCompanyName = companyName?.trim() || `${displayName.trim()}'s Organization`;
      await RecruiterProfile.create({
        user: user._id,
        companyName: finalCompanyName,
        phone: phone ? phone.trim() : undefined,
        designation: 'Talent Acquisition Partner',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully. Welcome to JobNexa!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        companyName: companyName || '',
      },
    });
  } catch (error) {
    if (error.name === 'MongooseError' || error.message?.includes('buffering timed out')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection timeout. Please verify that your MongoDB Atlas cluster is online and MONGO_URL is set in Render.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Authenticate user and retrieve token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user by email and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No user found with this email.',
      });
    }

    // Check if account suspended
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your JobNexa account has been suspended. Please contact administrator.',
      });
    }

    // Verify password hash with bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken(user._id, user.role);

    // Retrieve company name if recruiter
    let companyName = '';
    if (user.role === 'recruiter') {
      const recProfile = await RecruiterProfile.findOne({ user: user._id });
      companyName = recProfile?.companyName || '';
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        companyName,
      },
    });
  } catch (error) {
    if (error.name === 'MongooseError' || error.message?.includes('buffering timed out')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection timeout. Please verify that your MongoDB Atlas cluster is online and MONGO_URL is set in Render.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get currently logged in user info
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let extraData = {};

    if (user.role === 'student') {
      const profile = await StudentProfile.findOne({ user: user._id });
      extraData = { profile };
    } else if (user.role === 'recruiter') {
      const recruiterProfile = await RecruiterProfile.findOne({ user: user._id });
      extraData = { recruiterProfile, companyName: recruiterProfile?.companyName };
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        ...extraData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password - Generate reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No JobNexa account found registered with this email address.',
      });
    }

    // Generate random 6-digit or 32-character reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and store in user model
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    await user.save({ validateBeforeSave: false });

    // Return the token in response so the student or recruiter can reset immediately on screen
    res.status(200).json({
      success: true,
      message: 'Password reset code generated successfully. Please use this token to set a new password.',
      resetToken, // Provided for instant testing/demonstration
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password with token
 * @route   POST /api/auth/reset-password/:token or POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const rawToken = req.params.token || req.body.token;
    const { password } = req.body;

    if (!rawToken) {
      return res.status(400).json({ success: false, message: 'Reset token is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    // Hash the raw token to match what's in the DB
    const resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired. Please request a new one.',
      });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You are now logged in.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email address
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired email verification token.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};
