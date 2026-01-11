import mongoose from 'mongoose';
import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import { logAudit, getIpAddress, getUserAgent, generateRequestId } from '../utils/auditLogger.js';

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

    // Get user for audit logging
    const user = await User.findById(userId).select('name email');
    const requestId = generateRequestId();
    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);

    // Determine payment status based on payment method
    // For eSewa and card, payment is PENDING until verified
    // For COD, payment is PENDING until delivered
    let paymentStatus = 'pending';
    if (paymentMethod === 'cod') {
      paymentStatus = 'pending';
    } else if (paymentMethod === 'esewa' || paymentMethod === 'card') {
      // Payment methods that require verification start as PENDING
      paymentStatus = 'pending';
    }

    // Create order with PENDING payment status
    // Financial values are locked and immutable once order is created
    const order = await Order.create({
      orderNumber,
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: paymentStatus,
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

    // IMPORTANT: For eSewa and card payments, DO NOT deduct stock yet
    // Stock will be deducted only after payment verification
    // For COD, we deduct stock immediately as payment is on delivery
    if (paymentMethod === 'cod') {
      // Update product stock for COD
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

      // Clear cart for COD
    await cart.clear();
    }
    // For eSewa and card: Stock deduction happens after payment verification
    // Cart will be cleared after successful payment verification

    // Log order creation
    await logAudit({
      action: 'ORDER_CREATED',
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: userId,
      userEmail: user.email,
      paymentMethod: paymentMethod || 'card',
      amount: total,
      newStatus: 'pending',
      newPaymentStatus: paymentStatus,
      ipAddress,
      userAgent,
      requestId,
      success: true,
      metadata: {
        itemsCount: orderItems.length,
        shippingMethod: shippingMethod || cart.shippingMethod || 'standard',
        promoCode: appliedPromoCode,
      },
    });

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
    const adminId = req.user.id;

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

    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // SECURITY: Prevent status updates if payment is not verified
    if (order.paymentMethod !== 'cod' && order.paymentStatus !== 'paid' && status !== 'pending' && status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update order status until payment is verified and marked as paid',
      });
    }

    const previousStatus = order.status;

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

    // Log admin action
    await logAudit({
      action: 'ORDER_STATUS_UPDATED',
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: adminId,
      userEmail: req.user.email || 'admin',
      paymentMethod: order.paymentMethod,
      previousStatus,
      newStatus: status,
      previousPaymentStatus: order.paymentStatus,
      newPaymentStatus: order.paymentStatus,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      requestId: generateRequestId(),
      success: true,
      metadata: {
        trackingNumber: trackingNumber || null,
        updatedBy: 'admin',
      },
    });

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

/**
 * @route   POST /api/orders/:orderId/payment/esewa/initiate
 * @desc    Initiate eSewa payment for an existing order
 * @access  Private
 */
