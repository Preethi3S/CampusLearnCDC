import axios from 'axios';

// Use the environment variable if set during build time, otherwise default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
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
 * Get pending user approvals
 */
const getPendingApprovals = async (token) => {
  try {
    const response = await axios.get(`${USERS_ENDPOINT}?status=pending`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch pending approvals');
    throw error;
  }
};

/**
 * Approve a user
 */
const approveUser = async (token, userId) => {
  try {
    const response = await axios.patch(
      `${USERS_ENDPOINT}/${userId}/approve`,
      {},
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to approve user');
    throw error;
  }
};

/**
 * Reject a user
 */
const rejectUser = async (token, userId, reason) => {
  try {
    const response = await axios.patch(
      `${USERS_ENDPOINT}/${userId}/reject`,
      { reason },
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to reject user');
    throw error;
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

/**
 * Get a single user by ID
 */
const getUserById = async (token, userId) => {
  // Validate inputs
  if (!userId || typeof userId !== 'string') {
    console.error('Invalid user ID:', userId);
    throw new Error('Invalid student ID');
  }

  if (!token) {
    console.error('No authentication token provided');
    throw new Error('Authentication required');
  }

  console.log(`[getUserById] Fetching user with ID: ${userId}`);
  
  try {
    const url = `${USERS_ENDPOINT}/${userId}`;
    console.log(`[getUserById] Request URL: ${url}`);
    
    const response = await axios.get(url, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000,
      validateStatus: status => status >= 200 && status < 300
    });
    
    console.log('[getUserById] Response received:', {
      status: response.status,
      data: response.data ? 'Data received' : 'No data in response'
    });
    
    if (!response.data) {
      throw new Error('No data returned from server');
    }
    
    return response.data;
    
  } catch (error) {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      response: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          // Don't log the full token for security
          Authorization: error.config?.headers?.Authorization ? 'Bearer [token]' : undefined
        }
      }
    };
    
    console.error('[getUserById] Error details:', errorDetails);
    
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.response.status === 403) {
        throw new Error('You do not have permission to view this student\'s profile');
      } else if (error.response.status === 404) {
        // Check if the response has a specific message
        const serverMessage = error.response.data?.message;
        if (serverMessage) {
          throw new Error(serverMessage);
        }
        throw new Error(`No student found with ID: ${userId}`);
      } else if (error.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
    
    throw new Error(error.message || 'Failed to fetch student information');
  }
};

/**
 * Get student's enrolled courses with progress
 */
const getStudentEnrollments = async (token, studentId) => {
  try {
    const response = await axios.get(`${USERS_ENDPOINT}/${studentId}/enrollments`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    // Return empty array if no enrollments found
    if (error.response?.status === 404) {
      return [];
    }
    handleApiError(error, 'Failed to fetch student enrollments');
    throw error;
  }
};

/**
 * Get Student Profile (Admin view)
 */
const getStudentProfile = async (token, studentId) => {
  try {
    const response = await axios.get(`${API_URL}/studentProfile/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching student profile:', error);
    handleApiError(error, 'Failed to fetch student profile');
    throw error;
  }
};


export default {
  getUsers,
  deleteUser,
  getPendingApprovals,
  approveUser,
  rejectUser,
  getUserById,
  getStudentEnrollments,
  getStudentProfile
};
