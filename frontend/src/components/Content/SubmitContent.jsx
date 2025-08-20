import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { contentAPI } from '../../services/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Fade,
  Slide,
  IconButton,
  InputAdornment,
  FormHelperText,
  Avatar,
  Divider
} from '@mui/material';
import {
  Send,
  Add,
  Clear,
  Article,
  Description,
  CheckCircle,
  Title,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SubmitContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const contentData = {
        title: formData.title.trim(),
        description: formData.description.trim()
      };
      
      await contentAPI.createContent(contentData);
      
      setSuccess(true);
      setFormData({ title: '', description: '' });
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ title: '', description: '' });
    setErrors({});
    setError('');
    setSuccess(false);
  };

  const characterCount = {
    title: formData.title.length,
    description: formData.description.length
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Fade in timeout={600}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              p: 6
            }}
          >
            <CheckCircle 
              sx={{ 
                fontSize: 80, 
                color: 'success.main', 
                mb: 3,
                animation: 'bounce 1s ease-in-out'
              }} 
            />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
              Content Submitted Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
              Your content has been submitted for review. You'll be notified once it's been processed.
              Redirecting to dashboard in 3 seconds...
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  }
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setSuccess(false);
                  handleReset();
                }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Submit Another
              </Button>
            </Box>
          </Card>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Button
              variant="text"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/dashboard')}
              sx={{ 
                mb: 3, 
                alignSelf: 'flex-start',
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Back to Dashboard
            </Button>
            
            <Slide direction="down" in timeout={400}>
              <Box>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    mb: 2,
                    mx: 'auto'
                  }}
                >
                  <Article sx={{ fontSize: 32 }} />
                </Avatar>
                
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
                  Submit New Content
                </Typography>
                
                <Typography variant="body1" color="text.secondary">
                  Share your ideas and content with the community for review
                </Typography>
              </Box>
            </Slide>
          </Box>

          {/* Form */}
          <Slide direction="up" in timeout={600}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
              }}
            >
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                {/* Title Field */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Content Title"
                    placeholder="Enter a compelling title for your content"
                    value={formData.title}
                    onChange={handleInputChange('title')}
                    error={!!errors.title}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Title sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {formData.title && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, title: '' }));
                                setErrors(prev => ({ ...prev, title: '' }));
                              }}
                            >
                              <Clear />
                            </IconButton>
                          )}
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)'
                        }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <FormHelperText error={!!errors.title}>
                      {errors.title || 'Enter a clear, descriptive title'}
                    </FormHelperText>
                    <FormHelperText
                      sx={{
                        color: characterCount.title > 100 ? 'error.main' : 
                               characterCount.title > 80 ? 'warning.main' : 'text.secondary'
                      }}
                    >
                      {characterCount.title}/100
                    </FormHelperText>
                  </Box>
                </Box>

                {/* Description Field */}
                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Content Description"
                    placeholder="Provide a detailed description of your content. What makes it valuable? What should reviewers know about it?"
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    error={!!errors.description}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <Description sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)'
                        }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <FormHelperText error={!!errors.description}>
                      {errors.description || 'Provide comprehensive details about your content'}
                    </FormHelperText>
                    <FormHelperText
                      sx={{
                        color: characterCount.description > 1000 ? 'error.main' : 
                               characterCount.description > 800 ? 'warning.main' : 'text.secondary'
                      }}
                    >
                      {characterCount.description}/1000
                    </FormHelperText>
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Guidelines */}
                <Card sx={{ mb: 4, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Article sx={{ color: 'primary.main' }} />
                      Submission Guidelines
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
                      To ensure your content gets approved quickly, please follow these guidelines:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Ensure your title is clear and descriptive (3-100 characters)
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Provide comprehensive details in the description (10-1000 characters)
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Make sure your content is original and valuable to the community
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        Review your submission for any spelling or grammar errors
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleReset}
                    disabled={loading || (!formData.title && !formData.description)}
                    startIcon={<Clear />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      minWidth: 120,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }
                    }}
                  >
                    Reset
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !formData.title.trim() || !formData.description.trim()}
                    startIcon={loading ? <CircularProgress size={18} /> : <Send />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      minWidth: 150,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        transform: 'none',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Content'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Slide>
        </Box>
      </Fade>

      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
        `}
      </style>
    </Container>
  );
};

export default SubmitContent;