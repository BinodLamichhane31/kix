import User from '../models/User.model.js';
import Order from '../models/Order.model.js';

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user statistics
    const totalOrders = await Order.countDocuments({ user: userId });
    const deliveredOrders = await Order.find({
      user: userId,
      status: 'delivered',
    });
    const totalSpent = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        totalOrders,
        totalSpent,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use',
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get updated statistics
    const totalOrders = await Order.countDocuments({ user: userId });
    const deliveredOrders = await Order.find({
      user: userId,
      status: 'delivered',
    });
    const totalSpent = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...user.toObject(),
        totalOrders,
        totalSpent,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    const query = { role: 'user' }; // Only get regular users, not admins

    // Search filter
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalOrders = await Order.countDocuments({ user: user._id });
        const deliveredOrders = await Order.find({
          user: user._id,
          status: 'delivered',
        });
        const totalSpent = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

        return {
          ...user.toObject(),
          totalOrders,
          totalSpent,
        };
      })
    );

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID (Admin only)
 * @access  Private (Admin)
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user statistics
    const totalOrders = await Order.countDocuments({ user: userId });
    const deliveredOrders = await Order.find({
      user: userId,
      status: 'delivered',
    });
    const totalSpent = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        totalOrders,
        totalSpent,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   PUT /api/users/:userId/status
 * @desc    Update user status (Admin only)
 * @access  Private (Admin)
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value',
      });
    }

    // Prevent deactivating yourself
    if (req.user.id === userId && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get updated statistics
    const totalOrders = await Order.countDocuments({ user: userId });
    const deliveredOrders = await Order.find({
      user: userId,
      status: 'delivered',
    });
    const totalSpent = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        ...user.toObject(),
        totalOrders,
        totalSpent,
      },
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   GET /api/users/addresses
 * @desc    Get all addresses for current user
 * @access  Private
 */
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('addresses');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user.addresses || [],
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   POST /api/users/addresses
 * @desc    Add a new address for current user
 * @access  Private
 */
export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      label,
      firstName,
      lastName,
      email,
      phone,
      address,
      landmark,
      city,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // Validate required fields
    if (!label || !firstName || !lastName || !phone || !address || !city || !postalCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required address fields',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // If this is the first address, set it as default
    const shouldBeDefault = user.addresses.length === 0 || isDefault;

    const newAddress = {
      label,
      firstName,
      lastName,
      email: email || user.email,
      phone,
      address,
      landmark: landmark || '',
      city,
      postalCode,
      country,
      isDefault: shouldBeDefault,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses[user.addresses.length - 1],
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   PUT /api/users/addresses/:addressId
 * @desc    Update an address for current user
 * @access  Private
 */
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const {
      label,
      firstName,
      lastName,
      email,
      phone,
      address,
      landmark,
      city,
      postalCode,
      country,
      isDefault,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // If setting this as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach((addr, idx) => {
        if (idx !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    // Update address fields
    const addressToUpdate = user.addresses[addressIndex];
    if (label !== undefined) addressToUpdate.label = label;
    if (firstName !== undefined) addressToUpdate.firstName = firstName;
    if (lastName !== undefined) addressToUpdate.lastName = lastName;
    if (email !== undefined) addressToUpdate.email = email;
    if (phone !== undefined) addressToUpdate.phone = phone;
    if (address !== undefined) addressToUpdate.address = address;
    if (landmark !== undefined) addressToUpdate.landmark = landmark;
    if (city !== undefined) addressToUpdate.city = city;
    if (postalCode !== undefined) addressToUpdate.postalCode = postalCode;
    if (country !== undefined) addressToUpdate.country = country;
    if (isDefault !== undefined) addressToUpdate.isDefault = isDefault;

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: addressToUpdate,
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   DELETE /api/users/addresses/:addressId
 * @desc    Delete an address for current user
 * @access  Private
 */
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;

    user.addresses.splice(addressIndex, 1);

    // If deleted address was default and there are remaining addresses, set first one as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @route   PUT /api/users/addresses/:addressId/default
 * @desc    Set an address as default for current user
 * @access  Private
 */
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // Unset all defaults
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    // Set selected address as default
    user.addresses[addressIndex].isDefault = true;

    await user.save();

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: user.addresses[addressIndex],
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};





