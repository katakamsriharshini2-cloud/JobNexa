import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import StudentProfile from '../models/StudentProfile.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Apply for a job with resume and cover letter
 * @route   POST /api/applications
 * @access  Private (Student)
 */
export const applyForJob = async (req, res, next) => {
  try {
    const { jobId, resumeId, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const resume = await Resume.findOne({ _id: resumeId, student: req.user.id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Selected resume not found or does not belong to you.',
      });
    }

    // Check if already applied
    const existing = await Application.findOne({
      job: jobId,
      student: req.user.id,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this position.',
      });
    }

    const application = await Application.create({
      job: jobId,
      student: req.user.id,
      resume: resumeId,
      coverLetter,
    });

    // Increment applicant counter on job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    // Send notification to recruiter
    await Notification.create({
      user: job.recruiter,
      title: 'New Candidate Application',
      message: `${req.user.name} applied for "${job.title}".`,
      type: 'application_update',
      link: `/recruiter/applicants?jobId=${job._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications submitted by logged-in student
 * @route   GET /api/applications/my-applications
 * @access  Private (Student)
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('job')
      .populate('resume')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applicants for a specific job
 * @route   GET /api/applications/job/:jobId
 * @access  Private (Recruiter / Admin)
 */
export const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view applicants for this job.',
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('student', 'name email')
      .populate('resume')
      .sort({ createdAt: -1 });

    // Attach student profile info (skills, college)
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const studentProfile = await StudentProfile.findOne({ user: app.student._id });
        return {
          ...app.toObject(),
          studentProfile,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update candidate application status
 * @route   PUT /api/applications/:id/status
 * @access  Private (Recruiter / Admin)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = status;
    await application.save();

    // Notify candidate
    await Notification.create({
      user: application.student,
      title: `Application Status Updated: ${status}`,
      message: `Your application status for "${application.job?.title}" has been updated to "${status}".`,
      type: 'application_update',
      link: '/student/applications',
    });

    res.status(200).json({
      success: true,
      message: `Application marked as ${status}.`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Schedule interview for candidate
 * @route   PUT /api/applications/:id/interview
 * @access  Private (Recruiter / Admin)
 */
export const scheduleInterview = async (req, res, next) => {
  try {
    const { date, time, link, notes } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = 'Interview Scheduled';
    application.interview = {
      date: new Date(date),
      time,
      link,
      notes,
    };
    await application.save();

    // Send high-priority notification to candidate
    await Notification.create({
      user: application.student,
      title: 'Interview Scheduled!',
      message: `An interview for "${application.job?.title}" has been scheduled on ${new Date(date).toLocaleDateString()} at ${time}.`,
      type: 'interview_scheduled',
      link: '/student/applications',
    });

    res.status(200).json({
      success: true,
      message: 'Interview scheduled and candidate notified.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
