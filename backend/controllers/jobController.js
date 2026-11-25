import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import JobAlert from '../models/JobAlert.js';
import Notification from '../models/Notification.js';
import { calculateJobMatch, normalizeSkill } from '../utils/calculateJobMatch.js';
import { syncAllJobs } from '../services/jobSyncService.js';
import { getCuratedIndianJobs } from '../services/indianTechJobsService.js';

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

    const isDbConnected = mongoose.connection.readyState === 1;
    let jobs = [];
    let total = 0;

    if (isDbConnected) {
      try {
        const query = { isActive: { $ne: false } };
        const andConditions = [];

        // Search by title, skills, category, company name, or description
        if (keyword && keyword.trim() !== '') {
          const trimmed = keyword.trim();
          const words = trimmed.split(/\s+/).filter((w) => w.length > 2);
          const regexPatterns = [new RegExp(trimmed, 'i'), ...words.map((w) => new RegExp(w, 'i'))];

          andConditions.push({
            $or: [
              { title: { $in: regexPatterns } },
              { companyName: { $in: regexPatterns } },
              { category: { $in: regexPatterns } },
              { description: { $in: regexPatterns } },
              { requiredSkills: { $in: regexPatterns } },
            ],
          });
        }

        if (location && location.trim() !== '') {
          const trimmedLoc = location.trim();
          if (trimmedLoc.toLowerCase() === 'remote') {
            andConditions.push({
              $or: [
                { isRemote: true },
                { location: { $regex: 'remote', $options: 'i' } },
                { jobType: 'Remote' },
              ],
            });
          } else {
            const locRegex = new RegExp(trimmedLoc, 'i');
            andConditions.push({
              $or: [{ location: locRegex }, { city: locRegex }],
            });
          }
        }

        if (jobType && jobType.trim() !== '' && jobType !== 'All') {
          query.jobType = new RegExp(`^${jobType.trim()}$`, 'i');
        }
        if (experienceLevel && experienceLevel.trim() !== '' && experienceLevel !== 'All Levels') {
          query.experienceLevel = new RegExp(`^${experienceLevel.trim()}$`, 'i');
        }
        if (req.query.category && req.query.category.trim() !== '' && req.query.category !== 'All') {
          query.category = new RegExp(req.query.category.trim(), 'i');
        }
        if (req.query.city && req.query.city.trim() !== '') {
          query.city = { $regex: req.query.city.trim(), $options: 'i' };
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

        if (andConditions.length > 0) {
          query.$and = andConditions;
        }

        let sort = { createdAt: -1 };
        if (sortBy === 'salary') sort = { salaryRange: -1 };

        const skip = (Number(page) - 1) * Number(limit);
        total = await Job.countDocuments(query);
        jobs = await Job.find(query).sort(sort).skip(skip).limit(Number(limit));
      } catch (dbErr) {
        console.warn('[JobController] Database query notice:', dbErr.message);
        jobs = [];
        total = 0;
      }
    }

    // Resilient Fallback: If DB is empty, connecting, or offline, serve curated Indian opportunities
    if (jobs.length === 0 && total === 0) {
      let curated = getCuratedIndianJobs();

      if (keyword && keyword.trim() !== '') {
        const lowerK = keyword.toLowerCase().trim();
        curated = curated.filter(
          (j) =>
            (j.title && j.title.toLowerCase().includes(lowerK)) ||
            (j.companyName && j.companyName.toLowerCase().includes(lowerK)) ||
            (j.category && j.category.toLowerCase().includes(lowerK)) ||
            (j.description && j.description.toLowerCase().includes(lowerK)) ||
            (j.requiredSkills && j.requiredSkills.some((s) => s.toLowerCase().includes(lowerK)))
        );
      }

      if (location && location.trim() !== '') {
        const lowerL = location.toLowerCase().trim();
        if (lowerL === 'remote') {
          curated = curated.filter(
            (j) => j.isRemote || (j.location && j.location.toLowerCase().includes('remote'))
          );
        } else {
          curated = curated.filter(
            (j) =>
              (j.city && j.city.toLowerCase().includes(lowerL)) ||
              (j.location && j.location.toLowerCase().includes(lowerL))
          );
        }
      }

      if (jobType) {
        curated = curated.filter(
          (j) => j.jobType && j.jobType.toLowerCase() === jobType.toLowerCase()
        );
      }
      if (experienceLevel) {
        curated = curated.filter(
          (j) => j.experienceLevel && j.experienceLevel.toLowerCase() === experienceLevel.toLowerCase()
        );
      }

      total = curated.length;
      const skip = (Number(page) - 1) * Number(limit);
      jobs = curated.slice(skip, skip + Number(limit));
    }

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
    let job = null;
    if (mongoose.connection.readyState === 1) {
      try {
        job = await Job.findById(req.params.id);
      } catch (e) {
        job = null;
      }
    }

    // Fallback: search in curated Indian jobs
    if (!job) {
      const allCurated = getCuratedIndianJobs();
      job = allCurated.find(
        (j) => String(j._id) === String(req.params.id) || j.externalId === req.params.id
      );
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    let hasApplied = false;
    let matchDetails = null;

    // If user is authenticated as student, calculate skill match and check if already applied
    if (req.user && req.user.role === 'student' && mongoose.connection.readyState === 1) {
      try {
        const existingApp = await Application.findOne({
          job: job._id,
          student: req.user.id,
        });
        hasApplied = Boolean(existingApp);

        const studentProfile = await StudentProfile.findOne({ user: req.user.id });
        if (studentProfile) {
          matchDetails = calculateJobMatch(studentProfile.skills, job.requiredSkills);
        }
      } catch (appErr) {
        // Ignore app lookup error
      }
    }

    const jobData = typeof job.toObject === 'function' ? job.toObject() : job;

    res.status(200).json({
      success: true,
      data: {
        ...jobData,
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
    let candidateSkills = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });
        candidateSkills = studentProfile?.skills || [];
      } catch (e) {}
    }

    let activeJobs = [];
    if (mongoose.connection.readyState === 1) {
      try {
        activeJobs = await Job.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).limit(50);
      } catch (e) {}
    }

    if (activeJobs.length === 0) {
      activeJobs = getCuratedIndianJobs();
    }

    // Compute matches using algorithm
    const scoredJobs = activeJobs.map((job) => {
      const match = calculateJobMatch(candidateSkills, job.requiredSkills);
      const rawJob = typeof job.toObject === 'function' ? job.toObject() : job;
      return {
        ...rawJob,
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
