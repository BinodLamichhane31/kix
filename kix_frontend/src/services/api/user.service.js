import { apiRequest } from './client.js';

/**
 * User API Service
 * Handles all user-related API calls
 */

/**
 * Get current user profile
 */
export const getProfile = async () => {
  try {
    const response = await apiRequest('/users/profile');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch profile');
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

/**
 * Update current user profile
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Admin: Get all users
 */
export const getAllUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) {
      params.append('page', filters.page);
    }
    
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    const queryString = params.toString();
    const response = await apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
    
    if (response.success) {
      return {
        data: response.data,
        pagination: response.pagination,
      };
    }
    
    throw new Error(response.message || 'Failed to fetch users');
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Admin: Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const response = await apiRequest(`/users/${userId}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'User not found');
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Admin: Update user status
 */
export const updateUserStatus = async (userId, isActive) => {
  try {
    const response = await apiRequest(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update user status');
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};




