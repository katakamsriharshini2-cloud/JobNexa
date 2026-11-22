import express from 'express';
import { createOrUpdateAlert, getAlertPreferences } from '../controllers/jobAlertController.js';
import protect from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.route('/')
  .post(createOrUpdateAlert)
  .get(getAlertPreferences);

export default router;
