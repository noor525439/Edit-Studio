import express from 'express';
import {
  createSupportMessage,
  getAllSupportMessages,
  getUserSupportMessages,
  getSupportMessageById,
  replySupportMessage,
  markAsReadByAdmin,
  updateSupportMessageStatus,
  getSupportStats
} from '../Controllers/supportController.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
import { isAuthenticated } from "../middleware/authenticated.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// User routes
router.post('/create', isAuthenticated, uploadMiddleware.array('files', 5), createSupportMessage);
router.get('/my-messages', isAuthenticated, getUserSupportMessages);

// Admin routes (specific paths before :messageId)
router.get('/stats/dashboard', isAuthenticated, authorizeRole('admin'), getSupportStats);
router.get('/', isAuthenticated, authorizeRole('admin'), getAllSupportMessages);
router.put('/:messageId/reply', isAuthenticated, authorizeRole('admin'), uploadMiddleware.array('files', 5), replySupportMessage);
router.put('/:messageId/read', isAuthenticated, authorizeRole('admin'), markAsReadByAdmin);
router.put('/:messageId/status', isAuthenticated, authorizeRole('admin'), updateSupportMessageStatus);
router.get('/:messageId', isAuthenticated, getSupportMessageById);

export default router;
