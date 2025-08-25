import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Login from './pages/auth/login/Login';
import RoleSelection from './pages/auth/role/RoleSelection';
import BrandForm from './pages/auth/forms/BrandForm'
import AthleteForm from './pages/auth/forms/AthleteForm'
import Otp from './pages/auth/otp/Otp';
import ForgotPassword from './pages/auth/forgot-password/ForgotPassword';
import OtpVerification from './pages/auth/otp-verification/OtpVerification';
import ResetPassword from './pages/auth/reset-password/ResetPassword';
import Layout from './components/layout';
import Dashboard from './pages/dashboard/Dashboard';
import Inbox from './pages/inbox/Inbox';
import BrandDashboard from './pages/brandDashboard/brandDashboard';
import { Toaster } from 'react-hot-toast';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const accessToken = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  
  return accessToken && user ? children : <Navigate to="/" replace />;
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
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
        
        {/* Private Routes - Protected */}
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/chats" element={<PrivateRoute><Layout><Inbox /></Layout></PrivateRoute>} />
        <Route path="/brand/dashboard" element={<PrivateRoute><Layout><BrandDashboard /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
