import { jwtDecode } from 'jwt-decode';

/**
 * Check if user is authenticated by verifying token existence and validity
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Invalid token:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Check if current user is admin
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

/**
 * Check if current user is regular user
 */
export const isUser = () => {
  const user = getCurrentUser();
  return user && user.role === 'user';
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
};

/**
 * Get status color for content status
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'text-green-600 bg-green-100';
    case 'rejected':
      return 'text-red-600 bg-red-100';
    case 'pending':
    default:
      return 'text-yellow-600 bg-yellow-100';
  }
};

/**
 * Get status icon for content status
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'approved':
      return '✓';
    case 'rejected':
      return '✗';
    case 'pending':
    default:
      return '⏳';
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
// export const validatePassword = (password) => {
//   const minLength = 6;
//  const hasUpperCase = /[A-Z]/.test(password);
//   const hasLowerCase = /[a-z]/.test(password);
//   const hasNumbers = /\d/.test(password);
  
//   return {
//     isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
//     errors: [
//       ...(password.length < minLength ? [`Password must be at least ${minLength} characters`] : []),
//        ...(!hasUpperCase ? ['Password must contain at least one uppercase letter'] : []),
//       ...(!hasLowerCase ? ['Password must contain at least one lowercase letter'] : []),
//       ...(!hasNumbers ? ['Password must contain at least one number'] : [])
//     ]
//   };
// };
export const validatePassword = (password) => {
  const minLength = 6;
  
  return {
    isValid: password.length >= minLength,
    errors: [
      ...(password.length < minLength ? [`Password must be at least ${minLength} characters`] : [])
    ]
  };
};
/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      document.body.removeChild(textArea);
      console.error('Failed to copy text:', fallbackError);
      return false;
    }
  }
};

