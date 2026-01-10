import { apiRequest } from './client.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050/api';

/**
 * Wishlist API Service
 * Handles all wishlist-related API calls
 */

/**
 * Transform wishlist data - convert relative image paths to full URLs
 */
const transformWishlist = (wishlist) => {
  if (!wishlist) return null;

  const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5050';

  // Transform wishlist items
  if (wishlist.items && Array.isArray(wishlist.items)) {
    wishlist.items = wishlist.items.map((item) => {
      if (item.product && item.product.image) {
        // Convert relative image paths to full URLs
        if (item.product.image.startsWith('/uploads/')) {
          item.product.image = `${API_BASE}${item.product.image}`;
        }
      }
      return item;
    });
  }

  return wishlist;
};

/**
 * Get user's wishlist
 */
export const getWishlist = async () => {
  try {
    const response = await apiRequest('/wishlist');
    
    if (response.success) {
      return transformWishlist(response.data);
    }
    
    throw new Error(response.message || 'Failed to fetch wishlist');
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

/**
 * Add item to wishlist
 */
export const addToWishlist = async (productId) => {
  try {
    const response = await apiRequest('/wishlist/items', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    
    if (response.success) {
      return transformWishlist(response.data);
    }
    
    throw new Error(response.message || 'Failed to add to wishlist');
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Remove item from wishlist
 */
export const removeFromWishlist = async (productId) => {
  try {
    const response = await apiRequest(`/wishlist/items/${productId}`, {
      method: 'DELETE',
    });
    
    if (response.success) {
      return transformWishlist(response.data);
    }
    
    throw new Error(response.message || 'Failed to remove from wishlist');
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Check if product is in wishlist
 */
export const checkWishlist = async (productId) => {
  try {
    const response = await apiRequest(`/wishlist/check/${productId}`);
    
    if (response.success) {
      return response.isInWishlist;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};





