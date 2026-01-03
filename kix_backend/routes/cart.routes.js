import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  applyPromoCode,
  updateShippingMethod,
  clearCart,
} from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/items', addItemToCart);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update item quantity in cart
 * @access  Private
 */
router.put('/items/:itemId', updateCartItem);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/items/:itemId', removeCartItem);

/**
 * @route   PUT /api/cart/promo
 * @desc    Apply promo code
 * @access  Private
 */
router.put('/promo', applyPromoCode);

/**
 * @route   PUT /api/cart/shipping
 * @desc    Update shipping method
 * @access  Private
 */
router.put('/shipping', updateShippingMethod);

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private
 */
router.delete('/', clearCart);

export default router;


