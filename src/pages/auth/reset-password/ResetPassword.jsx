import React, { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Get email and OTP from navigation state
  const email = location.state?.email;
  const otp = location.state?.otp;
  
  // Form state
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password visibility state
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Handle form submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Session expired. Please start the reset process again.');
      navigate('/forgot-password');
      return;
    }
    
    // Validation
    if (!formData.newPassword) {
      toast.error('Please enter a new password.');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    
    if (!formData.confirmPassword) {
      toast.error('Please confirm your new password.');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${baseUrl}auth/reset-password`, {
        email: email,
        newPassword: formData.newPassword
      });
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Password reset successfully! Please log in with your new password.');
        navigate('/');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/bgApp.png)' }}>
      <div className="flex flex-col md:flex-row w-full max-w-4xl md:max-w-5xl mx-auto bg-opacity-70 overflow-hidden gap-0">
        {/* Left: Reset Password Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-12 md:py-20 max-w-md md:max-w-lg mx-auto">
          <div className="mb-8 flex flex-col items-center">
            {/* App Logo */}
            <img src="/appLogo.png" alt="Locker Deal Logo" className="h-14 md:h-16 mb-2 mx-auto" />
            <h2 className="text-white text-2xl md:text-4xl font-bold mt-8 mb-6">RESET PASSWORD</h2>
            <p className="text-white text-center text-sm md:text-base mb-4">
              Enter your new password below.
            </p>
            <p className="text-[#9afa00] text-sm text-center font-semibold">{email || ''}</p>
          </div>
          
          <form onSubmit={handleResetPassword} className="space-y-6 w-full">
            {/* New Password */}
            <div>
              <label className="block text-white font-bold text-md mb-2" htmlFor="newPassword">New Password</label>
              <div className="flex items-center bg-black bg-opacity-60 rounded-md border border-white px-4 md:px-6 py-4 md:py-5">
                <FaLock className="text-lime-400 mr-2" />
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="bg-transparent outline-none text-white flex-1 placeholder-gray-300"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-gray-400 hover:text-white ml-2"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            {/* Confirm New Password */}
            <div>
              <label className="block text-white font-bold text-md mb-2" htmlFor="confirmPassword">Confirm New Password</label>
              <div className="flex items-center bg-black bg-opacity-60 rounded-md border border-white px-4 md:px-6 py-4 md:py-5">
                <FaLock className="text-lime-400 mr-2" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="bg-transparent outline-none text-white flex-1 placeholder-gray-300"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-white ml-2"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-[#232626] hover:bg-[#2a3622] text-white font-bold py-4 rounded-md text-lg tracking-wider transition-colors duration-200"
            >
              BACK
            </button>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold py-4 rounded-md text-lg tracking-wider shadow-md transition-all duration-300 ${
                isLoading 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-[#9afa00] text-black cursor-pointer hover:shadow-[0_0_24px_6px_#9afa00]'
              }`}
            >
              {isLoading ? 'RESETTING...' : 'RESET PASSWORD'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <span className="text-white font-bold text-md">Remember your password? </span>
            <Link to="/" className="text-lime-400 font-bold ml-1">LOG IN</Link>
          </div>
        </div>
        
        {/* Right: Basketball Player Image */}
        <div className="hidden md:flex flex-1 items-center justify-center relative bg-transparent">
          <img
            src="/bbpp.png"
            alt="Basketball Player"
            className="w-full h-full object-contain max-h-[600px] drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;