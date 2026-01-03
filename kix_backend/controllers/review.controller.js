import Review from '../models/Review.model.js';
import Product from '../models/Product.model.js';

/**
 * Helper function to recalculate product rating and review count
 */
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
    reviewCount,
  });
};

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, title, comment } = req.body;

    // Validate required fields
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, rating, and comment are required',
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product. You can update your existing review.',
      });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      product: productId,
      rating: parseInt(rating),
      title: title?.trim() || null,
      comment: comment.trim(),
    });

    // Update product rating and review count
    await updateProductRating(productId);

    // Populate user details
    await review.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error.code === 11000 || error.name === 'DuplicateReviewError') {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get all reviews for a product
 * @access  Public
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Build sort object
    let sortObject = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortObject = { createdAt: 1 };
    } else if (sort === 'highest') {
      sortObject = { rating: -1, createdAt: -1 };
    } else if (sort === 'lowest') {
      sortObject = { rating: 1, createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name email')
      .sort(sortObject)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments({ product: productId });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/reviews/user
 * @desc    Get current user's reviews
 * @access  Private
 */
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ user: userId })
      .populate('product', 'name image slug price')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments({ user: userId });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/reviews/:reviewId
 * @desc    Get a single review by ID
 * @access  Public
 */
export const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId)
      .populate('user', 'name email')
      .populate('product', 'name image slug');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Update a review (only by the review owner)
 * @access  Private
 */
export const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews',
      });
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }
      review.rating = parseInt(rating);
    }

    if (title !== undefined) {
      review.title = title?.trim() || null;
    }

    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Comment cannot be empty',
        });
      }
      review.comment = comment.trim();
    }

    await review.save();

    // Update product rating and review count
    await updateProductRating(review.product);

    // Populate user details
    await review.populate('user', 'name email');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete a review (only by the review owner or admin)
 * @access  Private
 */
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews',
      });
    }

    const productId = review.product;

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    // Update product rating and review count
    await updateProductRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/reviews/check/:productId
 * @desc    Check if current user has reviewed a product
 * @access  Private
 */
export const checkUserReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const review = await Review.findOne({
      user: userId,
      product: productId,
    }).populate('user', 'name email');

    if (review) {
      res.json({
        success: true,
        hasReviewed: true,
        data: review,
      });
    } else {
      res.json({
        success: true,
        hasReviewed: false,
        data: null,
      });
    }
  } catch (error) {
    console.error('Error checking user review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
