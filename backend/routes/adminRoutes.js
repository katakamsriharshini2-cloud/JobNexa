import express from 'express';
import {
  getAdminDashboard,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  triggerJobSync,
  getSyncStatus,
} from '../controllers/adminController.js';
import protect from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Real-Time Job Sync Control
router.post('/sync-jobs', triggerJobSync);
router.get('/sync-status', getSyncStatus);

export default router;
