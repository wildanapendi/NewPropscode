import { Router } from 'express';
import { getDashboardStats, getAllUsers, getNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/adminController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, authorizeAdmin, getDashboardStats);
router.get('/users', authenticate, authorizeAdmin, getAllUsers);
router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/:id/read', authenticate, markNotificationRead);
router.put('/notifications/read-all', authenticate, markAllNotificationsRead);

export default router;