export const initiateEsewaPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Import eSewa service
    const { generateTransactionId, generateProductCode, buildPaymentUrl, isConfigured } = await import('../utils/esewa.service.js');

    // Check if eSewa is configured
    if (!isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'eSewa payment gateway is not configured',
      });
    }

    // Find order
    const order = await Order.findOne({ _id: orderId, user: userId }).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Validate order state
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }

    if (order.paymentStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order payment has been cancelled',
      });
    }

    if (order.paymentMethod !== 'esewa') {
      return res.status(400).json({
        success: false,
        message: 'Order is not configured for eSewa payment',
      });
    }

    // Check if order already has a pending transaction
    if (order.paymentDetails?.esewaTransactionId && order.paymentStatus === 'pending') {
      // Return existing payment URL if transaction exists
      const paymentUrl = buildPaymentUrl({
        transactionId: order.paymentDetails.esewaTransactionId,
        amount: order.total,
        productCode: order.paymentDetails.esewaProductCode,
        orderNumber: order.orderNumber,
      });

      return res.json({
        success: true,
        message: 'Payment already initiated',
        data: {
          paymentUrl: paymentUrl.url,
          formData: paymentUrl.formData,
        },
      });
    }

    // Generate new transaction ID
    const transactionId = generateTransactionId();
    // Use order number as product code (eSewa prefers shorter, simpler codes)
    const productCode = generateProductCode(order.orderNumber);

    // Update order with payment details
    order.paymentDetails = {
      ...order.paymentDetails,
      esewaTransactionId: transactionId,
      esewaProductCode: productCode,
      esewaAmount: order.total, // Lock amount at payment initiation
    };
    order.paymentStatus = 'pending';
    await order.save();

    // Build payment URL with error handling
    let paymentUrl;
    try {
      paymentUrl = buildPaymentUrl({
        transactionId,
        amount: order.total,
        productCode,
        orderNumber: order.orderNumber,
      });
    } catch (buildError) {
      console.error('Error building eSewa payment URL:', buildError);
      console.error('Build error details:', {
        transactionId,
        amount: order.total,
        productCode,
        orderNumber: order.orderNumber,
      });
      
      await logAudit({
        action: 'PAYMENT_INITIATED',
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: userId,
        userEmail: order.user?.email,
        paymentMethod: 'esewa',
        transactionId,
        amount: order.total,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        requestId: generateRequestId(),
        success: false,
        errorMessage: `Failed to build payment URL: ${buildError.message}`,
        errorCode: 'PAYMENT_URL_BUILD_ERROR',
      });

      return res.status(500).json({
        success: false,
        message: `Failed to build payment URL: ${buildError.message}. Please verify your eSewa configuration in .env file.`,
        error: buildError.message,
      });
    }

    // Validate payment URL was created
    if (!paymentUrl || !paymentUrl.url || !paymentUrl.formData || !paymentUrl.formData.signature) {
      const errorMsg = 'Invalid payment URL response - missing required fields';
      console.error(errorMsg, paymentUrl);
      
      await logAudit({
        action: 'PAYMENT_INITIATED',
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: userId,
        userEmail: order.user?.email,
        paymentMethod: 'esewa',
        transactionId,
        amount: order.total,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        requestId: generateRequestId(),
        success: false,
        errorMessage: errorMsg,
        errorCode: 'INVALID_PAYMENT_URL',
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to generate payment URL. Please check your eSewa configuration.',
      });
    }

    // Log payment initiation
    await logAudit({
      action: 'PAYMENT_INITIATED',
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: userId,
      userEmail: order.user.email,
      paymentMethod: 'esewa',
      transactionId,
      amount: order.total,
      previousPaymentStatus: 'pending',
      newPaymentStatus: 'pending',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      requestId: generateRequestId(),
      success: true,
      metadata: {
        productCode,
        paymentUrl: paymentUrl.url,
        merchantId: paymentUrl.merchantId,
        hasSignature: !!paymentUrl.formData.signature,
      },
    });

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        paymentUrl: paymentUrl.url,
        formData: paymentUrl.formData,
        transactionId,
      },
    });
  } catch (error) {
    console.error('Error initiating eSewa payment:', error);
    console.error('Error stack:', error.stack);
    
    await logAudit({
      action: 'PAYMENT_INITIATED',
      orderId: req.params.orderId,
      orderNumber: 'unknown',
      userId: req.user?.id,
      userEmail: req.user?.email,
      paymentMethod: 'esewa',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      requestId: generateRequestId(),
      success: false,
      errorMessage: error.message || 'Unknown error',
      errorCode: 'PAYMENT_INITIATION_ERROR',
    });

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment. Please check your eSewa configuration and try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   POST /api/payments/esewa/callback
 * @desc    Handle eSewa payment callback (success/failure)
 * @access  Public (called by eSewa, but must verify signature)
 * @note    This endpoint must be idempotent and verify payments
 */
export const handleEsewaCallback = async (req, res) => {
  try {
    const callbackData = req.body || req.query; // eSewa sends as POST body or GET query
    const { transaction_uuid, product_code, total_amount, status, referenceId } = callbackData;

    // Import eSewa service
    const { validateCallback, verifyPayment } = await import('../utils/esewa.service.js');

    // Validate callback parameters
    if (!transaction_uuid || !product_code || total_amount === undefined) {
      await logAudit({
        action: 'PAYMENT_FAILED',
        orderId: null,
        orderNumber: 'unknown',
        userId: null,
        userEmail: 'unknown',
        paymentMethod: 'esewa',
        transactionId: transaction_uuid || 'unknown',
        amount: total_amount ? parseFloat(total_amount) : null,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        requestId: generateRequestId(),
        success: false,
        errorMessage: 'Missing required callback parameters',
        errorCode: 'INVALID_CALLBACK',
      });

      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?status=failed&error=invalid_callback`);
    }

    // Find order by transaction ID
    const order = await Order.findOne({
      'paymentDetails.esewaTransactionId': transaction_uuid,
    }).populate('user', 'name email');

    if (!order) {
      await logAudit({
        action: 'PAYMENT_FAILED',
        orderId: null,
        orderNumber: 'unknown',
        userId: null,
        userEmail: 'unknown',
        paymentMethod: 'esewa',
        transactionId: transaction_uuid,
        amount: parseFloat(total_amount),
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        requestId: generateRequestId(),
        success: false,
        errorMessage: 'Order not found for transaction',
        errorCode: 'ORDER_NOT_FOUND',
      });

      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?status=failed&error=order_not_found`);
    }

    // Validate callback data matches order
    const validation = validateCallback(callbackData, order);
    if (!validation.valid) {
      await logAudit({
        action: 'PAYMENT_FAILED',
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: order.user._id,
        userEmail: order.user.email,
        paymentMethod: 'esewa',
        transactionId: transaction_uuid,
        amount: parseFloat(total_amount),
        previousPaymentStatus: order.paymentStatus,
        newPaymentStatus: order.paymentStatus,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        requestId: generateRequestId(),
        success: false,
        errorMessage: `Validation failed: ${validation.errors.join(', ')}`,
        errorCode: 'VALIDATION_FAILED',
        metadata: { validationErrors: validation.errors },
      });

      // Update order to failed if callback indicates failure
      if (status === 'FAILURE' || status === 'CANCELLED') {
        order.paymentStatus = 'failed';
        await order.save();
      }

      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?status=failed&orderId=${order._id}&error=validation_failed`);
    }

    // IDEMPOTENCY CHECK: If payment already verified and marked as paid, return success
    if (order.paymentStatus === 'paid' && order.paymentDetails?.verifiedAt) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?status=success&orderId=${order._id}&alreadyPaid=true`);
    }

    // Handle failure/cancellation
    if (status === 'FAILURE' || status === 'CANCELLED' || status === 'PENDING') {
      // Use atomic update to prevent race conditions
      const updateResult = await Order.findOneAndUpdate(
        {
          _id: order._id,
          paymentStatus: 'pending', // Only update if still pending
        },
        {
          $set: {
            paymentStatus: 'failed',
            'paymentDetails.esewaReferenceId': referenceId || null,
            'paymentDetails.verificationAttempts': (order.paymentDetails?.verificationAttempts || 0) + 1,
            'paymentDetails.lastVerificationAttempt': new Date(),
          },
        },
        { new: true }
      );

      if (updateResult) {
        await logAudit({
          action: 'PAYMENT_FAILED',
          orderId: order._id,
          orderNumber: order.orderNumber,
          userId: order.user._id,
          userEmail: order.user.email,
          paymentMethod: 'esewa',
          transactionId: transaction_uuid,
          amount: parseFloat(total_amount),
          previousPaymentStatus: 'pending',
          newPaymentStatus: 'failed',
          ipAddress: getIpAddress(req),
          userAgent: getUserAgent(req),
          requestId: generateRequestId(),
          success: false,
          errorMessage: `Payment ${status}`,
          errorCode: status,
          metadata: { referenceId: referenceId || null },
        });
      }

      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?status=failed&orderId=${order._id}`);
    }

    // Handle success - MUST VERIFY before trusting
    if (status === 'SUCCESS' || status === 'COMPLETE') {
      // Verify payment with eSewa API (verify-before-trust)
      const verification = await verifyPayment({
        transactionId: transaction_uuid,
        productCode: product_code,
        totalAmount: order.total, // Pass order total for verification
      });

      if (!verification.verified) {
        // Verification failed - mark as failed
        order.paymentStatus = 'failed';
        order.paymentDetails.esewaReferenceId = referenceId || null;
        order.paymentDetails.verificationAttempts = (order.paymentDetails?.verificationAttempts || 0) + 1;
        order.paymentDetails.lastVerificationAttempt = new Date();

        await order.save();

        await logAudit({
          action: 'VERIFICATION_FAILED',
          orderId: order._id,
          orderNumber: order.orderNumber,
          userId: order.user._id,
          userEmail: order.user.email,
          paymentMethod: 'esewa',
          transactionId: transaction_uuid,
          amount: parseFloat(total_amount),
          previousPaymentStatus: 'pending',
          newPaymentStatus: 'failed',
          ipAddress: getIpAddress(req),
          userAgent: getUserAgent(req),
          requestId: generateRequestId(),
          success: false,
          errorMessage: verification.error || 'Payment verification failed',
          errorCode: 'VERIFICATION_FAILED',
          metadata: { referenceId: referenceId || null, verificationData: verification.data },
        });

        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?status=failed&orderId=${order._id}&error=verification_failed`);
      }

      // Payment verified - use atomic update with transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const orderInTransaction = await Order.findById(order._id).session(session);
        
        if (!orderInTransaction) {
          await session.abortTransaction();
          session.endSession();
          throw new Error('Order not found in transaction');
        }

        // Double-check idempotency within transaction
        if (orderInTransaction.paymentStatus === 'paid') {
          await session.abortTransaction();
          session.endSession();
          return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?status=success&orderId=${order._id}&alreadyPaid=true`);
        }

        // Update order atomically
        orderInTransaction.paymentStatus = 'paid';
        orderInTransaction.paymentDetails.esewaReferenceId = referenceId || null;
        orderInTransaction.paymentDetails.verifiedAt = new Date();
        orderInTransaction.paymentDetails.verificationAttempts = (orderInTransaction.paymentDetails?.verificationAttempts || 0) + 1;
        orderInTransaction.paymentDetails.lastVerificationAttempt = new Date();
        orderInTransaction.status = 'confirmed';

        await orderInTransaction.save({ session });

        // Deduct stock only after payment verification (atomic operation)
        for (const item of orderInTransaction.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          }, { session });

          const updatedProduct = await Product.findById(item.product).session(session);
          if (updatedProduct && updatedProduct.stock <= 0) {
            updatedProduct.inStock = false;
            await updatedProduct.save({ session });
          }
        }

        // Clear user's cart after successful payment
        const userCart = await Cart.findOne({ user: order.user._id }).session(session);
        if (userCart) {
          userCart.items = [];
          userCart.promoCode = null;
          await userCart.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        // Log successful payment
        await logAudit({
          action: 'PAYMENT_SUCCESS',
          orderId: order._id,
          orderNumber: order.orderNumber,
          userId: order.user._id,
          userEmail: order.user.email,
          paymentMethod: 'esewa',
          transactionId: transaction_uuid,
          amount: parseFloat(total_amount),
          previousPaymentStatus: 'pending',
          newPaymentStatus: 'paid',
          previousStatus: 'pending',
          newStatus: 'confirmed',
          ipAddress: getIpAddress(req),
          userAgent: getUserAgent(req),
          requestId: generateRequestId(),
          success: true,
          metadata: { referenceId: referenceId || null, verifiedAt: new Date() },
        });

        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?status=success&orderId=${order._id}`);

      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }

    // Unknown status
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?status=failed&orderId=${order._id}&error=unknown_status`);

  } catch (error) {
    console.error('Error handling eSewa callback:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?status=failed&error=server_error`);
  }
};

