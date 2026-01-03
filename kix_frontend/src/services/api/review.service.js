import { apiRequest } from './client.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050/api';

/**
 * Review API Service
 * Handles all review-related API calls
 */

/**
 * Create a new review
 */
export const createReview = async (reviewData) => {
  try {
    const response = await apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create review');
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

/**
 * Get reviews for a product
 */
export const getProductReviews = async (productId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) {
      params.append('page', filters.page);
    }
    
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    
    if (filters.sort) {
      params.append('sort', filters.sort); // newest, oldest, highest, lowest
    }
    
    const queryString = params.toString();
    const response = await apiRequest(`/reviews/product/${productId}${queryString ? `?${queryString}` : ''}`);
    
    if (response.success) {
      return {
        data: response.data,
        pagination: response.pagination,
      };
    }
    
    throw new Error(response.message || 'Failed to fetch reviews');
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

/**
 * Get current user's reviews
 */
export const getUserReviews = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) {
      params.append('page', filters.page);
    }
    
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    
    const queryString = params.toString();
    const response = await apiRequest(`/reviews/user${queryString ? `?${queryString}` : ''}`);
    
    if (response.success) {
      return {
        data: response.data,
        pagination: response.pagination,
      };
    }
    
    throw new Error(response.message || 'Failed to fetch reviews');
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

/**
 * Get a single review by ID
 */
export const getReviewById = async (reviewId) => {
  try {
    const response = await apiRequest(`/reviews/${reviewId}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Review not found');
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

/**
 * Update a review
 */
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await apiRequest(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update review');
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await apiRequest(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
    
    if (response.success) {
      return true;
    }
    
    throw new Error(response.message || 'Failed to delete review');
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

/**
 * Check if current user has reviewed a product
 */
export const checkUserReview = async (productId) => {
  try {
    const response = await apiRequest(`/reviews/check/${productId}`);
    
    if (response.success) {
      return {
        hasReviewed: response.hasReviewed,
        review: response.data,
      };
    }
    
    throw new Error(response.message || 'Failed to check review');
  } catch (error) {
    // If user is not authenticated, return hasReviewed: false
    if (error.message.includes('Authentication') || error.message.includes('401')) {
      return { hasReviewed: false, review: null };
    }
    console.error('Error checking user review:', error);
    throw error;
  }
};
