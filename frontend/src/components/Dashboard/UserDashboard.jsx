import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { contentAPI } from '../../services/api';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  CardActions,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Fade,
  Slide,
  Zoom,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Skeleton
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  Assignment,
  Schedule,
  CheckCircle,
  Cancel,
  Article,
  Analytics
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Utility functions - define them locally if not available
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return formatDate(dateString);
};

const truncateText = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const debounce = (func, wait) => {
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

const UserDashboard = () => {
  const { user } = useAuth();
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  
  // Form state for new content submission
  const [newContent, setNewContent] = useState({
    title: '',
    description: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
 // Enhanced user ID extraction
  const getUserId = () => {
    if (!user) return null;
    // Try different possible ID fields
    return user._id || user.id || user.userId;
  };
  // Fetch user's content
  const fetchContents = async () => {
     try {
      setLoading(true);
      const userId = getUserId();
      
      if (!userId) {
        console.error('No user ID found:', user);
        setContents([]);
        setFilteredContents([]);
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
        setLoading(false);
        return;
      }

      console.log('Fetching content for user ID:', userId);
      
      // Use a dedicated endpoint for user content if available, or filter client-side
      let userContents = [];
      
      try {
        // Try to use a user-specific endpoint first
        const response = await contentAPI.getUserContent(userId);
        userContents = response.data || [];
        console.log('User content from API:', userContents);
      } catch (apiError) {
        console.log('User-specific endpoint not available, filtering client-side');
        
        // Fallback: get all content and filter client-side
        const response = await contentAPI.getAllContent();
        console.log('All content response:', response);
        
        // const allContents = response.data?.contents || response.data || [];
        const allContents = response.data?.content || response.data?.contents || [];

        console.log('All contents raw:', allContents);
        
        // Enhanced user content filtering
        userContents = allContents.filter(content => {
          if (!content) return false;
          
          // Check various possible creator ID fields
          const creatorId = 
            content.createdBy?._id || 
            content.createdBy || 
            content.userId || 
            content.author?._id || 
            content.author;
            
          console.log('Content:', content.title, 'Creator ID:', creatorId, 'User ID:', userId);
          
          return creatorId === userId || creatorId === user._id || creatorId === user.id;
        });
      }
      
      console.log('Final user contents:', userContents);
      
      setContents(userContents);
      setFilteredContents(userContents);

      const statsData = {
        total: userContents.length,
        pending: userContents.filter(c => c.status === 'pending').length,
        approved: userContents.filter(c => c.status === 'approved').length,
        rejected: userContents.filter(c => c.status === 'rejected').length
      };
      console.log('Stats:', statsData); // Debug log
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching contents:', error);
      console.error('Error details:', error.response?.data);
      // Set empty state on error
      setContents([]);
      setFilteredContents([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
    if (user) {
      console.log('User object:', user);
      console.log('User ID from object:', getUserId());
      fetchContents();
    } else {
      console.log('No user object');
    }
  }, [user]);

  // Debounced search function
  const debouncedSearch = debounce((term, filter) => {
    let filtered = contents;
    if (term) {
      filtered = filtered.filter(content =>
        (content.title && content.title.toLowerCase().includes(term.toLowerCase())) ||
        (content.description && content.description.toLowerCase().includes(term.toLowerCase()))
      );
    }
    if (filter !== 'all') {
      filtered = filtered.filter(content => content.status === filter);
    }
    setFilteredContents(filtered);
  }, 300);

  // Handle search and filter changes
  useEffect(() => {
    debouncedSearch(searchTerm, statusFilter);
  }, [searchTerm, statusFilter, contents]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
  };

  // Handle content submission
  // const handleSubmit = async () => {
  //   if (!newContent.title.trim() || !newContent.description.trim()) {
  //     setSubmitError('Both title and description are required');
  //     return;
  //   }

  //   try {
  //     setSubmitLoading(true);
  //     setSubmitError('');
      
  //     console.log('Submitting content:', newContent); // Debug log
  //     const response = await contentAPI.createContent(newContent);
  //     console.log('Create response:', response); // Debug log
      
  //     // Reset form
  //     setNewContent({ title: '', description: '' });
  //     setSubmitDialogOpen(false);
      
  //     // Refresh content list
  //     await fetchContents();
      
  //   } catch (error) {
  //     console.error('Submit error:', error);
  //     console.error('Submit error details:', error.response?.data);
  //     setSubmitError(error.response?.data?.message || 'Failed to submit content');
  //   } finally {
  //     setSubmitLoading(false);
  //   }
  // };
 const handleSubmit = async () => {
    if (!newContent.title.trim() || !newContent.description.trim()) {
      setSubmitError('Both title and description are required');
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError('');
      
      console.log('Submitting content:', newContent);
      const response = await contentAPI.createContent(newContent);
      console.log('Create response:', response);
      
      // Reset form
      setNewContent({ title: '', description: '' });
      setSubmitDialogOpen(false);
      
      // Refresh content list
      await fetchContents();
      
    } catch (error) {
      console.error('Submit error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to submit content';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setSubmitError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleMenuClick = (event, content) => {
    setAnchorEl(event.currentTarget);
    setSelectedContent(content);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContent(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return { bg: '#dcfce7', color: '#166534', icon: CheckCircle };
      case 'rejected':
        return { bg: '#fef2f2', color: '#dc2626', icon: Cancel };
      case 'pending':
      default:
        return { bg: '#fef3c7', color: '#d97706', icon: Schedule };
    }
  };

  const getStatusIcon = (status) => {
    const { icon: Icon } = getStatusColor(status);
    return <Icon sx={{ fontSize: 18 }} />;
  };

  // Chart data for analytics
  const pieData = [
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
  ].filter(item => item.value > 0); // Only show non-zero values

  const recentActivity = contents
    .slice(0, 5)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
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
              Welcome back, {user?.email?.split('@')[0] || user?.name || 'User'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your content submissions and track their approval status
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { 
                title: 'Total Content', 
                value: stats.total, 
                icon: Article, 
                color: '#667eea',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              },
              { 
                title: 'Pending Review', 
                value: stats.pending, 
                icon: Schedule, 
                color: '#f59e0b',
                gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
              },
              { 
                title: 'Approved', 
                value: stats.approved, 
                icon: CheckCircle, 
                color: '#10b981',
                gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
              },
              { 
                title: 'Rejected', 
                value: stats.rejected, 
                icon: Cancel, 
                color: '#ef4444',
                gradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
              }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <Slide direction="up" in timeout={400 + index * 100}>
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          background: stat.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 3,
                          boxShadow: `0 8px 20px ${stat.color}40`
                        }}
                      >
                        <stat.icon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {stat.title}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={4}>
            {/* Content List Section */}
            <Grid item xs={12} lg={8}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Search and Filter Section */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        flexGrow: 1,
                        minWidth: '250px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setSubmitDialogOpen(true)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      New Content
                    </Button>
                  </Box>

                  {/* Filter Chips */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      { label: 'All', value: 'all' },
                      { label: 'Pending', value: 'pending' },
                      { label: 'Approved', value: 'approved' },
                      { label: 'Rejected', value: 'rejected' }
                    ].map((filter) => (
                      <Chip
                        key={filter.value}
                        label={filter.label}
                        onClick={() => handleFilterChange(filter.value)}
                        variant={statusFilter === filter.value ? 'filled' : 'outlined'}
                        sx={{
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': { transform: 'translateY(-1px)' },
                          ...(statusFilter === filter.value && {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                            }
                          })
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Content List */}
                <Box sx={{ maxHeight: '600px', overflowY: 'auto', pr: 1 }}>
                  {loading ? (
                    // Loading skeletons
                    [...Array(3)].map((_, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 1 }} />
                      </Box>
                    ))
                  ) : filteredContents.length === 0 ? (
                    // Empty state
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Article sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        {searchTerm || statusFilter !== 'all' ? 'No content found' : 'No content yet'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filters'
                          : 'Start by creating your first content submission'
                        }
                      </Typography>
                      {!searchTerm && statusFilter === 'all' && (
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => setSubmitDialogOpen(true)}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        >
                          Create Content
                        </Button>
                      )}
                    </Box>
                  ) : (
                    // Content cards
                    filteredContents.map((content, index) => {
                      const statusConfig = getStatusColor(content.status);
                      
                      return (
                        <Fade key={content._id} in timeout={400 + index * 100}>
                          <Card
                            sx={{
                              mb: 2,
                              borderRadius: 2,
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)'
                              }
                            }}
                          >
                            <CardContent sx={{ pb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', flexGrow: 1, mr: 2 }}>
                                  {content.title || 'Untitled'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    icon={getStatusIcon(content.status)}
                                    label={content.status ? content.status.toUpperCase() : 'UNKNOWN'}
                                    size="small"
                                    sx={{
                                      backgroundColor: statusConfig.bg,
                                      color: statusConfig.color,
                                      fontWeight: 600,
                                      border: 'none'
                                    }}
                                  />
                                  {/* <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuClick(e, content)}
                                  >
                                    <MoreVert />
                                  </IconButton> */}
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                                {truncateText(content.description || 'No description', 150)}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  Created {content.createdAt ? getRelativeTime(content.createdAt) : 'Unknown'}
                                </Typography>
                                {content.status === 'approved' && content.approvedAt && (
                                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                                    Approved {getRelativeTime(content.approvedAt)}
                                  </Typography>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Fade>
                      );
                    })
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Analytics Section */}
            <Grid item xs={12} lg={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                  mb: 3
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Analytics sx={{ color: 'primary.main' }} />
                  Content Analytics
                </Typography>
                
                {stats.total > 0 && pieData.length > 0 ? (
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Analytics sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No data to display yet
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Recent Activity */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp sx={{ color: 'primary.main' }} />
                  Recent Activity
                </Typography>
                
                {recentActivity.length > 0 ? (
                  <Box>
                    {recentActivity.map((content, index) => {
                      const statusConfig = getStatusColor(content.status);
                      
                      return (
                        <Box key={content._id} sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: index < recentActivity.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.color,
                              mr: 2
                            }}
                          >
                            {getStatusIcon(content.status)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                              {truncateText(content.title || 'Untitled', 30)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {content.createdAt ? getRelativeTime(content.createdAt) : 'Unknown date'}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Schedule sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No recent activity
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Submit Content Dialog */}
      <Dialog 
        open={submitDialogOpen} 
        onClose={() => setSubmitDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle>
          Submit New Content
        </DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {submitError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Title"
            value={newContent.title}
            onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
            margin="normal"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newContent.description}
            onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
            multiline
            rows={4}
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setSubmitDialogOpen(false)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitLoading}
            startIcon={submitLoading ? <CircularProgress size={18} /> : <Add />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {submitLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 150,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Visibility sx={{ mr: 1, fontSize: 18 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
          }
        }}
        onClick={() => setSubmitDialogOpen(true)}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default UserDashboard;

