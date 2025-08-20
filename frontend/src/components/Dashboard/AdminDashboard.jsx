import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Slide,
  Avatar,
  Divider,
  LinearProgress,
   Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Search,
  FilterList,
  Refresh,
  TrendingUp,
  Description,
  Schedule,
  Dashboard as DashboardIcon,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { contentAPI } from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [editingContent, setEditingContent] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    hover: {
      scale: 1.02,
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      transition: { duration: 0.2 },
    },
  };

  // Utility function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchContent();
    fetchStats();
    fetchRecentActivity();
  }, []);

  // Filter content based on search and status
  useEffect(() => {
    let filtered = content;
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    setFilteredContent(filtered);
  }, [content, searchTerm, statusFilter]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await contentAPI.getAllContent();
      
      // Handle different response structures
      let contentData = response.data;
      
      // If response has a content property (like your GET /api/content does)
      if (response.data && response.data.content) {
        contentData = response.data.content;
      }
      
      // Ensure it's always an array
      setContent(Array.isArray(contentData) ? contentData : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch content');
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await contentAPI.getStats();
      setStats(response.data || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await contentAPI.getRecentActivity();
      console.log('Recent Activity API Response:', response.data);
      
      // Process and validate the recent activity data
      const activityData = Array.isArray(response.data) ? response.data : [];
      
      // Filter out items with invalid dates and add fallback values
      const processedActivity = activityData.map(activity => ({
        ...activity,
        title: activity.title || 'Untitled Content',
        action: activity.action || 'Status Updated',
        status: activity.status || 'pending',
        timestamp: activity.timestamp || activity.createdAt || activity.updatedAt || new Date().toISOString(),
      })).filter(activity => {
        // Only include activities with valid timestamps
        const date = new Date(activity.timestamp);
        return !isNaN(date.getTime());
      });
      
      setRecentActivity(processedActivity);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setRecentActivity([]);
    }
  };

  const handleApprove = async (contentId) => {
    try {
      await contentAPI.approveContent(contentId);
      setSuccess('Content approved successfully!');
      fetchContent();
      fetchStats();
      fetchRecentActivity();
    } catch (err) {
      setError('Failed to approve content');
    }
  };

  const handleReject = async (contentId) => {
    try {
      await contentAPI.rejectContent(contentId);
      setSuccess('Content rejected successfully!');
      fetchContent();
      fetchStats();
      fetchRecentActivity();
    } catch (err) {
      setError('Failed to reject content');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle fontSize="small" />;
      case 'rejected':
        return <Cancel fontSize="small" />;
      case 'pending':
        return <Schedule fontSize="small" />;
      default:
        return <Description fontSize="small" />;
    }
  };

  const handleStatusChange = async (contentId, newStatus, notes = '') => {
    try {
      let response;
      
      if (newStatus === 'approved') {
        response = await contentAPI.approveContent(contentId);
      } else if (newStatus === 'rejected') {
        response = await contentAPI.rejectContent(contentId, { notes });
      } else if (newStatus === 'pending') {
        setError('Setting content back to pending is not implemented yet');
        return;
      }
      
      if (response && response.status === 200) {
        setSuccess(`Content ${newStatus} successfully!`);
        
        // Close edit modal and refresh data
        closeEditModal();
        fetchContent();
        fetchStats();
        fetchRecentActivity();
      } else {
        setError('Failed to update content status');
      }
      
    } catch (err) {
      setError('Failed to update content status');
      console.error('Error updating content:', err);
    }
  };

  const openEditModal = (contentItem) => {
    setEditingContent(contentItem);
    setEditStatus(contentItem.status);
    setEditNotes(contentItem.rejectionNotes || '');
  };

  const closeEditModal = () => {
    setEditingContent(null);
    setEditStatus('');
    setEditNotes('');
  };

  const StatCard = ({ title, value, icon, color, change }) => (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="h-full"
    >
      <Card className="h-full hover-lift">
        <CardContent className="p-6">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h3" color={color} fontWeight="bold">
                {value}
              </Typography>
              {change && (
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="body2" color="success.main" ml={0.5}>
                    +{change}% from last week
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: `${color}.light`,
                width: 56,
                height: 56,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LinearProgress className="mb-4 w-64" />
          <Typography variant="h6" color="textSecondary">
            Loading Admin Dashboard...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8"
    >
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <DashboardIcon />
              </Avatar>
              <Box>
                <Typography variant="h3" className="gradient-text font-bold">
                  Admin Dashboard
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Welcome back, {user?.email}! Manage content submissions and analytics.
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchContent}
              className="hover-lift"
            >
              Refresh
            </Button>
          </Box>
        </motion.div>

        {/* Stats Cards - Fixed Grid syntax */}
        <motion.div variants={itemVariants} className="mb-8">
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Total Content"
                value={stats.total}
                icon={<Description />}
                color="primary"
                change="12"
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Pending Review"
                value={stats.pending}
                icon={<Schedule />}
                color="warning"
                change="5"
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Approved"
                value={stats.approved}
                icon={<CheckCircle />}
                color="success"
                change="8"
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Rejected"
                value={stats.rejected}
                icon={<Cancel />}
                color="error"
                change="3"
              />
            </Grid>
          </Grid>
        </motion.div>

        <Grid container spacing={3}>
          {/* Main Content Area */}
          <Grid xs={12} lg={8}>
            <motion.div variants={itemVariants}>
              <Card className="hover-lift">
                <CardContent className="p-6">
                  {/* Search and Filter Controls */}
                  <Box mb={4}>
                    <Typography variant="h5" gutterBottom className="flex items-center">
                      <FilterList className="mr-2" />
                      Content Management
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                      <TextField
                        label="Search content..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: <Search className="mr-2 text-gray-400" />,
                        }}
                        className="flex-1 min-w-[200px]"
                      />
                      <FormControl size="small" className="min-w-[120px]">
                        <InputLabel>Status Filter</InputLabel>
                        <Select
                          value={statusFilter}
                          label="Status Filter"
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  {/* Content List */}
                  <AnimatePresence>
                    {filteredContent.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12"
                      >
                        <Description fontSize="large" className="text-gray-300 mb-4" />
                        <Typography variant="h6" color="textSecondary">
                          No content found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Try adjusting your search or filter criteria
                        </Typography>
                      </motion.div>
                    ) : (
                      <Box>
                        {filteredContent.map((item, index) => (
                          <motion.div
                            key={item._id}
                            variants={itemVariants}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            className="mb-4"
                          >
                            <Paper
                              elevation={2}
                              className="p-4 hover-lift border border-gray-100"
                            >
                              <Box display="flex" justifyContent="between" alignItems="start">
                                <Box flex={1} mr={2}>
                                  <Typography variant="h6" gutterBottom>
                                    {item.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    className="mb-3 line-clamp-2"
                                  >
                                    {item.description}
                                  </Typography>
                                  <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                    <Chip
                                      icon={getStatusIcon(item.status)}
                                      label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                      color={getStatusColor(item.status)}
                                      size="small"
                                    />
                                    <Typography variant="caption" color="textSecondary">
                                      Created: {formatDate(item.createdAt)}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      By: {item.createdBy?.email || 'Unknown'}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                {item.status === 'pending' && (
                                  <Box display="flex" gap={1}>
                                    <Tooltip title="Approve Content">
                                      <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        startIcon={<CheckCircle />}
                                        onClick={() => handleApprove(item._id)}
                                        className="hover-lift"
                                      >
                                        Approve
                                      </Button>
                                    </Tooltip>
                                    <Tooltip title="Reject Content">
                                      <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        startIcon={<Cancel />}
                                        onClick={() => handleReject(item._id)}
                                        className="hover-lift"
                                      >
                                        Reject
                                      </Button>
                                    </Tooltip>
                                  </Box>
                                )}
                                
                                {item.status !== 'pending' && (
                                  <Box display="flex" gap={1}>
                                    <Tooltip title="Change Status">
                                      <IconButton 
                                        size="small" 
                                        color="secondary"
                                        onClick={() => openEditModal(item)}
                                      >
                                        <Edit />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )}
                              </Box>
                            </Paper>
                          </motion.div>
                        ))}
                      </Box>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Recent Activity Sidebar */}
          <Grid xs={12} lg={4}>
            <motion.div variants={itemVariants}>
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <Typography variant="h6" gutterBottom className="flex items-center">
                    <TrendingUp className="mr-2" />
                    Recent Activity
                  </Typography>
                  <Divider className="mb-4" />
                  
                  {recentActivity.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" textAlign="center" py={4}>
                      No recent activity
                    </Typography>
                  ) : (
                    <Box>
                      {recentActivity.slice(0, 10).map((activity, index) => (
                        <motion.div
                          key={activity._id || index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Box display="flex" alignItems="center" mb={3}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                mr: 2,
                                bgcolor: `${getStatusColor(activity.status)}.light`,
                              }}
                            >
                              {getStatusIcon(activity.status)}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight="medium">
                                {activity.title}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {activity.action} • {formatDate(activity.timestamp)}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Success/Error Snackbars */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
          TransitionComponent={Slide}
        >
          <Alert onClose={() => setSuccess(null)} severity="success" variant="filled">
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          TransitionComponent={Slide}
        >
          <Alert onClose={() => setError(null)} severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>

        {/* Edit Status Modal */}
        <Dialog 
          open={!!editingContent} 
          onClose={closeEditModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Change Content Status
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Title: {editingContent?.title}
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={editStatus}
                label="Status"
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            
            {editStatus === 'rejected' && (
              <TextField
                fullWidth
                margin="normal"
                label="Rejection Notes (Optional)"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                multiline
                rows={3}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditModal}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={() => handleStatusChange(editingContent._id, editStatus, editNotes)}
              disabled={!editStatus}
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </motion.div>
  );
};

export default AdminDashboard;
