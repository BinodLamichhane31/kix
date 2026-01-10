import { apiRequest } from './client.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050/api';

/**
 * Product API Service
 * Handles all product-related API calls
 */

/**
 * Transform backend product to frontend format
 */
const transformProduct = (product) => {
  if (!product) return null;
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5050';
  
  // Ensure id field exists for React keys
  const transformed = {
    ...product,
    id: product._id || product.id,
  };
  
  // Convert relative image paths to full URLs
  if (transformed.image && transformed.image.startsWith('/uploads/')) {
    transformed.image = `${API_BASE}${transformed.image}`;
  }
  
  // Convert relative image paths in images array
  if (transformed.images && Array.isArray(transformed.images)) {
    transformed.images = transformed.images.map(img => {
      if (img && img.startsWith('/uploads/')) {
        return `${API_BASE}${img}`;
      }
      return img;
    });
  }
  
  return transformed;
};

/**
 * Transform array of products
 */
const transformProducts = (products) => {
  return products.map(transformProduct);
};

/**
 * Build query string from filters
 */
const buildQueryString = (filters, sort, page, limit) => {
  const params = new URLSearchParams();
  
  // Add filters
  if (filters.category && filters.category !== 'All' && filters.category !== 'all') {
    params.append('category', filters.category);
  }
  
  if (filters.gender && filters.gender !== 'All' && filters.gender !== 'all') {
    // Convert frontend format (Men/Women/Unisex) to backend format (men/women/unisex)
    const genderMap = {
      'Men': 'men',
      'Women': 'women',
      'Unisex': 'unisex',
    };
    params.append('gender', genderMap[filters.gender] || filters.gender.toLowerCase());
  }
  
  if (filters.colors && filters.colors.length > 0) {
    filters.colors.forEach(color => {
      params.append('colors', color);
    });
  }
  
  if (filters.minPrice !== undefined) {
    params.append('minPrice', filters.minPrice);
  }
  
  if (filters.maxPrice !== undefined) {
    params.append('maxPrice', filters.maxPrice);
  }
  
  if (filters.search && filters.search.trim()) {
    params.append('search', filters.search.trim());
  }
  
  if (filters.onlyNew) {
    params.append('onlyNew', 'true');
  }
  
  if (filters.isFeatured) {
    params.append('isFeatured', 'true');
  }
  
  // Add sort
  if (sort) {
    // Convert frontend sort format to backend format
    const sortMap = {
      'price-asc': 'price-asc',
      'price_asc': 'price-asc', // Handle underscore format
      'price-desc': 'price-desc',
      'price_desc': 'price-desc', // Handle underscore format
      'newest': 'newest',
      'rating': 'rating',
      'featured': 'featured',
    };
    params.append('sort', sortMap[sort] || sort);
  }
  
  // Add pagination
  if (page) {
    params.append('page', page);
  }
  
  if (limit) {
    params.append('limit', limit);
  }
  
  return params.toString();
};

/**
 * Make API request with file upload support
 */
const apiRequestWithFile = async (path, formData) => {
  const token = localStorage.getItem('authToken');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    const isAuthPage = window.location.pathname.includes('/auth/');
    if (!isAuthPage) {
      window.location.href = '/auth/sign-in';
    }
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  return response.json();
};

/**
 * Make API request with file upload support (PUT)
 */
const apiRequestWithFilePut = async (path, formData) => {
  const token = localStorage.getItem('authToken');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: formData,
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    const isAuthPage = window.location.pathname.includes('/auth/');
    if (!isAuthPage) {
      window.location.href = '/auth/sign-in';
    }
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  return response.json();
};

/**
 * Get all products with filtering, sorting, and pagination
 */
export const getProducts = async (filters = {}, page = 1, limit = 12) => {
  try {
    const queryString = buildQueryString(filters, filters.sort || 'featured', page, limit);
    const response = await apiRequest(`/products?${queryString}`);
    
    if (response.success) {
      return {
        data: transformProducts(response.data),
        pagination: {
          ...response.pagination,
          hasPreviousPage: response.pagination.hasPrevPage || false,
        },
      };
    }
    
    throw new Error(response.message || 'Failed to fetch products');
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (slug) => {
  try {
    const response = await apiRequest(`/products/slug/${slug}`);
    
    if (response.success) {
      return transformProduct(response.data);
    }
    
    throw new Error(response.message || 'Product not found');
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.message.includes('404') || error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
};

/**
 * Get product by ID (Admin only)
 */
export const getProductById = async (id) => {
  try {
    const response = await apiRequest(`/products/id/${id}`);
    
    if (response.success) {
      return transformProduct(response.data);
    }
    
    throw new Error(response.message || 'Product not found');
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.message.includes('404') || error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
};

/**
 * Get related products
 */
export const getRelatedProducts = async ({ category, excludeSlug, limit = 4 } = {}) => {
  try {
    if (!excludeSlug) {
      return [];
    }
    
    const response = await apiRequest(`/products/related/${excludeSlug}?limit=${limit}`);
    
    if (response.success) {
      return transformProducts(response.data);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
};

/**
 * Create product (Admin only) - with file upload support
 */
export const createProduct = async (productData, imageFile = null) => {
  try {
    const formData = new FormData();
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    // Add all other product data as JSON string
    const { image, ...dataToSend } = productData;
    Object.keys(dataToSend).forEach(key => {
      const value = dataToSend[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          // For arrays, append each item
          value.forEach(item => {
            formData.append(key, item);
          });
        } else if (typeof value === 'object') {
          // For objects, stringify
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });
    
    // If image is a URL (not a file), add it to formData
    if (productData.image && !imageFile) {
      formData.append('image', productData.image);
    }
    
    const response = await apiRequestWithFile('/products', formData);
    
    if (response.success) {
      return transformProduct(response.data);
    }
    
    throw new Error(response.message || 'Failed to create product');
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update product (Admin only) - with file upload support
 */
export const updateProduct = async (id, productData, mainImageFile = null, additionalImageFiles = []) => {
  try {
    const formData = new FormData();
    
    // Add main image file if provided
    if (mainImageFile) {
      formData.append('image', mainImageFile);
    } else if (productData.image) {
      // If image is a URL (not a file), add it to formData
      formData.append('image', productData.image);
    }
    
    // Add additional image files
    if (additionalImageFiles && additionalImageFiles.length > 0) {
      additionalImageFiles.forEach((file, index) => {
        formData.append('images', file);
      });
    }
    
    // Add all other product data
    const { image, images, ...dataToSend } = productData;
    Object.keys(dataToSend).forEach(key => {
      const value = dataToSend[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          // For arrays, append each item separately
          value.forEach(item => {
            formData.append(key, String(item));
          });
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    const response = await apiRequestWithFilePut(`/products/${id}`, formData);
    
    if (response.success) {
      return transformProduct(response.data);
    }
    
    throw new Error(response.message || 'Failed to update product');
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete product (Admin only)
 */
export const deleteProduct = async (id) => {
  try {
    const response = await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
    
    if (response.success) {
      return true;
    }
    
    throw new Error(response.message || 'Failed to delete product');
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
