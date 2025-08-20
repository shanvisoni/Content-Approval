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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Badge,
  Avatar,
  Skeleton,
  Pagination,
  Stack,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Refresh,
  Visibility,
  Edit,
  Delete,
  Schedule,
  CheckCircle,
  Cancel,
  Description,
  TrendingUp,
  Sort,
  GridView,
  ViewList,
  Share,
  BookmarkBorder,
  MoreVert,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { contentAPI, handleApiError } from '../../services/api';

const ContentList = ({ showAddButton = true, userRole = 'user' }) => {
  const { user, isAdmin } = useAuth();
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(9);
  
  // Dialog States
  const [selectedContent, setSelectedContent] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.03,
      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
      transition: { duration: 0.2 },
    },
  };

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    filterAndSortContent();
  }, [content, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contentAPI.getAllContent();
      setContent(response.data);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortContent = () => {
    let filtered = [...content];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'desc' ? -comparison : comparison;
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    setFilteredContent(filtered);
  };

  const handleDeleteContent = async (contentId) => {
    try {
      await contentAPI.deleteContent(contentId);
      setSuccess('Content deleted successfully!');
      setDeleteDialogOpen(false);
      setContentToDelete(null);
      fetchContent();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
  };

  const handleViewContent = (content) => {
    setSelectedContent(content);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle fontSize="small" />;
      case 'rejected': return <Cancel fontSize="small" />;
      case 'pending': return <Schedule fontSize="small" />;
      default: return <Description fontSize="small" />;
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return 'bg-gray-500';
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedContent = filteredContent.slice(startIndex, startIndex + itemsPerPage);

  const ContentSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="100%" height={20} />
              <Box mt={2} display="flex" gap={1}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="60%" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const ContentCard = ({ item, index }) => (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      layout
      key={item._id}
    >
      <Card 
        className="h-full hover-lift glass-effect"
        sx={{ 
          position: 'relative',
          overflow: 'visible',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Status Badge */}
        <Box
          className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-white text-xs font-semibold ${getStatusGradient(item.status)}`}
          sx={{ zIndex: 1 }}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Box>

        <CardContent className="pb-3">
          <Box display="flex" alignItems="start" justifyContent="between" mb={2}>
            <Avatar
              sx={{ 
                bgcolor: getStatusColor(item.status) + '.light',
                width: 40, 
                height: 40 
              }}
            >
              {getStatusIcon(item.status)}
            </Avatar>
            
            <Box display="flex" gap={0.5}>
              <Tooltip title="View Details">
                <IconButton 
                  size="small" 
                  onClick={() => handleViewContent(item)}
                  sx={{ 
                    bgcolor: 'primary.light',
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                >
                  <Visibility fontSize="small" sx={{ color: 'white' }} />
                </IconButton>
              </Tooltip>
              
              {!isAdmin() && item.status === 'pending' && (
                <Tooltip title="Edit">
                  <IconButton 
                    size="small"
                    sx={{ 
                      bgcolor: 'secondary.light',
                      '&:hover': { bgcolor: 'secondary.main' }
                    }}
                  >
                    <Edit fontSize="small" sx={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          <Typography 
            variant="h6" 
            gutterBottom 
            className="gradient-text font-semibold line-clamp-2"
          >
            {item.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="textSecondary" 
            className="line-clamp-3 mb-4"
            sx={{ minHeight: '4.5rem' }}
          >
            {item.description}
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={getStatusIcon(item.status)}
                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                color={getStatusColor(item.status)}
                size="small"
                variant="outlined"
              />
              {item.status === 'approved' && item.approvedAt && (
                <Typography variant="caption" color="success.main">
                  Approved {new Date(item.approvedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            
            <Box display="flex" justifyContent="between" alignItems="center">
              <Typography variant="caption" color="textSecondary">
                Created {new Date(item.createdAt).toLocaleDateString()}
              </Typography>
              
              {isAdmin() && (
                <Typography variant="caption" color="textSecondary">
                  By: {item.createdBy?.email || 'Unknown'}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>

        <CardActions className="px-4 pb-4">
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => handleViewContent(item)}
            className="hover-lift"
          >
            View Details
          </Button>
          
          {!isAdmin() && item.createdBy?._id === user?._id && (
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => {
                  setContentToDelete(item);
                  setDeleteDialogOpen(true);
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          )}
        </CardActions>
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
    >
      <Container maxWidth="xl" className="py-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <Box display="flex" alignItems="center" justifyContent="between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h3" className="gradient-text font-bold mb-2">
                {isAdmin() ? 'All Content' : 'My Content'}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {isAdmin() 
                  ? 'Manage all content submissions across the platform'
                  : 'View and manage your submitted content'
                }
              </Typography>
            </Box>
            
            <Box display="flex" gap={2} alignItems="center">
              <Badge badgeContent={filteredContent.length} color="primary">
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchContent}
                  className="hover-lift"
                >
                  Refresh
                </Button>
              </Badge>
              
              {showAddButton && !isAdmin() && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  className="hover-lift"
                  onClick={() => window.location.href = '/submit-content'}
                >
                  Add Content
                </Button>
              )}
            </Box>
          </Box>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="p-4">
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search className="mr-2 text-gray-400" />,
                  }}
                />
              </Grid>
              
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="createdAt">Date Created</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={sortOrder}
                    label="Order"
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <MenuItem value="desc">Descending</MenuItem>
                    <MenuItem value="asc">Ascending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} md={2}>
                <Box display="flex" justifyContent="center">
                  <Button.Group>
                    <IconButton
                      color={viewMode === 'grid' ? 'primary' : 'default'}
                      onClick={() => setViewMode('grid')}
                    >
                      <GridView />
                    </IconButton>
                    <IconButton
                      color={viewMode === 'list' ? 'primary' : 'default'}
                      onClick={() => setViewMode('list')}
                    >
                      <ViewList />
                    </IconButton>
                  </Button.Group>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </motion.div>

        {/* Content Display */}
        {loading ? (
          <ContentSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            {paginatedContent.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-16"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Description sx={{ fontSize: 80, color: 'primary.light', mb: 2 }} />
                </motion.div>
                <Typography variant="h5" gutterBottom className="gradient-text">
                  No content found
                </Typography>
                <Typography variant="body1" color="textSecondary" mb={4}>
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search criteria or filters'
                    : 'Start by creating your first piece of content'
                  }
                </Typography>
                {showAddButton && !isAdmin() && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    className="hover-lift"
                  >
                    Create Content
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div variants={containerVariants}>
                <Grid container spacing={3}>
                  {paginatedContent.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                      <ContentCard item={item} index={index} />
                    </Grid>
                  ))}
                </Grid>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-center mt-8"
                  >
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, newPage) => setPage(newPage)}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* View Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
          TransitionComponent={motion.div}
          TransitionProps={{
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.9 },
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="between">
              <Typography variant="h6">Content Details</Typography>
              {selectedContent && (
                <Chip
                  icon={getStatusIcon(selectedContent.status)}
                  label={selectedContent.status.charAt(0).toUpperCase() + selectedContent.status.slice(1)}
                  color={getStatusColor(selectedContent.status)}
                />
              )}
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedContent && (
              <Box>
                <Typography variant="h5" gutterBottom className="gradient-text">
                  {selectedContent.title}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedContent.description}
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2} mt={4}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Created:</strong> {new Date(selectedContent.createdAt).toLocaleString()}
                  </Typography>
                  {selectedContent.approvedAt && (
                    <Typography variant="body2" color="success.main">
                      <strong>Approved:</strong> {new Date(selectedContent.approvedAt).toLocaleString()}
                    </Typography>
                  )}
                  {isAdmin() && (
                    <Typography variant="body2" color="textSecondary">
                      <strong>Created by:</strong> {selectedContent.createdBy?.email || 'Unknown'}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{contentToDelete?.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              color="error" 
              variant="contained"
              onClick={() => handleDeleteContent(contentToDelete._id)}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for Mobile */}
        {showAddButton && !isAdmin() && (
          <Fab
            color="primary"
            aria-label="add content"
            className="fixed bottom-6 right-6 hover-lift"
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <Add />
          </Fab>
        )}

        {/* Notifications */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
        >
          <Alert onClose={() => setSuccess(null)} severity="success" variant="filled">
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
};

export default ContentList;