import express from 'express';
import { getUserStats, getAdminStats } from '../controllers/dashboard.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get user dashboard statistics
 * @access  Private
 */
router.get('/stats', authenticate, getUserStats);

/**
 * @route   GET /api/dashboard/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin)
 */
router.get('/admin/stats', authenticate, isAdmin, getAdminStats);

export default router;




