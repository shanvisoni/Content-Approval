import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  signup: (userData) => api.post('/api/auth/signup', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const contentAPI = {
  getAllContent: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/content${queryString ? `?${queryString}` : ''}`);
  },
  
  getContent: (params = {}) => {
    return contentAPI.getAllContent(params);
  },
  
  createContent: (contentData) => api.post('/api/content', contentData),
  
  approveContent: (contentId) => api.put(`/api/content/${contentId}/approve`),
  
  // Reject content (admin only)
  rejectContent: (contentId) => api.put(`/api/content/${contentId}/reject`),
  
  // Get content statistics
  getStats: () => api.get('/api/content/stats'),
  
  // Search content
  searchContent: (query, filters = {}) => {
    const params = { ...filters };
    if (query) params.keyword = query;
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/content/search?${queryString}`);
  },
  
  getRecentActivity: (limit = 10) => api.get(`/api/content/recent?limit=${limit}`),
  
  // Get content by ID
  getContentById: (id) => api.get(`/api/content/${id}`),
  
  updateContent: (id, updates) => api.put(`/api/content/${id}`, updates),
  
  // Delete content (if delete functionality needed later)
  deleteContent: (id) => api.delete(`/api/content/${id}`),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    const message = error.response.data?.message || 'An error occurred';
    return {
      message,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
    };
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Helper function to get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Helper function to check if user is admin
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

export default api;