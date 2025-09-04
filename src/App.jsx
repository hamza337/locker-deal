import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import socketService from './services/socketService';
import Login from './pages/auth/login/Login';
import RoleSelection from './pages/auth/role/RoleSelection';
import BrandForm from './pages/auth/forms/BrandForm';
import AthleteForm from './pages/auth/forms/AthleteForm';
import Otp from './pages/auth/otp/Otp';
import ForgotPassword from './pages/auth/forgot-password/ForgotPassword';
import OtpVerification from './pages/auth/otp-verification/OtpVerification';
import ResetPassword from './pages/auth/reset-password/ResetPassword';
import Layout from './components/layout';
import Dashboard from './pages/dashboard/Dashboard';
import Inbox from './pages/inbox/Inbox';
import BrandDashboard from './pages/brandDashboard/brandDashboard';
import SocketTest from './components/SocketTest';

// Role-based Private Route Component
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const accessToken = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  
  if (!accessToken || !user) {
    return <Navigate to="/" replace />;
  }
  
  const userData = JSON.parse(user);
  
  // If specific roles are required, check if user has the right role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
    // Redirect to appropriate dashboard based on user role
    if (userData.role === 'brand') {
      return <Navigate to="/brand/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const accessToken = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  
  if (accessToken && user) {
    const userData = JSON.parse(user);
    if (userData.role === 'brand') {
      return <Navigate to="/brand/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

const App = () => {
  useEffect(() => {
    // Initialize global socket connection when app starts
    const initializeSocket = () => {
      const accessToken = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');
      
      // Only connect if user is authenticated
      if (accessToken && user) {
        console.log('🌐 Initializing global socket connection...');
        socketService.connect();
      }
    };

    // Initialize socket on app start
    initializeSocket();

    // Listen for storage changes (login/logout)
    const handleStorageChange = (e) => {
      if (e.key === 'access_token') {
        if (e.newValue) {
          // User logged in
          console.log('🔑 User logged in, connecting socket...');
          socketService.connect();
        } else {
          // User logged out
          console.log('🔌 User logged out, disconnecting socket...');
          socketService.disconnect();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Public Routes - Auth related */}
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><RoleSelection /></PublicRoute>} />
        <Route path="/signup/athlete" element={<PublicRoute><AthleteForm /></PublicRoute>} />
        <Route path="/signup/brand" element={<PublicRoute><BrandForm /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><Otp /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/otp-verification" element={<PublicRoute><OtpVerification /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        
        {/* Private Routes - Role-based Protection */}
        {/* Athlete-only routes */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute allowedRoles={['athlete']}>
              <Layout><Dashboard /></Layout>
            </PrivateRoute>
          } 
        />
        
        {/* Brand-only routes */}
        <Route 
          path="/brand/dashboard" 
          element={
            <PrivateRoute allowedRoles={['brand']}>
              <Layout><BrandDashboard /></Layout>
            </PrivateRoute>
          } 
        />
        
        {/* Shared routes - Both athletes and brands */}
        <Route 
          path="/chats" 
          element={
            <PrivateRoute allowedRoles={['athlete', 'brand']}>
              <Layout><Inbox /></Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/socket-test" 
          element={
            <PrivateRoute allowedRoles={['athlete', 'brand']}>
              <Layout><SocketTest /></Layout>
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;