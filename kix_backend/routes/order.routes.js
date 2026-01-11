import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByNumber,
  cancelOrder,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  initiateEsewaPayment,
  handleEsewaCallback,
  verifyEsewaPayment,
} from '../controllers/order.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';
import { paymentRateLimiter, callbackRateLimiter, verificationRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/orders
 * @desc    Create new order from cart
 * @access  Private
 */
router.post('/', createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', getOrders);

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:orderId', getOrderById);

/**
 * @route   GET /api/orders/number/:orderNumber
 * @desc    Get order by order number
 * @access  Private
 */
router.get('/number/:orderNumber', getOrderByNumber);

/**
 * @route   PUT /api/orders/:orderId/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put('/:orderId/cancel', cancelOrder);

/**
 * Admin routes
 */
/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/all', isAdmin, getAllOrders);

/**
 * @route   GET /api/orders/admin/:orderId
 * @desc    Get order by ID (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/:orderId', isAdmin, getOrderByIdAdmin);

/**
 * @route   PUT /api/orders/admin/:orderId/status
 * @desc    Update order status (Admin only)
 * @access  Private (Admin)
 */
router.put('/admin/:orderId/status', isAdmin, updateOrderStatus);

/**
 * Payment routes
 */
/**
 * @route   POST /api/orders/:orderId/payment/esewa/initiate
 * @desc    Initiate eSewa payment for an order
 * @access  Private
 */
router.post('/:orderId/payment/esewa/initiate', paymentRateLimiter, initiateEsewaPayment);

/**
 * @route   POST /api/orders/:orderId/payment/esewa/verify
 * @desc    Manually verify eSewa payment (for retry)
 * @access  Private
 */
router.post('/:orderId/payment/esewa/verify', verificationRateLimiter, verifyEsewaPayment);

// Note: Payment callback routes are registered at app level in server.js

export default router;






