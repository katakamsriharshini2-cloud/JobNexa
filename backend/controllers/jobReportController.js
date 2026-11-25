import JobReport from '../models/JobReport.js';
import Job from '../models/Job.js';

/**
 * @desc    Submit a suspicious job report
 * @route   POST /api/jobs/:id/report
 * @access  Public / Authenticated
 */
export const reportJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, details, email } = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    const report = await JobReport.create({
      job: id,
      reporter: req.user ? req.user._id : undefined,
      reporterEmail: email || (req.user ? req.user.email : ''),
      reason: reason || 'Suspicious / Scam',
      details: details ? details.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Job report filed successfully. Our moderation team will investigate.',
      data: report,
    });
  } catch (error) {
    console.error('[JobReport Controller Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Could not submit report at this time.',
    });
  }
};

/**
 * @desc    Get all job reports (Admin only)
 * @route   GET /api/admin/reports
 * @access  Admin
 */
export const getAllReports = async (req, res) => {
  try {
    const reports = await JobReport.find()
      .populate('job', 'title companyName location')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports.',
    });
  }
};