/**
 * @route   POST /api/orders/:orderId/payment/esewa/verify
 * @desc    Manually trigger payment verification (for retry scenarios)
 * @access  Private
 */
export const verifyEsewaPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Import eSewa service
    const { verifyPayment } = await import('../utils/esewa.service.js');

    // Find order
    const order = await Order.findOne({ _id: orderId, user: userId }).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.paymentMethod !== 'esewa') {
      return res.status(400).json({
        success: false,
        message: 'Order is not configured for eSewa payment',
      });
    }

    if (!order.paymentDetails?.esewaTransactionId) {
      return res.status(400).json({
        success: false,
        message: 'No transaction ID found for this order',
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.json({
        success: true,
        message: 'Payment already verified and marked as paid',
        data: {
          paymentStatus: order.paymentStatus,
          verifiedAt: order.paymentDetails?.verifiedAt,
        },
      });
    }

    // Verify payment with eSewa
    const verification = await verifyPayment({
      transactionId: order.paymentDetails.esewaTransactionId,
      productCode: order.paymentDetails.esewaProductCode,
      totalAmount: order.total, // Pass order total for verification
    });

    // Update verification attempts
    order.paymentDetails.verificationAttempts = (order.paymentDetails?.verificationAttempts || 0) + 1;
    order.paymentDetails.lastVerificationAttempt = new Date();

    if (verification.verified) {
      // Use atomic update
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const orderInTransaction = await Order.findById(orderId).session(session);
        
        if (orderInTransaction.paymentStatus === 'paid') {
          await session.abortTransaction();
          session.endSession();
          return res.json({
            success: true,
            message: 'Payment already verified (concurrent update)',
            data: { paymentStatus: 'paid' },
          });
        }

        orderInTransaction.paymentStatus = 'paid';
        orderInTransaction.paymentDetails.verifiedAt = new Date();
        orderInTransaction.status = 'confirmed';

        await orderInTransaction.save({ session });

        // Deduct stock
        for (const item of orderInTransaction.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          }).session(session);
        }

        await session.commitTransaction();
        session.endSession();

        await logAudit({
          action: 'PAYMENT_VERIFIED',
          orderId: order._id,
          orderNumber: order.orderNumber,
          userId: userId,
          userEmail: order.user.email,
          paymentMethod: 'esewa',
          transactionId: order.paymentDetails.esewaTransactionId,
          amount: order.total,
          previousPaymentStatus: 'pending',
          newPaymentStatus: 'paid',
          ipAddress: getIpAddress(req),
          userAgent: getUserAgent(req),
          requestId: generateRequestId(),
          success: true,
        });

        return res.json({
          success: true,
          message: 'Payment verified successfully',
          data: { paymentStatus: 'paid', verifiedAt: new Date() },
        });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } else {
      await order.save();

      await logAudit({
        action: 'VERIFICATION_ATTEMPT',
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: userId,
        userEmail: order.user.email,
        paymentMethod: 'esewa',
        transactionId: order.paymentDetails.esewaTransactionId,
        amount: order.total,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        requestId: generateRequestId(),
        success: false,
        errorMessage: verification.error || 'Verification failed',
        errorCode: 'VERIFICATION_FAILED',
      });

      return res.status(400).json({
        success: false,
        message: verification.error || 'Payment verification failed',
        data: { paymentStatus: order.paymentStatus },
      });
    }
  } catch (error) {
    console.error('Error verifying eSewa payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};





