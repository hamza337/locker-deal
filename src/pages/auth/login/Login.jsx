import React from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/bgApp.png)' }}>
      <div className="flex flex-col md:flex-row w-full max-w-4xl md:max-w-5xl mx-auto bg-opacity-70 overflow-hidden gap-0">
        {/* Left: Login Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-12 md:py-20 max-w-md md:max-w-lg mx-auto">
          <div className="mb-8 flex flex-col items-center">
            {/* App Logo */}
            <img src="/appLogo.png" alt="Locker Deal Logo" className="h-14 md:h-16 mb-2 mx-auto" />
            <h2 className="text-white text-2xl md:text-4xl font-bold mt-8 mb-6">LOG IN</h2>
          </div>
          <form className="space-y-6 w-full">
            {/* Email */}
            <div>
              <label className="block text-white font-bold text-md mb-2" htmlFor="email">Email</label>
              <div className="flex items-center bg-black bg-opacity-60 rounded-md border border-white px-4 md:px-6 py-4 md:py-5">
                <FaEnvelope className="text-lime-400 mr-2" />
                <input
                  id="email"
                  type="email"
                  placeholder="hassankhanzada@gmail.com"
                  className="bg-transparent outline-none text-white flex-1 placeholder-gray-300"
                />
              </div>
            </div>
            {/* Password */}
            <div>
              <label className="block text-white font-bold text-md mb-2" htmlFor="password">Password</label>
              <div className="flex items-center bg-black bg-opacity-60 rounded-md border border-white px-4 md:px-6 py-4 md:py-5">
                <FaLock className="text-lime-400 mr-2" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  className="bg-transparent outline-none text-white flex-1 placeholder-gray-300"
                />
                <a href="/" className="text-[#9afa00] text-xs md:text-s ml-2 whitespace-nowrap">Reset Password</a>
              </div>
            </div>
            {/* Login Button */}
            <button
              onClick={() => navigate('/brand/dashboard')}
              // type="submit"
              className="w-full mt-6 bg-[#9afa00] text-black font-bold py-4 rounded-md text-lg tracking-wider shadow-md cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_24px_6px_#9afa00]"
            >
              LOG IN
            </button>
          </form>
          <div className="mt-8 text-center">
            <span className="text-white font-bold text-md">Don't have an Account? </span>
            <Link to="/signup" className="text-lime-400 font-bold ml-1">SIGN UP</Link>
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

export default Login;