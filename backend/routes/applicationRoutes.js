import express from 'express';
import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  scheduleInterview,
  respondToInterview,
} from '../controllers/applicationController.js';
import protect from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('student'), applyForJob);
router.get('/my-applications', authorizeRoles('student'), getMyApplications);
router.get('/job/:jobId', authorizeRoles('recruiter', 'admin'), getJobApplications);
router.put('/:id/status', authorizeRoles('recruiter', 'admin'), updateApplicationStatus);
router.put('/:id/interview', authorizeRoles('recruiter', 'admin'), scheduleInterview);
router.put('/:id/interview-response', authorizeRoles('student'), respondToInterview);

export default router;
