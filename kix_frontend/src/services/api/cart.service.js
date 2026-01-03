import { apiRequest } from './client.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050/api';

/**
 * Cart API Service
 * Handles all cart-related API calls
 */

/**
 * Transform cart data - convert relative image paths to full URLs
 */
const transformCart = (cart) => {
  if (!cart) return null;

  const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5050';

  // Transform cart items
  if (cart.items && Array.isArray(cart.items)) {
    cart.items = cart.items.map((item) => {
      if (item.product && item.product.image) {
        // Convert relative image paths to full URLs
        if (item.product.image.startsWith('/uploads/')) {
          item.product.image = `${API_BASE}${item.product.image}`;
        }
      }
      return item;
    });
  }

  return cart;
};

/**
 * Get user's cart
 */
export const getCart = async () => {
  try {
    const response = await apiRequest('/cart');
    
    if (response.success) {
      return transformCart(response.data);
    }
    
    throw new Error(response.message || 'Failed to fetch cart');
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

/**
 * Add item to cart
 */
export const addItemToCart = async (itemData) => {
  try {
    const response = await apiRequest('/cart/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    
    if (response.success) {
      return transformCart(response.data);
    }
    
    throw new Error(response.message || 'Failed to add item to cart');
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

/**
 * Update item quantity in cart
 */
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await apiRequest(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    
    if (response.success) {
      return transformCart(response.data);
    }
    
    throw new Error(response.message || 'Failed to update cart item');
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (itemId) => {
  try {
    const response = await apiRequest(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    
    if (response.success) {
      return transformCart(response.data);
    }
    
    throw new Error(response.message || 'Failed to remove cart item');
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};

/**
 * Apply promo code
 */
export const applyPromoCode = async (promoCode) => {
  try {
    const response = await apiRequest('/cart/promo', {
      method: 'PUT',
      body: JSON.stringify({ promoCode }),
    });
    
    if (response.success) {
      return transformCart(response.data);
    }
    
    throw new Error(response.message || 'Failed to apply promo code');
  } catch (error) {
    console.error('Error applying promo code:', error);
    throw error;
  }
};

/**
 * Update shipping method
 */
export const updateShippingMethod = async (shippingMethod) => {
  try {
    const response = await apiRequest('/cart/shipping', {
      method: 'PUT',
      body: JSON.stringify({ shippingMethod }),
    });
    
    if (response.success) {
      return transformCart(response.data);
    }
    
    throw new Error(response.message || 'Failed to update shipping method');
  } catch (error) {
    console.error('Error updating shipping method:', error);
    throw error;
  }
};

/**
 * Clear cart
 */
export const clearCart = async () => {
  try {
    const response = await apiRequest('/cart', {
      method: 'DELETE',
    });
    
    if (response.success) {
      return transformCart(response.data);
    }
    
    throw new Error(response.message || 'Failed to clear cart');
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};


