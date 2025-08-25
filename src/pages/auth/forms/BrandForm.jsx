import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const BrandForm = () => {
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
    phoneNumber: '',
    extension: ''
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Form validation
  const validateForm = () => {
    const { firstName, lastName, email, confirmEmail, password, confirmPassword, phoneNumber } = formData;
    
    if (!firstName.trim()) {
      toast.error('First name is required.');
      return false;
    }
    
    if (!lastName.trim()) {
      toast.error('Last name is required.');
      return false;
    }
    
    if (!email.trim()) {
      toast.error('Email is required.');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    
    if (!confirmEmail.trim()) {
      toast.error('Please confirm your email.');
      return false;
    }
    
    if (email !== confirmEmail) {
      toast.error('Email addresses do not match.');
      return false;
    }
    
    if (!password) {
      toast.error('Password is required.');
      return false;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return false;
    }
    
    if (!confirmPassword) {
      toast.error('Please confirm your password.');
      return false;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return false;
    }
    
    if (!phoneNumber.trim()) {
      toast.error('Phone number is required.');
      return false;
    }
    
    if (!/^\d{10,15}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      toast.error('Please enter a valid phone number (10-15 digits).');
      return false;
    }
    
    if (!agreeToTerms) {
      toast.error('You must agree to the terms and conditions.');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${baseUrl}auth/signup-brand`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        confirmEmail: formData.confirmEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber,
        extension: formData.extension
      });
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Brand registration successful! Please verify your email.');
        navigate('/verify-otp', { state: { email: formData.email } });
      }
    } catch (error) {
      console.error('Brand signup error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
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
      <h2 className="text-white text-2xl md:text-4xl font-bold text-center mb-8 tracking-wide">BRAND</h2>
      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-lg md:max-w-4xl bg-transparent flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* First Name */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter your First Name"
              className="w-full bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#9afa00] focus:border-[#9afa00] transition-all"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Last Name */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter your Last Name"
              className="w-full bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#9afa00] focus:border-[#9afa00] transition-all"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="email">Email</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4 focus-within:ring-2 focus-within:ring-[#9afa00] focus-within:border-[#9afa00] transition-all">
              <FaEnvelope className="text-[#9afa00] mr-2" />
              <input
                id="email"
                type="email"
                placeholder="Enter your Email"
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          {/* Confirm Email */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="confirmEmail">Confirm Email</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4 focus-within:ring-2 focus-within:ring-[#9afa00] focus-within:border-[#9afa00] transition-all">
              <FaEnvelope className="text-[#9afa00] mr-2" />
              <input
                id="confirmEmail"
                type="email"
                placeholder="Confirm your Email"
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
                value={formData.confirmEmail}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          {/* Password */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="password">Password</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4 focus-within:ring-2 focus-within:ring-[#9afa00] focus-within:border-[#9afa00] transition-all">
              <FaLock className="text-[#9afa00] mr-2" />
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          {/* Confirm Password */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4 focus-within:ring-2 focus-within:ring-[#9afa00] focus-within:border-[#9afa00] transition-all">
              <FaLock className="text-[#9afa00] mr-2" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••••••"
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          {/* Phone Number */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="phoneNumber">Phone Number</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4 focus-within:ring-2 focus-within:ring-[#9afa00] focus-within:border-[#9afa00] transition-all">
              <FaPhone className="text-[#9afa00] mr-2" />
              <input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your Phone Number"
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          {/* Extension */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="extension">Extension (Optional)</label>
            <input
              id="extension"
              type="text"
              placeholder="Enter Extension"
              className="w-full bg-black bg-opacity-60 border border-white rounded-md px-4 md:px-6 py-3 md:py-4 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#9afa00] focus:border-[#9afa00] transition-all"
              value={formData.extension}
              onChange={handleInputChange}
            />
          </div>
        </div>
        {/* Terms & Conditions */}
        <div className="flex flex-col gap-2 mt-2">
          <a href="#" className="text-[#9afa00] font-bold text-md hover:underline">VIEW TERMS & CONDITIONS</a>
          <label className="flex items-center gap-2 text-white text-md">
            <input 
              type="checkbox" 
              className="form-checkbox h-5 w-5 text-[#9afa00] rounded" 
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
            />
            I agree to the terms & conditions
          </label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full bg-transparent border border-white text-white font-bold py-3 rounded-md hover:bg-white hover:text-black transition-colors duration-300 text-lg"
          >
            BACK
          </button>
          <button
            type="submit"
            disabled={!agreeToTerms || isLoading}
            className={`w-full font-bold py-3 rounded-md text-lg tracking-wider transition-all duration-300 ${
              !agreeToTerms || isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[#9afa00] hover:shadow-[0_0_24px_6px_#9afa00] text-black shadow-md'
            }`}
          >
            {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrandForm;