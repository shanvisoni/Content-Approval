import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { muiTheme } from './theme/muiTheme';

// Import your components
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import UserDashboard from './components/Dashboard/UserDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Login />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;