import express from 'express';
import { saveJob, getSavedJobs, removeSavedJob } from '../controllers/savedJobController.js';
import protect from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.route('/')
  .post(saveJob)
  .get(getSavedJobs);

router.delete('/:id', removeSavedJob);

export default router;
