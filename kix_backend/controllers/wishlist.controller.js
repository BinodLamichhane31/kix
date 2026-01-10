import Wishlist from '../models/Wishlist.model.js';

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name image price originalPrice slug category inStock stock rating reviewCount',
    });

    if (!wishlist) {
      try {
        wishlist = await Wishlist.create({ user: userId, items: [] });
      } catch (error) {
        // Handle duplicate key error (race condition)
        if (error.code === 11000) {
          wishlist = await Wishlist.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name image price originalPrice slug category inStock stock rating reviewCount',
          });
        } else {
          throw error;
        }
      }
    }

    res.json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   POST /api/wishlist/items
 * @desc    Add item to wishlist
 * @access  Private
 */
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      try {
        wishlist = await Wishlist.create({ user: userId, items: [] });
      } catch (error) {
        // Handle duplicate key error (race condition)
        if (error.code === 11000) {
          wishlist = await Wishlist.findOne({ user: userId });
          if (!wishlist) {
            throw new Error('Failed to create or find wishlist');
          }
        } else {
          throw error;
        }
      }
    }

    // Check if product already exists
    const alreadyExists = wishlist.hasItem(productId);
    if (alreadyExists) {
      // Update addedAt timestamp
      await wishlist.addItem(productId);
    } else {
      // Add new item
      await wishlist.addItem(productId);
    }

    // Populate product details
    await wishlist.populate({
      path: 'items.product',
      select: 'name image price originalPrice slug category inStock stock rating reviewCount',
    });

    res.json({
      success: true,
      message: 'Item added to wishlist',
      data: wishlist,
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   DELETE /api/wishlist/items/:productId
 * @desc    Remove item from wishlist
 * @access  Private
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    // Check if item exists
    if (!wishlist.hasItem(productId)) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist',
      });
    }

    // Remove item
    await wishlist.removeItem(productId);

    // Populate product details
    await wishlist.populate({
      path: 'items.product',
      select: 'name image price originalPrice slug category inStock stock rating reviewCount',
    });

    res.json({
      success: true,
      message: 'Item removed from wishlist',
      data: wishlist,
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/wishlist/check/:productId
 * @desc    Check if product is in wishlist
 * @access  Private
 */
export const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });
    const isInWishlist = wishlist ? wishlist.hasItem(productId) : false;

    res.json({
      success: true,
      isInWishlist,
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};





