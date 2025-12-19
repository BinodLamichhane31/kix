import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from '../controllers/product.controller.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQuery,
  validateSlug,
  validateId,
} from '../middleware/product.validation.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';
import { uploadSingle, uploadMultiple, uploadProductImages } from '../middleware/upload.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, sorting, and pagination
 * @access  Public
 */
router.get('/', validateProductQuery, getProducts);

/**
 * @route   GET /api/products/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get('/slug/:slug', validateSlug, getProductBySlug);

/**
 * @route   GET /api/products/related/:slug
 * @desc    Get related products
 * @access  Public
 */
router.get('/related/:slug', validateSlug, getRelatedProducts);

/**
 * @route   GET /api/products/id/:id
 * @desc    Get product by ID (Admin only)
 * @access  Private/Admin
 */
router.get('/id/:id', authenticate, isAdmin, validateId, getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private/Admin
 */
router.post('/', authenticate, isAdmin, uploadProductImages, createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private/Admin
 */
router.put('/:id', authenticate, isAdmin, uploadProductImages, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, isAdmin, validateId, deleteProduct);

export default router;

