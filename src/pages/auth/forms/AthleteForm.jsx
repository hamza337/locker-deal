import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdSportsVolleyball } from "react-icons/md";
import axios from 'axios';
import toast from 'react-hot-toast';

const AthleteForm = () => {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    sports: '',
    agreeToTerms: false
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  // Collect form data function
  const collectFormData = () => {
    const apiData = {
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      confirmEmail: formData.confirmEmail,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      sport: formData.sports
    };
    return apiData;
  };

  // Handle signup
  const handleSignup = async () => {
    // Check if terms are agreed
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms & conditions to continue.');
      return;
    }

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.sports) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (formData.email !== formData.confirmEmail) {
      toast.error('Email addresses do not match.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const apiData = collectFormData();
      
      const response = await axios.post(`${baseUrl}auth/signup-athlete`, apiData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Account created successfully!');
        // Navigate to OTP verification with email
        navigate('/verify-otp', { state: { email: formData.email } });
      }
    } catch (error) {
      if(error?.response?.status === 400 && error?.response?.data?.isVerified) {
        toast.error('Email already verified. Please login.');
        navigate('/');
      }
      if(error?.response?.status === 400 && !error?.response?.data?.isVerified) {
        toast.error('Email already registered. Please verify your email.');
        navigate('/verify-otp', { state: { email: formData.email } });
      }
      toast.error(error.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-center relative px-4 sm:px-8 md:px-12 py-8 md:py-12" style={{ backgroundImage: 'url(/bgApp.png)' }}>
      {/* Top row: Centered logo and right-aligned link */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center md:justify-between mt-4 mb-8 gap-2 md:gap-0">
        <div className="flex justify-center w-full md:w-auto">
          <img src="/appLogo.png" alt="Locker Deal Logo" className="h-14 md:h-16" />
        </div>
        <Link
          to="/login"
          className="text-[#9afa00] font-bold text-md mt-2 md:mt-0"
        >
          Already have an account?
        </Link>
      </div>
      {/* Heading */}
      <h2 className="text-white text-2xl md:text-4xl font-bold text-center mb-8 tracking-wide">ATHLETE</h2>
      {/* Form */}
      <form className="w-full max-w-lg md:max-w-4xl bg-transparent flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* First Name */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="firstName">First Name</label>
            <input
                id="firstName"
                type="text"
                placeholder="Enter your First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4 text-white placeholder-gray-400 outline-none"
              />
          </div>
          {/* Last Name */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="lastName">Last Name</label>
            <input
                id="lastName"
                type="text"
                placeholder="Enter your Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4 text-white placeholder-gray-400 outline-none"
              />
          </div>
          {/* Email */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="email">Email</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4">
              <FaEnvelope className="text-[#9afa00] mr-2" />
              <input
                id="email"
                type="email"
                placeholder="Enter your Email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          {/* Confirm Email */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="confirmEmail">Confirm Email</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4">
              <FaEnvelope className="text-[#9afa00] mr-2" />
              <input
                id="confirmEmail"
                type="email"
                placeholder="Confirm your Email"
                value={formData.confirmEmail}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          {/* Password */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="password">Password</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4">
              <FaLock className="text-[#9afa00] mr-2" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white ml-2"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {/* Confirm Password */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4">
              <FaLock className="text-[#9afa00] mr-2" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
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
          {/* Sports */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="email">Sports</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4">
              <MdSportsVolleyball className="text-[#9afa00] mr-2" />
              <input
                id="sports"
                type="text"
                placeholder="Enter your Sports"
                value={formData.sports}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
        {/* Terms & Conditions stacked */}
        <div className="flex flex-col gap-2 mt-2">
          <a href="#" className="text-[#9afa00] font-bold text-md hover:underline">VIEW TERMS & CONDITIONS</a>
          <label className="flex items-center gap-2 text-white text-md">
            <input 
              id="agreeToTerms"
              type="checkbox" 
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="form-checkbox h-5 w-5 text-[#9afa00] rounded" 
            />
            I agree to the terms & conditions
          </label>
        </div>
        {/* Buttons stacked */}
        <div className="flex flex-col gap-4 mt-4 w-full">
          <button
            type="button"
            className="w-full bg-[#3a4d1a] hover:bg-[#9afa00] hover:text-black text-white font-bold py-3 rounded-md text-lg tracking-wider transition-colors duration-200"
            onClick={() => navigate(-1)}
          >
            BACK
          </button>
          <button
            type="button"
            onClick={handleSignup}
            disabled={isLoading}
            className={`w-full font-bold py-3 rounded-md text-lg tracking-wider shadow-md transition-all duration-300 ${
              isLoading 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-[#9afa00] hover:shadow-[0_0_24px_6px_#9afa00] text-black cursor-pointer'
            }`}
          >
            {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AthleteForm;