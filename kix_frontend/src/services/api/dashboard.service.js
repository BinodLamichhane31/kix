import { apiRequest } from './client.js';

/**
 * Dashboard API Service
 * Handles all dashboard-related API calls
 */

/**
 * Get user dashboard statistics
 */
export const getUserStats = async () => {
  try {
    const response = await apiRequest('/dashboard/stats');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch dashboard statistics');
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async () => {
  try {
    const response = await apiRequest('/dashboard/admin/stats');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch dashboard statistics');
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};




