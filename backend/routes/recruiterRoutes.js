import express from 'express';
import {
  getRecruiterDashboard,
  getRecruiterProfile,
  updateRecruiterProfile,
} from '../controllers/recruiterController.js';
import protect from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('recruiter'));

router.get('/dashboard', getRecruiterDashboard);
router.route('/profile')
  .get(getRecruiterProfile)
  .put(updateRecruiterProfile);

export default router;
