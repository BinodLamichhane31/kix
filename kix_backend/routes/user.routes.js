import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
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
 * Address routes
 */
/**
 * @route   GET /api/users/addresses
 * @desc    Get all addresses for current user
 * @access  Private
 */
router.get('/addresses', authenticate, getAddresses);

/**
 * @route   POST /api/users/addresses
 * @desc    Add a new address for current user
 * @access  Private
 */
router.post('/addresses', authenticate, addAddress);

/**
 * @route   PUT /api/users/addresses/:addressId
 * @desc    Update an address for current user
 * @access  Private
 */
router.put('/addresses/:addressId', authenticate, updateAddress);

/**
 * @route   DELETE /api/users/addresses/:addressId
 * @desc    Delete an address for current user
 * @access  Private
 */
router.delete('/addresses/:addressId', authenticate, deleteAddress);

/**
 * @route   PUT /api/users/addresses/:addressId/default
 * @desc    Set an address as default for current user
 * @access  Private
 */
router.put('/addresses/:addressId/default', authenticate, setDefaultAddress);

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





