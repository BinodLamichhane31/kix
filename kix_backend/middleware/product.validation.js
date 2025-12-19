import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation middleware
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validation rules for creating a product
 */
export const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),
  
  body('slug')
    .optional()
    .trim()
    .isSlug()
    .withMessage('Invalid slug format'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  
  body('category')
    .isIn(['Running', 'Lifestyle', 'Basketball', 'Classic', 'Limited Edition'])
    .withMessage('Invalid category'),
  
  body('gender')
    .isIn(['men', 'women', 'unisex'])
    .withMessage('Invalid gender. Must be one of: men, women, unisex'),
  
  body('image')
    .custom((value, { req }) => {
      // If file is uploaded, image is valid
      if (req.file) {
        return true;
      }
      // If no file and no value, it's invalid
      if (!value) {
        throw new Error('Product main image is required (upload file or provide URL)');
      }
      // If value is provided and it's a file path, allow it
      if (value.startsWith('/uploads/')) {
        return true;
      }
      // If it's a URL, validate it
      if (value.startsWith('http://') || value.startsWith('https://')) {
        try {
          new URL(value);
          return true;
        } catch {
          throw new Error('Image must be a valid URL');
        }
      }
      return true;
    }),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((images) => images.length <= 10)
    .withMessage('Cannot have more than 10 images'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  body('colors')
    .isArray({ min: 1 })
    .withMessage('Product must have at least one color'),
  
  body('colors.*')
    .trim()
    .notEmpty()
    .withMessage('Color cannot be empty'),
  
  body('sizes')
    .isArray({ min: 1 })
    .withMessage('Product must have at least one size'),
  
  body('sizes.*')
    .trim()
    .notEmpty()
    .withMessage('Size cannot be empty'),
  
  body('isNew')
    .optional()
    .isBoolean()
    .withMessage('isNew must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  body('reviewCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Review count must be a non-negative integer'),
  
  body('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock must be a boolean'),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  validate,
];

/**
 * Validation rules for updating a product
 */
export const validateUpdateProduct = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),
  
  body('slug')
    .optional()
    .trim()
    .isSlug()
    .withMessage('Invalid slug format'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  
  body('category')
    .optional()
    .isIn(['Running', 'Lifestyle', 'Basketball', 'Classic', 'Limited Edition'])
    .withMessage('Invalid category'),
  
  body('gender')
    .optional()
    .isIn(['men', 'women', 'unisex'])
    .withMessage('Invalid gender. Must be one of: men, women, unisex'),
  
  body('image')
    .optional()
    .custom((value, { req }) => {
      // Allow file uploads or URLs
      if (req.file) return true; // File uploaded
      if (!value) return true; // Optional for updates
      if (value.startsWith('/uploads/')) return true; // File path
      if (value.startsWith('http://') || value.startsWith('https://')) {
        try {
          new URL(value);
          return true;
        } catch {
          throw new Error('Image must be a valid URL');
        }
      }
      return true;
    }),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((images) => images.length <= 10)
    .withMessage('Cannot have more than 10 images'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  body('colors')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Product must have at least one color'),
  
  body('sizes')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Product must have at least one size'),
  
  body('isNew')
    .optional()
    .isBoolean()
    .withMessage('isNew must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  body('reviewCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Review count must be a non-negative integer'),
  
  body('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock must be a boolean'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  validate,
];

/**
 * Validation rules for product query parameters
 * Made more lenient to avoid validation errors on empty queries
 */
export const validateProductQuery = [
  query('category')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['Running', 'Lifestyle', 'Basketball', 'Classic', 'Limited Edition', 'all'])
    .withMessage('Invalid category'),
  
  query('gender')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['men', 'women', 'unisex', 'all'])
    .withMessage('Invalid gender'),
  
  query('colors')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      if (typeof value === 'string') return true;
      if (Array.isArray(value)) return true;
      return false;
    })
    .withMessage('Colors must be a string or array'),
  
  query('minPrice')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    })
    .withMessage('Min price must be a positive number'),
  
  query('maxPrice')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    })
    .withMessage('Max price must be a positive number'),
  
  query('onlyNew')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['true', 'false'])
    .withMessage('onlyNew must be true or false'),
  
  query('isFeatured')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['true', 'false'])
    .withMessage('isFeatured must be true or false'),
  
  query('sort')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['featured', 'price-asc', 'price-desc', 'newest', 'rating'])
    .withMessage('Invalid sort option'),
  
  query('page')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      const num = parseInt(value, 10);
      return !isNaN(num) && num >= 1;
    })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      const num = parseInt(value, 10);
      return !isNaN(num) && num >= 1 && num <= 1000;
    })
    .withMessage('Limit must be between 1 and 1000'),
  
  validate,
];

/**
 * Validation rules for slug parameter
 */
export const validateSlug = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid slug format'),
  
  validate,
];

/**
 * Validation rules for ID parameter
 */
export const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  validate,
];

