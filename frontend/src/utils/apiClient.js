import { API_URL } from '../config/api';

/**
 * API Client utility for making authenticated requests
 * Uses JWT token from localStorage for authentication
 */

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Get JWT token from localStorage
  const token = localStorage.getItem('token');
  
  // Prepare headers with authentication if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  
  // Prepare request URL
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle non-2xx responses
  if (!response.ok) {
    // Try to parse error response
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP error! Status: ${response.status}`);
  }
  
  // Parse and return response data
  return response.json();
};

/**
 * Convenience method for GET requests
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Response data
 */
export const get = (endpoint, options = {}) => {
  return apiRequest("/api/" + endpoint, {
    method: 'GET',
    ...options
  });
};

/**
 * Convenience method for POST requests
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Response data
 */
export const post = (endpoint, data, options = {}) => {
  return apiRequest("/api/" + endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  });
};

/**
 * Convenience method for PUT requests
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Response data
 */
export const put = (endpoint, data, options = {}) => {
  return apiRequest("/api/" + endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  });
};

/**
 * Convenience method for DELETE requests
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Response data
 */
export const del = (endpoint, options = {}) => {
  return apiRequest("/api/" + endpoint, {
    method: 'DELETE',
    ...options
  });
};

export default {
  get,
  post,
  put,
  delete: del
};
