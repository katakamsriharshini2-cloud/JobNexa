import express from 'express';
import {
  getJobs,
  getJobById,
  getRecommendedJobs,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
} from '../controllers/jobController.js';
import protect from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Optional authentication middleware for getJobById to enrich with match score if logged in
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jobnexa_super_secure_jwt_secret_token_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignore token failure for public endpoints
    }
  }
  next();
};

router.get('/', optionalAuth, getJobs);
router.get('/recommended', protect, authorizeRoles('student'), getRecommendedJobs);
router.get('/recruiter/my-jobs', protect, authorizeRoles('recruiter'), getRecruiterJobs);
router.get('/:id', optionalAuth, getJobById);

router.post('/', protect, authorizeRoles('recruiter'), createJob);
router.put('/:id', protect, authorizeRoles('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorizeRoles('recruiter', 'admin'), deleteJob);

export default router;
