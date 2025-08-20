import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  Fade,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton
} from '@mui/material';
import {
  Dashboard,
  Logout,
  AdminPanelSettings,
  Menu as MenuIcon,
  Close,
  Article
} from '@mui/icons-material';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const open = Boolean(anchorEl);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Updated logout handler to use the enhanced logout function
  const handleLogout = () => {
    // Close any open menus first
    handleClose();
    setMobileMenuOpen(false);
    
    // Use the enhanced logout function that clears navigation state
    logout(navigate);
  };
  
  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
    setMobileMenuOpen(false);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Get user initials for avatar
  const getUserInitials = (user) => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };
  
  // Check if current path is active
  const isActivePath = (path) => {
    return location.pathname === path;
  };
  
  // Navigation items for authenticated users
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
      show: !isAdmin()
    },
    {
      label: 'Admin Panel',
      path: '/admin',
      icon: <AdminPanelSettings />,
      show: isAdmin()
    }
  ];
  
  const mobileNavItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
      show: isAuthenticated && !isAdmin()
    },
    {
      label: 'Admin Panel',
      path: '/admin',
      icon: <AdminPanelSettings />,
      show: isAuthenticated && isAdmin()
    }
  ];
  
  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          {/* Logo/Brand */}
          <Box
            component={Link}
            to={isAuthenticated ? (isAdmin() ? '/admin' : '/dashboard') : '/login'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: 4
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Article sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              ContentFlow
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && isAuthenticated && (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 2 }}>
              {navItems.map((item) => (
                item.show && (
                  <Button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      mr: 2,
                      color: isActivePath(item.path) ? 'primary.main' : 'text.primary',
                      backgroundColor: isActivePath(item.path) ? 'primary.50' : 'transparent',
                      fontWeight: isActivePath(item.path) ? 600 : 500,
                      borderRadius: 2,
                      px: 3,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'primary.50',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                )
              ))}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && isAuthenticated && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', mr: 2 }}>
              <IconButton
                onClick={toggleMobileMenu}
                sx={{
                  color: 'text.primary',
                  backgroundColor: mobileMenuOpen ? 'primary.50' : 'transparent',
                  '&:hover': { backgroundColor: 'primary.50' }
                }}
              >
                {mobileMenuOpen ? <Close /> : <MenuIcon />}
              </IconButton>
            </Box>
          )}

          {/* Auth Buttons for Non-authenticated users */}
          {!isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}

          {/* User Menu for Authenticated Users */}
          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* User Role Chip */}
              <Chip
                label={user?.role === 'admin' ? 'Admin' : 'User'}
                size="small"
                sx={{
                  backgroundColor: user?.role === 'admin' ? 'secondary.100' : 'primary.100',
                  color: user?.role === 'admin' ? 'secondary.800' : 'primary.800',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'flex' }
                }}
              />
              
              {/* User Avatar */}
              <IconButton
                onClick={handleMenu}
                sx={{
                  p: 0,
                  '&:hover': { transform: 'scale(1.05)' },
                  transition: 'transform 0.2s ease-in-out'
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  {getUserInitials(user)}
                </Avatar>
              </IconButton>
              
              {/* User Menu Dropdown */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '& .MuiMenuItem-root': {
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'primary.50',
                        transform: 'translateX(4px)'
                      }
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    Signed in as
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {user?.email}
                  </Typography>
                </Box>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="top"
        open={mobileMenuOpen && isAuthenticated}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            mt: '64px'
          }
        }}
      >
        <Fade in={mobileMenuOpen} timeout={300}>
          <List sx={{ p: 2 }}>
            {mobileNavItems.map((item) => (
              item.show && (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={isActivePath(item.path)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      py: 1.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.50',
                        '&:hover': { backgroundColor: 'primary.100' }
                      },
                      '&:hover': { backgroundColor: 'primary.50' }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'primary.main' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActivePath(item.path) ? 600 : 500
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  color: 'error.main',
                  '&:hover': { backgroundColor: 'error.50' }
                }}
              >
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <Logout />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Fade>
      </Drawer>
    </>
  );
};

export default Navbar;