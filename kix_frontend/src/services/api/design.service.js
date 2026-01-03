import { apiRequest } from './client.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050/api';

/**
 * Design API Service
 * Handles all design-related API calls
 */

/**
 * Create a new design
 */
export const createDesign = async (designData) => {
  try {
    const response = await apiRequest('/designs', {
      method: 'POST',
      body: JSON.stringify(designData),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to save design');
  } catch (error) {
    console.error('Error creating design:', error);
    throw error;
  }
};

/**
 * Get user's designs
 */
export const getDesigns = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    if (filters.page) {
      params.append('page', filters.page);
    }
    
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    
    const queryString = params.toString();
    const response = await apiRequest(`/designs${queryString ? `?${queryString}` : ''}`);
    
    if (response.success) {
      return {
        data: response.data,
        pagination: response.pagination,
      };
    }
    
    throw new Error(response.message || 'Failed to fetch designs');
  } catch (error) {
    console.error('Error fetching designs:', error);
    throw error;
  }
};

/**
 * Get design by ID
 */
export const getDesignById = async (designId) => {
  try {
    const response = await apiRequest(`/designs/${designId}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Design not found');
  } catch (error) {
    console.error('Error fetching design:', error);
    throw error;
  }
};

/**
 * Update design
 */
export const updateDesign = async (designId, designData) => {
  try {
    const response = await apiRequest(`/designs/${designId}`, {
      method: 'PUT',
      body: JSON.stringify(designData),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update design');
  } catch (error) {
    console.error('Error updating design:', error);
    throw error;
  }
};

/**
 * Delete design
 */
export const deleteDesign = async (designId) => {
  try {
    const response = await apiRequest(`/designs/${designId}`, {
      method: 'DELETE',
    });
    
    if (response.success) {
      return true;
    }
    
    throw new Error(response.message || 'Failed to delete design');
  } catch (error) {
    console.error('Error deleting design:', error);
    throw error;
  }
};

/**
 * Duplicate design
 */
export const duplicateDesign = async (designId) => {
  try {
    const response = await apiRequest(`/designs/${designId}/duplicate`, {
      method: 'POST',
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to duplicate design');
  } catch (error) {
    console.error('Error duplicating design:', error);
    throw error;
  }
};


