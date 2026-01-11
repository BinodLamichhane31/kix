import { apiRequest } from './client.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050/api';

/**
 * Order API Service
 * Handles all order-related API calls
 */

/**
 * Create new order from cart
 */
export const createOrder = async (orderData) => {
  try {
    const response = await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create order');
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get user's orders
 */
export const getOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    if (filters.page) {
      params.append('page', filters.page);
    }
    
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    
    const queryString = params.toString();
    const response = await apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
    
    if (response.success) {
      return {
        data: response.data,
        pagination: response.pagination,
      };
    }
    
    throw new Error(response.message || 'Failed to fetch orders');
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await apiRequest(`/orders/${orderId}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Order not found');
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

/**
 * Get order by order number
 */
export const getOrderByNumber = async (orderNumber) => {
  try {
    const response = await apiRequest(`/orders/number/${orderNumber}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Order not found');
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId) => {
  try {
    const response = await apiRequest(`/orders/${orderId}/cancel`, {
      method: 'PUT',
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to cancel order');
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

/**
 * Admin: Get all orders
 */
export const getAllOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    if (filters.page) {
      params.append('page', filters.page);
    }
    
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    const queryString = params.toString();
    const response = await apiRequest(`/orders/admin/all${queryString ? `?${queryString}` : ''}`);
    
    if (response.success) {
      return {
        data: response.data,
        pagination: response.pagination,
      };
    }
    
    throw new Error(response.message || 'Failed to fetch orders');
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

/**
 * Admin: Get order by ID
 */
export const getOrderByIdAdmin = async (orderId) => {
  try {
    const response = await apiRequest(`/orders/admin/${orderId}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Order not found');
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

/**
 * Admin: Update order status
 */
export const updateOrderStatus = async (orderId, status, trackingNumber = null) => {
  try {
    const body = { status };
    if (trackingNumber) {
      body.trackingNumber = trackingNumber;
    }
    
    const response = await apiRequest(`/orders/admin/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update order status');
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Initiate eSewa payment for an order
 */
export const initiateEsewaPayment = async (orderId) => {
  try {
    const response = await apiRequest(`/orders/${orderId}/payment/esewa/initiate`, {
      method: 'POST',
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to initiate eSewa payment');
  } catch (error) {
    console.error('Error initiating eSewa payment:', error);
    throw error;
  }
};

/**
 * Verify eSewa payment manually (for retry scenarios)
 */
export const verifyEsewaPayment = async (orderId) => {
  try {
    const response = await apiRequest(`/orders/${orderId}/payment/esewa/verify`, {
      method: 'POST',
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Payment verification failed');
  } catch (error) {
    console.error('Error verifying eSewa payment:', error);
    throw error;
  }
};






