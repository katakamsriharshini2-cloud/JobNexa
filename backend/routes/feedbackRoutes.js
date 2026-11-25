import express from 'express';
import { submitFeedback, getAllFeedback } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', submitFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);

export default router;
