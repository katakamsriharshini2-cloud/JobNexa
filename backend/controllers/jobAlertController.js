import JobAlert from '../models/JobAlert.js';

/**
 * @desc    Create or update student job alert preferences
 * @route   POST /api/job-alerts
 * @access  Private (Student)
 */
export const createOrUpdateAlert = async (req, res, next) => {
  try {
    const { preferredSkills, preferredLocations, jobType, isActive } = req.body;

    let alert = await JobAlert.findOne({ user: req.user.id });

    if (!alert) {
      alert = new JobAlert({ user: req.user.id });
    }

    if (preferredSkills !== undefined) alert.preferredSkills = preferredSkills;
    if (preferredLocations !== undefined) alert.preferredLocations = preferredLocations;
    if (jobType !== undefined) alert.jobType = jobType;
    if (isActive !== undefined) alert.isActive = isActive;

    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Job alert preferences updated.',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student job alert preferences
 * @route   GET /api/job-alerts
 * @access  Private (Student)
 */
export const getAlertPreferences = async (req, res, next) => {
  try {
    let alert = await JobAlert.findOne({ user: req.user.id });

    if (!alert) {
      alert = await JobAlert.create({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};
