import express from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} from '../controllers/studentController.js';
import protect from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';
import { uploadImageMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.route('/profile')
  .get(getStudentProfile)
  .put(updateStudentProfile);

router.route('/avatar')
  .post(uploadImageMiddleware.single('image'), uploadProfilePicture)
  .delete(deleteProfilePicture);

export default router;
