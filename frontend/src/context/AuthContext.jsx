import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI, getCurrentUser, isAuthenticated } from '../services/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const ACTION_TYPES = {
  LOADING: 'LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  AUTH_ERROR: 'AUTH_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ACTION_TYPES.LOGIN_SUCCESS:
    case ACTION_TYPES.SIGNUP_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case ACTION_TYPES.AUTH_ERROR:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (isAuthenticated()) {
          const user = getCurrentUser();
          if (user) {
            dispatch({
              type: ACTION_TYPES.LOGIN_SUCCESS,
              payload: { user },
            });
          } else {
            dispatch({
              type: ACTION_TYPES.LOGOUT,
            });
          }
        } else {
          dispatch({
            type: ACTION_TYPES.LOGOUT,
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        dispatch({
          type: ACTION_TYPES.LOGOUT,
        });
      }
    };

    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  // Login function - wrapped in useCallback to prevent re-renders
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: ACTION_TYPES.LOADING });
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: ACTION_TYPES.LOGIN_SUCCESS,
        payload: { user },
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: ACTION_TYPES.AUTH_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Signup function - wrapped in useCallback
  const signup = useCallback(async (userData) => {
    try {
      dispatch({ type: ACTION_TYPES.LOADING });
      const response = await authAPI.signup(userData);
      const { token, user } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: ACTION_TYPES.SIGNUP_SUCCESS,
        payload: { user },
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      dispatch({
        type: ACTION_TYPES.AUTH_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Enhanced logout function with navigation state clearing
  const logout = useCallback((navigate = null) => {
    try {
      // Clear auth state
      authAPI.logout();
      dispatch({ type: ACTION_TYPES.LOGOUT });
      
      // If navigate function is provided, redirect to login with cleared state
      if (navigate) {
        navigate('/login', { replace: true, state: {} });
      }
      
      // Clear any remaining navigation history that might contain state
      if (typeof window !== 'undefined' && window.history) {
        // Replace the current history entry to clear any state
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still dispatch logout
      dispatch({ type: ACTION_TYPES.LOGOUT });
    }
  }, []);

  // Clear error function - wrapped in useCallback
  const clearError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
  }, []);

  // Check if user is admin - wrapped in useCallback
  const isAdmin = useCallback(() => {
    return state.user && state.user.role === 'admin';
  }, [state.user]);

  // Check if user is regular user - wrapped in useCallback
  const isUser = useCallback(() => {
    return state.user && state.user.role === 'user';
  }, [state.user]);

  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    // Actions
    login,
    signup,
    logout,
    clearError,
    // Helpers
    isAdmin,
    isUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;