import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Otp = () => {
  // For auto focus, refs for each input
  const inputs = Array.from({ length: 6 }, () => useRef(null));
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Get email from navigation state
  const email = location.state?.email;
  
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  
  // Resend OTP timer state
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

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
  
  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!email) {
      toast.error('Email not found. Please go back and try again.');
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
        toast.success('Account verified successfully, Please Login to continue');
        navigate('/');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
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
  
  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!email) {
      toast.error('Email not found. Please go back and try again.');
      return;
    }
    
    if (!canResend) {
      return;
    }
    
    try {
      const response = await axios.post(`${baseUrl}auth/resend-verification-otp`, {
        email: email
      });
      
      if (response.status === 200 || response.status === 201) {
        toast.success('OTP resent successfully!');
        // Start 60-second countdown
        setCanResend(false);
        setCountdown(60);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-center relative px-4 py-8" style={{ backgroundImage: 'url(/bgApp.png)' }}>
      {/* Top right link */}
      <Link
        to="/login"
        className="absolute top-6 sm:top-10 right-4 sm:right-8 text-[#9afa00] font-bold text-base sm:text-lg z-10"
      >
        Already have an account?
      </Link>
      {/* Centered Logo */}
      <img src="/appLogo.png" alt="Locker Deal Logo" className="h-14 md:h-16 mt-4 mb-8 mx-auto" />
      {/* Heading */}
      <h2 className="text-white text-2xl md:text-4xl font-bold text-center mb-4 tracking-wide">VERIFY EMAIL</h2>
      <p className="text-white text-md text-center mb-2">Enter the 6 digit code that was sent to</p>
      <p className="text-[#9afa00] text-md text-center mb-10 font-semibold">{email || ''}</p>
      {/* OTP Inputs */}
      <div className="flex justify-center gap-4 mb-10">
        {inputs.map((ref, idx) => (
          <input
            key={idx}
            ref={ref}
            type="text"
            maxLength={1}
            value={otp[idx]}
            className="w-12 h-12 md:w-16 md:h-16 text-2xl md:text-3xl text-center bg-transparent border border-gray-400 rounded-md text-white focus:outline-none focus:border-[#9afa00] transition-all"
            onChange={e => handleChange(e, idx)}
            onPaste={e => handlePaste(e, idx)}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        ))}
      </div>
      {/* Back Button */}
      <button
        type="button"
        className="w-full max-w-xl bg-[#232626] hover:bg-[#2a3622] text-white font-bold py-3 rounded-md text-lg tracking-wider transition-colors duration-200 mb-4"
        onClick={() => navigate(-1)}
      >
        BACK
      </button>
      {/* Verify Button */}
      <button
        onClick={handleVerifyOtp}
        disabled={isLoading}
        className={`w-full max-w-xl font-bold py-3 rounded-md text-lg tracking-wider shadow-md transition-all duration-300 mb-6 ${
          isLoading 
            ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
            : 'bg-[#9afa00] hover:shadow-[0_0_24px_6px_#9afa00] text-black cursor-pointer'
        }`}
      >
        {isLoading ? 'VERIFYING...' : 'VERIFY EMAIL'}
      </button>
      {/* Resend Code */}
      <div className="text-center mt-2">
        <span className="text-white text-md">Don't receive any code? </span>
        <button 
          onClick={handleResendOtp}
          disabled={!canResend}
          className={`font-bold ml-1 transition-colors duration-200 ${
            canResend 
              ? 'text-[#9afa00] hover:underline cursor-pointer' 
              : 'text-gray-500 cursor-not-allowed'
          }`}
        >
          {canResend ? 'RESEND CODE' : `RESEND CODE (${countdown}s)`}
        </button>
      </div>
    </div>
  );
};

export default Otp;