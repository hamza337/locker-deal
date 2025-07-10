import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const AthleteForm = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen bg-cover bg-center flex flex-col items-center justify-center relative px-4 py-8" style={{ backgroundImage: 'url(/bgApp.png)' }}>
      {/* Top row: Centered logo and right-aligned link */}
      <div className="w-full max-w-6xl flex items-center justify-center mt-4 mb-8 relative">
        <div className="flex-1 flex justify-center">
          <img src="/appLogo.png" alt="Locker Deal Logo" className="h-16" />
        </div>
        <Link
          to="/login"
          className="absolute right-0 top-1 text-[#9afa00] font-bold text-md"
        >
          Already have an account?
        </Link>
      </div>
      {/* Heading */}
      <h2 className="text-white text-3xl md:text-4xl font-bold text-center mb-8 tracking-wide">ATHLETE</h2>
      {/* Form */}
      <form className="w-full max-w-6xl bg-transparent flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* First Name */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter your First Name"
              className="w-full bg-black bg-opacity-60 border border-white rounded-md px-6 py-4 text-white placeholder-gray-400 outline-none"
            />
          </div>
          {/* Last Name */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter your Last Name"
              className="w-full bg-black bg-opacity-60 border border-white rounded-md px-6 py-4 text-white placeholder-gray-400 outline-none"
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="email">Email</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-6 py-4">
              <FaEnvelope className="text-[#9afa00] mr-2" />
              <input
                id="email"
                type="email"
                placeholder="Enter your Email"
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          {/* Confirm Email */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="confirmEmail">Confirm Email</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-6 py-4">
              <FaEnvelope className="text-[#9afa00] mr-2" />
              <input
                id="confirmEmail"
                type="email"
                placeholder="Confirm your Email"
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          {/* Password */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="password">Password</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-6 py-4">
              <FaLock className="text-[#9afa00] mr-2" />
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          {/* Confirm Password */}
          <div>
            <label className="block text-white font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-white rounded-md px-6 py-4">
              <FaLock className="text-[#9afa00] mr-2" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••••••"
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
        {/* Terms & Conditions stacked */}
        <div className="flex flex-col gap-2 mt-2">
          <a href="#" className="text-[#9afa00] font-bold text-md hover:underline">VIEW TERMS & CONDITIONS</a>
          <label className="flex items-center gap-2 text-white text-md">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-[#9afa00] rounded" />
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
          <Link 
            to="/verify-otp"
            className="w-full text-center bg-[#9afa00] hover:shadow-[0_0_24px_6px_#9afa00] text-black font-bold py-3 rounded-md text-lg tracking-wider shadow-md cursor-pointer transition-shadow duration-300"
          >
            SIGN UP
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AthleteForm;