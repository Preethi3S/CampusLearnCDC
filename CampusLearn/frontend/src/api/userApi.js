import axios from 'axios';

// Use the environment variable if set during build time, otherwise default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USERS_ENDPOINT = `${API_URL}/users`;

// Log the API URL for debugging (remove in production)
console.log('API Base URL:', API_URL);

/**
 * Fetch all users (optionally filtered by role)
 */
const getUsers = async (token, role) => {
  try {
    const url = role ? `${USERS_ENDPOINT}?role=${encodeURIComponent(role)}` : USERS_ENDPOINT;
    console.log('Fetching users from:', url); // Debug log
    const response = await axios.get(url, { 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (!Array.isArray(response.data)) {
      console.error('Unexpected response format:', response.data);
      throw new Error('Invalid response format: expected an array of users');
    }
    
    console.log('Fetched users:', response.data.length); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error in getUsers:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    throw error; // Re-throw to be handled by the component
  }
};

/**
 * Delete a specific user by ID
 */
const deleteUser = async (token, userId) => {
  try {
    const response = await axios.delete(`${USERS_ENDPOINT}/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    handleApiError(error, 'Failed to delete user');
  }
};

/**
 * Common error handler
 */
const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    console.error('Error response data:', error.response.data);
    console.error('Error status code:', error.response.status);
    throw new Error(error.response.data.message || defaultMessage);
  } else if (error.request) {
    console.error('No response received:', error.request);
    throw new Error('No response from server. Please try again.');
  } else {
    console.error('Error setting up request:', error.message);
    throw new Error('Error setting up request. Please try again.');
  }
};

export default {
  getUsers,
  deleteUser
};
