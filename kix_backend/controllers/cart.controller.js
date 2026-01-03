import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name image price slug');

    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = await Cart.create({ user: userId, items: [] });
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private
 */
export const addItemToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, size, color, customization } = req.body;

    // Validate required fields
    if (!productId || !quantity || !size || !color) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, quantity, size, and color are required',
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

    // Validate size
    if (!product.sizes.includes(size)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid size for this product',
      });
    }

    // Validate color (skip validation if customization is provided - custom designs)
    if (!customization && !product.colors.includes(color)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid color for this product',
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Prepare item data
    const itemData = {
      product: productId,
      quantity: parseInt(quantity),
      size,
      color,
      price: product.price,
      customization: customization || null,
    };

    // Add item to cart
    await cart.addItem(itemData);

    // Populate product details
    await cart.populate('items.product', 'name image price slug');

    res.json({
      success: true,
      message: 'Item added to cart',
      data: cart,
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update item quantity in cart
 * @access  Private
 */
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required',
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    // Check stock if increasing quantity
    if (quantity > item.quantity) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const additionalQuantity = quantity - item.quantity;
      if (product.stock < additionalQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock',
        });
      }
    }

    await cart.updateItemQuantity(itemId, quantity);
    await cart.populate('items.product', 'name image price slug');

    res.json({
      success: true,
      message: 'Cart item updated',
      data: cart,
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    await cart.removeItem(itemId);
    await cart.populate('items.product', 'name image price slug');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   PUT /api/cart/promo
 * @desc    Apply promo code to cart
 * @access  Private
 */
export const applyPromoCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { promoCode } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Simple promo code validation (you can expand this)
    const promoRules = {
      KIX10: {
        label: '10% off your order',
        type: 'percent',
        value: 0.1,
      },
    };

    if (!promoCode || !promoRules[promoCode.toUpperCase()]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid promo code',
      });
    }

    cart.promoCode = promoCode.toUpperCase();
    await cart.save();
    await cart.populate('items.product', 'name image price slug');

    res.json({
      success: true,
      message: 'Promo code applied',
      data: cart,
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply promo code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   PUT /api/cart/shipping
 * @desc    Update shipping method
 * @access  Private
 */
export const updateShippingMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingMethod } = req.body;

    if (!['standard', 'express', 'priority'].includes(shippingMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping method',
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.shippingMethod = shippingMethod;
    await cart.save();
    await cart.populate('items.product', 'name image price slug');

    res.json({
      success: true,
      message: 'Shipping method updated',
      data: cart,
    });
  } catch (error) {
    console.error('Error updating shipping method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shipping method',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    await cart.clear();

    res.json({
      success: true,
      message: 'Cart cleared',
      data: cart,
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


