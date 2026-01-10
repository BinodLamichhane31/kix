import { apiRequest } from './client.js';

/**
 * Address API Service
 * Handles all address-related API calls
 */

/**
 * Get all addresses for current user
 */
export const getAddresses = async () => {
  try {
    const response = await apiRequest('/users/addresses');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch addresses');
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }
};

/**
 * Add a new address
 */
export const addAddress = async (addressData) => {
  try {
    const response = await apiRequest('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to add address');
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

/**
 * Update an address
 */
export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await apiRequest(`/users/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update address');
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

/**
 * Delete an address
 */
export const deleteAddress = async (addressId) => {
  try {
    const response = await apiRequest(`/users/addresses/${addressId}`, {
      method: 'DELETE',
    });
    
    if (response.success) {
      return true;
    }
    
    throw new Error(response.message || 'Failed to delete address');
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

/**
 * Set an address as default
 */
export const setDefaultAddress = async (addressId) => {
  try {
    const response = await apiRequest(`/users/addresses/${addressId}/default`, {
      method: 'PUT',
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to set default address');
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};
