import express from 'express';
import { isAuthenticated } from '../middleware/authenticated.js';
import { getNotifications, markAsRead, markAllRead } from '../Controllers/notificationController.js';

const router = express.Router();

router.get('/', isAuthenticated, getNotifications);
router.patch('/read-all', isAuthenticated, markAllRead);
router.patch('/:id/read', isAuthenticated, markAsRead);

export default router;
