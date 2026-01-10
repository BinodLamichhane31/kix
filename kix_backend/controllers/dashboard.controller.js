import Order from '../models/Order.model.js';
import Wishlist from '../models/Wishlist.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import Review from '../models/Review.model.js';

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get user dashboard statistics
 * @access  Private
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total orders count
    const totalOrders = await Order.countDocuments({ user: userId });

    // Get pending orders count
    const pendingOrders = await Order.countDocuments({
      user: userId,
      status: { $in: ['pending', 'confirmed', 'processing'] },
    });

    // Get total spent (sum of all delivered orders)
    const deliveredOrders = await Order.find({
      user: userId,
      status: 'delivered',
    });
    const totalSpent = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

    // Get wishlist items count
    const wishlist = await Wishlist.findOne({ user: userId });
    const wishlistItems = wishlist ? wishlist.items.length : 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        totalSpent,
        wishlistItems,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/dashboard/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin)
 */
export const getAdminStats = async (req, res) => {
  try {
    // Get total revenue (sum of all delivered orders)
    const deliveredOrders = await Order.find({ status: 'delivered' });
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

    // Get total orders count
    const totalOrders = await Order.countDocuments();

    // Get total users count
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get order status counts
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'processing'] },
    });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Calculate growth (comparing last 30 days with previous 30 days)
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Revenue growth
    const recentRevenue = await Order.find({
      status: 'delivered',
      createdAt: { $gte: last30Days },
    });
    const previousRevenue = await Order.find({
      status: 'delivered',
      createdAt: { $gte: last60Days, $lt: last30Days },
    });
    const recentRevenueSum = recentRevenue.reduce((sum, order) => sum + order.total, 0);
    const previousRevenueSum = previousRevenue.reduce((sum, order) => sum + order.total, 0);
    const revenueGrowth =
      previousRevenueSum > 0
        ? ((recentRevenueSum - previousRevenueSum) / previousRevenueSum) * 100
        : 0;

    // Order growth
    const recentOrdersCount = await Order.countDocuments({
      createdAt: { $gte: last30Days },
    });
    const previousOrdersCount = await Order.countDocuments({
      createdAt: { $gte: last60Days, $lt: last30Days },
    });
    const orderGrowth =
      previousOrdersCount > 0
        ? ((recentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100
        : 0;

    // User growth
    const recentUsersCount = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: last30Days },
    });
    const previousUsersCount = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: last60Days, $lt: last30Days },
    });
    const userGrowth =
      previousUsersCount > 0
        ? ((recentUsersCount - previousUsersCount) / previousUsersCount) * 100
        : 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        orderGrowth: Math.round(orderGrowth * 10) / 10,
        userGrowth: Math.round(userGrowth * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};




