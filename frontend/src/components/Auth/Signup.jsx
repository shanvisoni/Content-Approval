import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Zoom,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Login as LoginIcon,
  Article,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { validateEmail, validatePassword } from '../../utils/auth';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  
  const { signup, isAuthenticated, error, clearError, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = isAdmin() ? '/admin' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, isAdmin]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Check password strength on password change
  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password);
      const score = validation.isValid ? 100 : Math.max(20, 80 - (validation.errors.length * 20));
      setPasswordStrength({
        score,
        feedback: validation.errors,
        isValid: validation.isValid
      });
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    const result = await signup({
      email: formData.email,
      password: formData.password
    });
    
    if (result.success) {
      const redirectPath = result.user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
    
    setIsSubmitting(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score < 40) return 'error';
    if (passwordStrength.score < 70) return 'warning';
    return 'success';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score < 40) return 'Weak';
    if (passwordStrength.score < 70) return 'Medium';
    return 'Strong';
  };

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
                Join ContentFlow
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
                Create your account to get started
              </Typography>
            </Box>
          </Slide>

          {/* Signup Form */}
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
                  <Box>
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
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <Fade in timeout={300}>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Password Strength:
                            </Typography>
                            <Chip
                              label={getPasswordStrengthText()}
                              size="small"
                              color={getPasswordStrengthColor()}
                              icon={passwordStrength.isValid ? <CheckCircle /> : <Cancel />}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={passwordStrength.score}
                            color={getPasswordStrengthColor()}
                            sx={{ 
                              borderRadius: 1,
                              height: 6,
                              backgroundColor: 'grey.200'
                            }}
                          />
                          {passwordStrength.feedback.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {passwordStrength.feedback.map((feedback, index) => (
                                <Typography
                                  key={index}
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: 'block', mt: 0.5 }}
                                >
                                  • {feedback}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Fade>
                    )}
                  </Box>

                  {/* Confirm Password Field */}
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
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
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                            disabled={isSubmitting || loading}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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

                  {/* Signup Button */}
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
                        <PersonAdd />
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
                    {isSubmitting || loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Box>
              </form>

              {/* Divider */}
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?
                </Typography>
              </Divider>

              {/* Login Link */}
              <Button
                component={Link}
                to="/login"
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<LoginIcon />}
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
                Sign In Instead
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

export default Signup;







