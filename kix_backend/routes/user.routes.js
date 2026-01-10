import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
} from '../controllers/user.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', authenticate, updateProfile);

/**
 * Admin routes
 */
/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticate, isAdmin, getAllUsers);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID (Admin only)
 * @access  Private (Admin)
 */
router.get('/:userId', authenticate, isAdmin, getUserById);

/**
 * @route   PUT /api/users/:userId/status
 * @desc    Update user status (Admin only)
 * @access  Private (Admin)
 */
router.put('/:userId/status', authenticate, isAdmin, updateUserStatus);

export default router;




