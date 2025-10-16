import axios from 'axios';

// Use the environment variable if set during build time, otherwise default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USERS_ENDPOINT = `${API_URL}/users`;

// Log the API URL for debugging (remove in production)
console.log('API Base URL:', API_URL);

const getUsers = async (token, role) => {
  try {
    const url = role ? `${USERS_ENDPOINT}?role=${encodeURIComponent(role)}` : USERS_ENDPOINT;
    const response = await axios.get(url, { 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error status code:', error.response.status);
      throw new Error(error.response.data.message || 'Failed to fetch users');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      throw new Error('Error setting up request. Please try again.');
    }
  }
};

export default { getUsers };
