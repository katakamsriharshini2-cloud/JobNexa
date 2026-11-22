import Job from '../models/Job.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import JobAlert from '../models/JobAlert.js';
import Notification from '../models/Notification.js';
import { calculateJobMatch, normalizeSkill } from '../utils/calculateJobMatch.js';
import { syncAllJobs } from '../services/jobSyncService.js';

/**
 * @desc    Fetch all public jobs with filtering, search, and pagination
 * @route   GET /api/jobs
 * @access  Public
 */
export const getJobs = async (req, res, next) => {
  try {
    const {
      keyword,
      location,
      jobType,
      experienceLevel,
      sortBy = 'latest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isActive: true };

    // Search by title, skills, category, company name, or description
    if (keyword && keyword.trim() !== '') {
      const trimmed = keyword.trim();
      const words = trimmed.split(/\s+/).filter(w => w.length > 2);
      const regexPatterns = [new RegExp(trimmed, 'i'), ...words.map(w => new RegExp(w, 'i'))];

      query.$or = [
        { title: { $in: regexPatterns } },
        { companyName: { $in: regexPatterns } },
        { category: { $in: regexPatterns } },
        { description: { $in: regexPatterns } },
        { requiredSkills: { $in: regexPatterns } },
      ];
    }

    if (location && location.trim() !== '') {
      const trimmedLoc = location.trim();
      if (trimmedLoc.toLowerCase() === 'remote') {
        const remoteConditions = [
          { isRemote: true },
          { location: { $regex: 'remote', $options: 'i' } },
          { jobType: 'Remote' },
        ];
        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: remoteConditions }];
          delete query.$or;
        } else {
          query.$or = remoteConditions;
        }
      } else {
        const locRegex = new RegExp(trimmedLoc, 'i');
        const locConditions = [
          { location: locRegex },
          { city: locRegex },
        ];
        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: locConditions }];
          delete query.$or;
        } else {
          query.$or = locConditions;
        }
      }
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (req.query.city) {
      query.city = { $regex: req.query.city, $options: 'i' };
    }

    if (req.query.isRemote !== undefined) {
      query.isRemote = req.query.isRemote === 'true';
    }

    if (req.query.source) {
      if (req.query.source === 'external') {
        query.isExternal = true;
      } else if (req.query.source === 'internal') {
        query.isExternal = false;
      } else {
        query.source = req.query.source;
      }
    }

    // Sort order
    let sort = { createdAt: -1 };
    if (sortBy === 'salary') {
      sort = { salaryRange: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query).sort(sort).skip(skip).limit(Number(limit));

    res.status(200).json({
      success: true,
      data: jobs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job by ID with candidate match details
 * @route   GET /api/jobs/:id
 * @access  Public / Optional Authenticated
 */
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    let hasApplied = false;
    let matchDetails = null;

    // If user is authenticated as student, calculate skill match and check if already applied
    if (req.user && req.user.role === 'student') {
      const existingApp = await Application.findOne({
        job: job._id,
        student: req.user.id,
      });
      hasApplied = Boolean(existingApp);

      const studentProfile = await StudentProfile.findOne({ user: req.user.id });
      if (studentProfile) {
        matchDetails = calculateJobMatch(studentProfile.skills, job.requiredSkills);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...job.toObject(),
        hasApplied,
        matchDetails,
      },
      hasApplied,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recommended jobs for the authenticated student using skill-matching
 * @route   GET /api/jobs/recommended
 * @access  Private (Student)
 */
export const getRecommendedJobs = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    const candidateSkills = studentProfile?.skills || [];

    const activeJobs = await Job.find({ isActive: true }).sort({ createdAt: -1 }).limit(50);

    // Compute matches using algorithm
    const scoredJobs = activeJobs.map((job) => {
      const match = calculateJobMatch(candidateSkills, job.requiredSkills);
      return {
        ...job.toObject(),
        matchPercentage: match.matchPercentage,
        matchingSkills: match.matchingSkills,
        missingSkills: match.missingSkills,
      };
    });

    // Sort by highest match percentage first
    scoredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
      success: true,
      data: scoredJobs.slice(0, 12),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new job posting & notify matching students
 * @route   POST /api/jobs
 * @access  Private (Recruiter)
 */
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      companyName,
      description,
      requiredSkills,
      location,
      salaryRange,
      jobType,
      experienceLevel,
      vacancies,
      deadline,
    } = req.body;

    const job = await Job.create({
      title,
      recruiter: req.user.id,
      companyName: companyName || req.user.name,
      description,
      requiredSkills,
      location,
      salaryRange,
      jobType,
      experienceLevel,
      vacancies: Number(vacancies) || 1,
      deadline: deadline ? new Date(deadline) : undefined,
    });

    // Trigger Job Alerts: Match active student alerts and create notifications
    try {
      const activeAlerts = await JobAlert.find({ isActive: true });
      for (const alert of activeAlerts) {
        // Check if student target skills match the job's skills
        const match = calculateJobMatch(alert.preferredSkills, job.requiredSkills);
        const matchesSkill = alert.preferredSkills.length === 0 || match.matchPercentage >= 30;
        const matchesLocation =
          !alert.preferredLocations ||
          job.location.toLowerCase().includes(alert.preferredLocations.toLowerCase()) ||
          job.location.toLowerCase().includes('remote');

        if (matchesSkill && matchesLocation) {
          await Notification.create({
            user: alert.user,
            title: `Job Alert: ${job.title}`,
            message: `${job.companyName} just posted "${job.title}" matching your career preferences in ${job.location}.`,
            type: 'job_alert',
            link: `/jobs/${job._id}`,
          });
        }
      }
    } catch (alertErr) {
      console.error('Job Alert Notification Error:', alertErr);
    }

    res.status(201).json({
      success: true,
      message: 'Job vacancy published successfully.',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing job posting
 * @route   PUT /api/jobs/:id
 * @access  Private (Recruiter / Admin)
 */
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this job posting.',
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully.',
      data: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete job posting
 * @route   DELETE /api/jobs/:id
 * @access  Private (Recruiter / Admin)
 */
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this job posting.',
      });
    }

    // Delete associated applications
    await Application.deleteMany({ job: job._id });
    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job posting and associated applications removed.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs posted by current recruiter
 * @route   GET /api/jobs/recruiter/my-jobs
 * @access  Private (Recruiter)
 */
export const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};
