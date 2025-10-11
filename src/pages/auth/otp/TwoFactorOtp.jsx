import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const TwoFactorOtp = () => {
  // For auto focus, refs for each input
  const inputs = Array.from({ length: 6 }, () => useRef(null));
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Get email from navigation state
  const { email } = location.state || {};
  
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  
  // Resend OTP timer state
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please login again.');
      navigate('/');
    }
  }, [email, navigate]);

  // Handler for moving focus and updating OTP
  const handleChange = (e, idx) => {
    const value = e.target.value;
    
    // Update OTP state
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    
    // Move focus
    if (value.length === 1 && idx < 5) {
      inputs[idx + 1].current.focus();
    } else if (value.length === 0 && idx > 0) {
      inputs[idx - 1].current.focus();
    }
  };
  
  // Handler for paste functionality
  const handlePaste = (e, idx) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6); // Extract only digits, max 6
    
    if (digits.length > 0) {
      const newOtp = [...otp];
      
      // Fill the OTP array starting from the current index
      for (let i = 0; i < digits.length && (idx + i) < 6; i++) {
        newOtp[idx + i] = digits[i];
      }
      
      setOtp(newOtp);
      
      // Focus on the next empty field or the last field
      const nextFocusIndex = Math.min(idx + digits.length, 5);
      inputs[nextFocusIndex].current.focus();
    }
  };
  
  // Handle 2FA OTP verification
  const handleVerifyOtp = async () => {
    if (!email) {
      toast.error('Email not found. Please login again.');
      return;
    }
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${baseUrl}auth/verify-email`, {
        email: email,
        otp: otpString
      });
      
      if (response.status === 200 || response.status === 201) {
        const { access_token, user } = response.data;
        
        // Store access token and user data in localStorage after successful 2FA
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Two-factor authentication successful!');
        
        // Navigate based on user role
        if (user.role === 'athlete') {
          navigate('/dashboard');
        } else if (user.role === 'brand') {
          navigate('/brand/dashboard');
        } else {
          navigate('/dashboard'); // Default fallback
        }
      }
    } catch (error) {
      console.error('2FA OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResend || !email) return;
    
    try {
      await axios.post(`${baseUrl}auth/resend-2fa-otp`, {
        email: email
      });
      
      toast.success('OTP sent successfully!');
      setCanResend(false);
      setCountdown(60); // 60 seconds countdown
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP.');
    }
  };
  
  // Timer effect for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
    
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/bgApp.png)' }}>
      <div className="flex flex-col md:flex-row w-full max-w-4xl md:max-w-5xl mx-auto bg-opacity-70 overflow-hidden gap-0">
        {/* Left: OTP Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-12 md:py-20 max-w-md md:max-w-lg mx-auto">
          <div className="mb-8 flex flex-col items-center">
            {/* App Logo */}
            <img src="/appLogo.png" alt="Locker Deal Logo" className="h-14 md:h-16 mb-2 mx-auto" />
            <h2 className="text-white text-2xl md:text-4xl font-bold mt-8 mb-6">TWO-FACTOR AUTHENTICATION</h2>
            <p className="text-white text-center mb-4">
              We've sent a 6-digit verification code to your registered device.
            </p>
          </div>
          
          {/* OTP Input Fields */}
          <div className="flex justify-center space-x-2 mb-6">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={inputs[idx]}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onPaste={(e) => handlePaste(e, idx)}
                className="w-12 h-12 text-center text-white bg-black bg-opacity-60 border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 text-lg font-bold"
              />
            ))}
          </div>
          
          {/* Verify Button */}
          <button
            onClick={handleVerifyOtp}
            disabled={isLoading}
            className={`w-full mt-6 font-bold py-4 rounded-md text-lg tracking-wider shadow-md transition-all duration-300 ${
              isLoading 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-[#9afa00] text-black cursor-pointer hover:shadow-[0_0_24px_6px_#9afa00]'
            }`}
          >
            {isLoading ? 'VERIFYING...' : 'VERIFY OTP'}
          </button>
          
          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <span className="text-white text-sm">Didn't receive the code? </span>
            <button
              onClick={handleResendOtp}
              disabled={!canResend}
              className={`text-sm font-bold ml-1 ${
                canResend 
                  ? 'text-lime-400 cursor-pointer hover:underline' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
            </button>
          </div>
          
          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-lime-400 font-bold hover:underline">
              ← Back to Login
            </Link>
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

export default TwoFactorOtp;