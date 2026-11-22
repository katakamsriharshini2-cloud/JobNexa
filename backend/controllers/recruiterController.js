import RecruiterProfile from '../models/RecruiterProfile.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

/**
 * @desc    Get recruiter dashboard statistics
 * @route   GET /api/recruiter/dashboard
 * @access  Private (Recruiter)
 */
export const getRecruiterDashboard = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;

    // Get all jobs posted by this recruiter
    const jobs = await Job.find({ recruiter: recruiterId });
    const jobIds = jobs.map((j) => j._id);

    // Count applications
    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
    const shortlisted = await Application.countDocuments({
      job: { $in: jobIds },
      status: 'Shortlisted',
    });
    const selected = await Application.countDocuments({
      job: { $in: jobIds },
      status: 'Selected',
    });
    const rejected = await Application.countDocuments({
      job: { $in: jobIds },
      status: 'Rejected',
    });

    // Recent 5 applicants
    const recentApplicants = await Application.find({ job: { $in: jobIds } })
      .populate('student', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalJobs: jobs.length,
        totalApplicants: totalApplications,
        shortlisted,
        selected,
        rejected,
      },
      recentApplicants,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recruiter profile
 * @route   GET /api/recruiter/profile
 * @access  Private (Recruiter)
 */
export const getRecruiterProfile = async (req, res, next) => {
  try {
    let profile = await RecruiterProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await RecruiterProfile.create({
        user: req.user.id,
        companyName: req.user.name,
      });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update recruiter profile
 * @route   PUT /api/recruiter/profile
 * @access  Private (Recruiter)
 */
export const updateRecruiterProfile = async (req, res, next) => {
  try {
    const { companyName, designation, companyWebsite, phone, companyDescription } = req.body;

    let profile = await RecruiterProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new RecruiterProfile({ user: req.user.id });
    }

    if (companyName) profile.companyName = companyName;
    if (designation) profile.designation = designation;
    if (companyWebsite) profile.companyWebsite = companyWebsite;
    if (phone) profile.phone = phone;
    if (companyDescription) profile.companyDescription = companyDescription;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Recruiter company profile updated.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
