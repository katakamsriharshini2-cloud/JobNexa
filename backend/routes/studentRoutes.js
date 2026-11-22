import express from 'express';
import { getStudentProfile, updateStudentProfile } from '../controllers/studentController.js';
import protect from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.route('/profile')
  .get(getStudentProfile)
  .put(updateStudentProfile);

export default router;
