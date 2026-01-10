import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';

/**
 * @route   POST /api/orders
 * @desc    Create new order from cart
 * @access  Private
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      shippingAddress,
      paymentMethod,
      paymentDetails,
      shippingMethod,
      promoCode,
      notes,
    } = req.body;

    // Validate required fields
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Validate stock and prepare order items
    const orderItems = [];
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      // Check if product still exists
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${cartItem.product} no longer exists`,
        });
      }

      // Check stock
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Prepare order item
      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.image,
        quantity: cartItem.quantity,
        size: cartItem.size,
        color: cartItem.color,
        price: cartItem.price,
        customization: cartItem.customization || null,
      });
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Calculate shipping fee
    const shippingOptions = {
      standard: 0,
      express: 12,
      priority: 24,
    };
    const shippingFee = shippingOptions[shippingMethod || cart.shippingMethod] || 0;

    // Calculate discount
    let discount = 0;
    const appliedPromoCode = promoCode || cart.promoCode;
    if (appliedPromoCode) {
      const promoRules = {
        KIX10: {
          label: '10% off your order',
          type: 'percent',
          value: 0.1,
        },
      };
      
      const promo = promoRules[appliedPromoCode.toUpperCase()];
      if (promo && promo.type === 'percent') {
        discount = subtotal * promo.value;
      }
    }

    const total = Math.max(subtotal - discount, 0) + shippingFee;

    // Generate unique order number
    let orderNumber;
    let isUnique = false;
    while (!isUnique) {
      orderNumber = Order.generateOrderNumber();
      const existingOrder = await Order.findOne({ orderNumber });
      if (!existingOrder) {
        isUnique = true;
      }
    }

    // Create order
    const order = await Order.create({
      orderNumber,
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid', // COD is pending, others are paid
      paymentDetails: paymentDetails || {},
      shippingMethod: shippingMethod || cart.shippingMethod || 'standard',
      shippingFee,
      subtotal,
      discount,
      promoCode: appliedPromoCode,
      total,
      status: 'pending',
      notes: notes || null,
    });

    // Update product stock
    for (const orderItem of orderItems) {
      await Product.findByIdAndUpdate(orderItem.product, {
        $inc: { stock: -orderItem.quantity },
      });
      
      // Update inStock status
      const updatedProduct = await Product.findById(orderItem.product);
      if (updatedProduct.stock <= 0) {
        updatedProduct.inStock = false;
        await updatedProduct.save();
      }
    }

    // Clear cart
    await cart.clear();

    // Populate order details
    await order.populate('items.product', 'name image price slug');
    await order.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('items.product', 'name image price slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get order by ID
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product', 'name image price slug')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/orders/number/:orderNumber
 * @desc    Get order by order number
 * @access  Private
 */
export const getOrderByNumber = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase(), user: userId })
      .populate('items.product', 'name image price slug')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   PUT /api/orders/:orderId/cancel
 * @desc    Cancel order
 * @access  Private
 */
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Only allow cancellation if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
      
      // Update inStock status
      const product = await Product.findById(item.product);
      if (product.stock > 0) {
        product.inStock = true;
        await product.save();
      }
    }

    // Update order status
    order.status = 'cancelled';
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (Admin only)
 * @access  Private (Admin)
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by order number, customer name, or email
    if (search && search.trim()) {
      // First, find users matching the search
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
        ],
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : []),
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('items.product', 'name image price slug')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/orders/admin/:orderId
 * @desc    Get order by ID (Admin only)
 * @access  Private (Admin)
 */
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('items.product', 'name image price slug')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   PUT /api/orders/admin/:orderId/status
 * @desc    Update order status (Admin only)
 * @access  Private (Admin)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update status
    order.status = status;

    // Set tracking number if provided and status is shipped
    if (status === 'shipped' && trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    // Set delivered date if status is delivered
    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();
    await order.populate('items.product', 'name image price slug');
    await order.populate('user', 'name email');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};




