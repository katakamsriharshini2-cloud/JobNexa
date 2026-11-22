import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';

/**
 * @desc    Bookmark / save a job
 * @route   POST /api/saved-jobs
 * @access  Private (Student)
 */
export const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const existing = await SavedJob.findOne({ user: req.user.id, job: jobId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Job already saved.' });
    }

    const savedJob = await SavedJob.create({
      user: req.user.id,
      job: jobId,
    });

    res.status(201).json({
      success: true,
      message: 'Job bookmarked successfully.',
      data: savedJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookmarked jobs for logged in student
 * @route   GET /api/saved-jobs
 * @access  Private (Student)
 */
export const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a bookmarked job
 * @route   DELETE /api/saved-jobs/:id
 * @access  Private (Student)
 */
export const removeSavedJob = async (req, res, next) => {
  try {
    // Check if :id is savedJob id or job id
    await SavedJob.findOneAndDelete({
      user: req.user.id,
      $or: [{ _id: req.params.id }, { job: req.params.id }],
    });

    res.status(200).json({
      success: true,
      message: 'Job removed from bookmarks.',
    });
  } catch (error) {
    next(error);
  }
};
