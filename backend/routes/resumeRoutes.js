import express from 'express';
import {
  uploadResume,
  getMyResumes,
  deleteResume,
  setDefaultResume,
} from '../controllers/resumeController.js';
import protect from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';
import uploadResumeMiddleware from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post(
  '/upload',
  authorizeRoles('student'),
  uploadResumeMiddleware.single('resume'),
  uploadResume
);

router.get('/', authorizeRoles('student'), getMyResumes);
router.delete('/:id', authorizeRoles('student'), deleteResume);
router.put('/:id/default', authorizeRoles('student'), setDefaultResume);

export default router;
