import express from 'express';
import {
  createDesign,
  getDesigns,
  getDesignById,
  updateDesign,
  deleteDesign,
  duplicateDesign,
} from '../controllers/design.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All design routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/designs
 * @desc    Create a new design
 * @access  Private
 */
router.post('/', createDesign);

/**
 * @route   GET /api/designs
 * @desc    Get user's designs
 * @access  Private
 */
router.get('/', getDesigns);

/**
 * @route   GET /api/designs/:designId
 * @desc    Get design by ID
 * @access  Private
 */
router.get('/:designId', getDesignById);

/**
 * @route   PUT /api/designs/:designId
 * @desc    Update design
 * @access  Private
 */
router.put('/:designId', updateDesign);

/**
 * @route   DELETE /api/designs/:designId
 * @desc    Delete design
 * @access  Private
 */
router.delete('/:designId', deleteDesign);

/**
 * @route   POST /api/designs/:designId/duplicate
 * @desc    Duplicate design
 * @access  Private
 */
router.post('/:designId/duplicate', duplicateDesign);

export default router;





