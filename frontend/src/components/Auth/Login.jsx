import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd,
  Article
} from '@mui/icons-material';
import { validateEmail } from '../../utils/auth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, error, clearError, loading, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to determine appropriate redirect path based on user role
  const getRedirectPath = useCallback((userRole, fromPath) => {
    // If there's a valid 'from' path, validate it against user role
    if (fromPath && fromPath !== '/login' && fromPath !== '/signup') {
      // If user is admin, allow any path
      if (userRole === 'admin') {
        return fromPath;
      }
      // If user is regular user, only allow non-admin paths
      if (userRole === 'user' && !fromPath.startsWith('/admin')) {
        return fromPath;
      }
    }
    
    return userRole === 'admin' ? '/admin' : '/dashboard';
  }, []);


const handleRedirect = useCallback(() => {
  if (isAuthenticated && user) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
    
    setTimeout(() => {
      navigate(redirectPath, { replace: true, state: {} });
    }, 100);
  }
}, [isAuthenticated, user, navigate]);
  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        const fromPath = location.state?.from?.pathname;
        const redirectPath = getRedirectPath(result.user.role, fromPath);
        
        navigate(redirectPath, { replace: true, state: {} });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, login, location.state, navigate, getRedirectPath]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header Section */}
          <Slide direction="down" in timeout={600}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Zoom in timeout={1000}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)',
                    animation: 'float 3s ease-in-out infinite'
                  }}
                >
                  <Article sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              </Zoom>
              
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Welcome Back
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
                Sign in to your ContentFlow account
              </Typography>
            </Box>
          </Slide>

          {/* Login Form */}
          <Slide direction="up" in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Error Alert */}
              {error && (
                <Fade in timeout={400}>
                  <Alert 
                    severity="error" 
                    onClose={clearError}
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      '& .MuiAlert-icon': { fontSize: '1.5rem' }
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Email Field */}
                  <TextField
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={isSubmitting || loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                        }
                      }
                    }}
                  />

                  {/* Password Field */}
                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={isSubmitting || loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            disabled={isSubmitting || loading}
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                        }
                      }
                    }}
                  />

                  {/* Login Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isSubmitting || loading}
                    startIcon={
                      isSubmitting || loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <LoginIcon />
                      )
                    }
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                      },
                      '&:active': {
                        transform: 'translateY(0)'
                      },
                      '&.Mui-disabled': {
                        background: 'linear-gradient(135deg, #a0aec0 0%, #9ca3af 100%)',
                        color: 'white'
                      }
                    }}
                  >
                    {isSubmitting || loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Box>
              </form>

              {/* Divider */}
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?
                </Typography>
              </Divider>

              {/* Sign Up Link */}
              <Button
                component={Link}
                to="/signup"
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<PersonAdd />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.50',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                  }
                }}
              >
                Create New Account
              </Button>
            </Paper>
          </Slide>
        </Box>
      </Fade>

      {/* CSS Animation for floating effect */}
      {/* <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style> */}
    </Container>
  );
};

export default Login;