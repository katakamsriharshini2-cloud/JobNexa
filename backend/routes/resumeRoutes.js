import express from 'express';
import {
  uploadResume,
  replaceResume,
  getMyResumes,
  deleteResume,
  setDefaultResume,
  downloadResume,
} from '../controllers/resumeController.js';
import protect from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';
import uploadResumeMiddleware from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All resume routes require authentication
router.use(protect);

// Student upload, replace, list, delete, set default
router.post(
  '/upload',
  authorizeRoles('student'),
  uploadResumeMiddleware.single('resume'),
  uploadResume
);

router.put(
  '/:id/replace',
  authorizeRoles('student'),
  uploadResumeMiddleware.single('resume'),
  replaceResume
);

router.get('/', authorizeRoles('student'), getMyResumes);
router.delete('/:id', authorizeRoles('student'), deleteResume);
router.put('/:id/default', authorizeRoles('student'), setDefaultResume);

// Authorized viewing/downloading (Student, Recruiter, Admin)
router.get('/:id/download', downloadResume);
router.get('/:id/view', downloadResume);

export default router;
