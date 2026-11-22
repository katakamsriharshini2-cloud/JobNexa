import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';

/**
 * @desc    Get system-wide platform statistics and analytics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const shortlisted = await Application.countDocuments({ status: 'Shortlisted' });
    const selected = await Application.countDocuments({ status: 'Selected' });

    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(50);
    const jobs = await Job.find().sort({ createdAt: -1 }).limit(50);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalRecruiters,
        totalJobs,
        totalApplications,
        shortlisted,
        selected,
      },
      users,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user account status (e.g. active, suspended, approved)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin)
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status, isApproved } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Administrator account status cannot be altered.',
      });
    }

    if (status) user.status = status;
    if (isApproved !== undefined) user.isApproved = isApproved;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User status updated successfully.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account and related records
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the administrator account.',
      });
    }

    if (user.role === 'student') {
      await StudentProfile.findOneAndDelete({ user: user._id });
      await Application.deleteMany({ student: user._id });
    } else if (user.role === 'recruiter') {
      await RecruiterProfile.findOneAndDelete({ user: user._id });
      await Job.deleteMany({ recruiter: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User and all associated data permanently removed.',
    });
  } catch (error) {
    next(error);
  }
};
