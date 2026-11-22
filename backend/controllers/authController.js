import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new Student or Recruiter
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', companyName } = req.body;

    // Reject attempt to register as admin directly through public API
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts cannot be registered publicly.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address is already registered.',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
    });

    // Create appropriate role profile
    if (role === 'student') {
      await StudentProfile.create({
        user: user._id,
        fullName: name,
        profileCompletion: 25,
      });
    } else if (role === 'recruiter') {
      await RecruiterProfile.create({
        user: user._id,
        companyName: companyName || `${name}'s Organization`,
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: companyName || '',
      },
    });
  } catch (error) {
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
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
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
        companyName,
      },
    });
  } catch (error) {
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
        ...extraData,
      },
    });
  } catch (error) {
    next(error);
  }
};
