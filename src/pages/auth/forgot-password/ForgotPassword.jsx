import React, { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${baseUrl}auth/request-reset`, {
        email: email
      });
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Reset code sent to your email!');
        navigate('/otp-verification', { state: { email: email } });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/bgApp.png)' }}>
      <div className="flex flex-col md:flex-row w-full max-w-4xl md:max-w-5xl mx-auto bg-opacity-70 overflow-hidden gap-0">
        {/* Left: Forgot Password Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-12 md:py-20 max-w-md md:max-w-lg mx-auto">
          <div className="mb-8 flex flex-col items-center">
            {/* App Logo */}
            <img src="/appLogo.png" alt="Locker Deal Logo" className="h-14 md:h-16 mb-2 mx-auto" />
            <h2 className="text-white text-2xl md:text-4xl font-bold mt-8 mb-6">FORGOT PASSWORD</h2>
            <p className="text-white text-center text-sm md:text-base mb-4">
              Enter your email address and we'll send you a code to reset your password.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            {/* Email */}
            <div>
              <label className="block text-white font-bold text-md mb-2" htmlFor="email">Email</label>
              <div className="flex items-center bg-black bg-opacity-60 rounded-md border border-white px-4 md:px-6 py-4 md:py-5">
                <FaEnvelope className="text-lime-400 mr-2" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="bg-transparent outline-none text-white flex-1 placeholder-gray-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-6 font-bold py-4 rounded-md text-lg tracking-wider shadow-md transition-all duration-300 ${
                isLoading 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-[#9afa00] text-black cursor-pointer hover:shadow-[0_0_24px_6px_#9afa00]'
              }`}
            >
              {isLoading ? 'SENDING...' : 'SEND RESET CODE'}
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

export default ForgotPassword;