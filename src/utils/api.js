import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.29.13:5600/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = (userData) => api.post('/register', userData);
export const loginUser = (userData) => api.post('/login', userData);
export const getGyms = (location) => api.get('/gyms', { params: { location } });
export const getGymById = (id) => api.get(`/gyms/${id}`);
export const getSlots = async (gymId, date) => {
  if (!gymId || !date) {
    throw new Error('Both gymId and date are required to fetch slots');
  }

  try {
    const response = await axios.get(`/api/slots/${gymId}`, {
      params: { date } // Sends ?date=YYYY-MM-DD
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching slots:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch slots');
  }
};

// New function
export const getSlotById = async (slotId) => {
  if (!slotId) {
    throw new Error('Slot ID is required');
  }

  try {
    const response = await axios.get(`/api/slots/slot/${slotId}`);
    return response;
  } catch (error) {
    console.error('Error fetching slot by ID:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch slot details');
  }
};

export const authApi = {
  /**
   * User login
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} Response with user data and token
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return {
        success: true,
        data: {
          user: response.data.user,
          token: response.data.token,
        },
      };
    } catch (error) {
      return handleApiError(error, 'Login failed');
    }
  },

  /**
   * User registration
   * @param {Object} userData 
   * @returns {Promise} Response with user data and token
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: true,
        data: {
          user: response.data.user,
          token: response.data.token,
        },
      };
    } catch (error) {
      return handleApiError(error, 'Registration failed');
    }
  },

  /**
   * User logout
   * @param {string} token 
   * @returns {Promise} Response indicating success
   */
  logout: async (token) => {
    try {
      await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Logout failed');
    }
  },

  /**
   * Verify authentication token
   * @param {string} token 
   * @returns {Promise} Response with user data if valid
   */
  verifyToken: async (token) => {
    try {
      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return {
        success: true,
        data: response.data.user,
      };
    } catch (error) {
      return handleApiError(error, 'Token verification failed');
    }
  },

  /**
   * Update user profile
   * @param {string} userId 
   * @param {Object} updatedData 
   * @param {string} token 
   * @returns {Promise} Response with updated user data
   */
  updateProfile: async (userId, updatedData, token) => {
    try {
      const response = await api.patch(`/users/${userId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return {
        success: true,
        data: response.data.user,
      };
    } catch (error) {
      return handleApiError(error, 'Profile update failed');
    }
  },

  /**
   * Request password reset
   * @param {string} email 
   * @returns {Promise} Response indicating success
   */
  requestPasswordReset: async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Password reset request failed');
    }
  },

  /**
   * Reset password with token
   * @param {string} token 
   * @param {string} newPassword 
   * @returns {Promise} Response indicating success
   */
  resetPassword: async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Password reset failed');
    }
  },
};

/**
 * Handles API errors consistently
 * @param {Error} error 
 * @param {string} defaultMessage 
 * @returns {Object} Standard error response
 */
function handleApiError(error, defaultMessage) {
  if (error.response) {
    // The request was made and the server responded with a status code
    const message = error.response.data?.message || defaultMessage;
    return {
      success: false,
      message,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      message: 'Network error - no response from server',
    };
  } else {
    // Something happened in setting up the request
    return {
      success: false,
      message: error.message || defaultMessage,
    };
  }
}

export const createBooking = (slotId) => api.post('/bookings', { slotId });
export const getMyBookings = () => api.get('/bookings');
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);
export const createPaymentIntent = async (slotId, amount) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('User is not authenticated');
  }

  try {
    const response = await axios.post('/api/create-payment-intent', {
      slotId,
      amount
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = response.data;

    if (!data.clientSecret) {
      throw new Error('Missing client secret in response');
    }

    return data; // contains { clientSecret, bookingId }
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Failed to create payment intent';
    throw new Error(msg);
  }
};
export const confirmPayment = (data) => api.post('/confirm-payment', data);

export default api;