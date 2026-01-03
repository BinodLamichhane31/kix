import express from 'express';
import {
  createReview,
  getProductReviews,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  checkUserReview,
} from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', authenticate, createReview);

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get all reviews for a product
 * @access  Public
 */
router.get('/product/:productId', getProductReviews);

/**
 * @route   GET /api/reviews/user
 * @desc    Get current user's reviews
 * @access  Private
 */
router.get('/user', authenticate, getUserReviews);

/**
 * @route   GET /api/reviews/check/:productId
 * @desc    Check if current user has reviewed a product
 * @access  Private
 */
router.get('/check/:productId', authenticate, checkUserReview);

/**
 * @route   GET /api/reviews/:reviewId
 * @desc    Get a single review by ID
 * @access  Public
 */
router.get('/:reviewId', getReviewById);

/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Update a review
 * @access  Private
 */
router.put('/:reviewId', authenticate, updateReview);

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete a review
 * @access  Private
 */
router.delete('/:reviewId', authenticate, deleteReview);

export default router;
