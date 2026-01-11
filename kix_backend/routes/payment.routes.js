import express from 'express';
import { handleEsewaCallback } from '../controllers/order.controller.js';
import { callbackRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/payments/esewa/callback
 * @desc    Handle eSewa payment callback (public endpoint called by eSewa)
 * @access  Public (called by eSewa, no authentication required)
 */
router.post('/esewa/callback', callbackRateLimiter, handleEsewaCallback);

/**
 * @route   GET /api/payments/esewa/callback
 * @desc    Handle eSewa payment callback via GET (fallback for some eSewa implementations)
 * @access  Public (called by eSewa, no authentication required)
 */
router.get('/esewa/callback', callbackRateLimiter, handleEsewaCallback);

export default router;

