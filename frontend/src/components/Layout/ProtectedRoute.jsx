
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Container,
  Fade,
  Alert
} from '@mui/material';
import { Lock } from '@mui/icons-material';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, user, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Fade in={true} timeout={500}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ 
                color: 'white',
                mb: 3,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontWeight: 500,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Verifying authentication...
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin access required but user is not admin
  if (requireAdmin && !isAdmin()) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Fade in={true} timeout={800}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
                animation: 'pulse 2s infinite'
              }}
            >
              <Lock sx={{ fontSize: 48, color: 'white' }} />
            </Box>
            
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              Access Restricted
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                mb: 4,
                lineHeight: 1.6
              }}
            >
              Sorry, you don't have permission to access this page. 
              This area is restricted to administrators only.
            </Typography>

            <Alert 
              severity="warning" 
              sx={{ 
                textAlign: 'left',
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Current Role: <strong>{user?.role || 'User'}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Contact an administrator if you believe you should have access to this page.
              </Typography>
            </Alert>
          </Box>
        </Fade>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 15px 35px rgba(239, 68, 68, 0.4);
            }
          }
        `}</style>
      </Container>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <div>{children}</div>
    </Fade>
  );
};

export default ProtectedRoute;