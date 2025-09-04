import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaGlobe, FaGraduationCap, FaUsers, FaHashtag, FaBullhorn, FaHandshake, FaHeart, FaLightbulb, FaTrophy } from 'react-icons/fa';
import { MdSportsVolleyball, MdLocationOn } from "react-icons/md";
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaTiktok } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const AthleteForm = () => {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Form state with all required fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    origin: '',
    schoolAndClassYear: '',
    sport: '',
    position: '',
    audienceDemographics: '',
    contentNiche: '',
    pastCollaborations: '',
    brandPreferences: '',
    uniquePitch: '',
    instagram: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    followersCount: '',
    achievements: '',
    profileType: 'College',
    agreeToTerms: false
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Profile type options
  const profileTypes = ['High School', 'College', 'Professional'];
  
  // Content niche options
  const contentNiches = [
    'Training & Fitness',
    'Lifestyle',
    'Gaming',
    'Fashion',
    'Nutrition',
    'Motivation',
    'Behind the Scenes',
    'Educational',
    'Entertainment'
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  // Validation function
  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'confirmEmail', 'password', 'confirmPassword',
      'phoneNumber', 'origin', 'schoolAndClassYear', 'sport', 'position',
      'audienceDemographics', 'contentNiche', 'uniquePitch'
    ];

    // Check required fields
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    if (formData.email !== formData.confirmEmail) {
      toast.error('Email addresses do not match.');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return false;
    }

    // Phone number validation
    const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number.');
      return false;
    }

    // Followers count validation
    if (formData.followersCount && isNaN(formData.followersCount)) {
      toast.error('Followers count must be a number.');
      return false;
    }

    // Terms agreement
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms & conditions to continue.');
      return false;
    }

    return true;
  };

  // Handle signup
  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        confirmEmail: formData.confirmEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber,
        origin: formData.origin,
        schoolAndClassYear: formData.schoolAndClassYear,
        sport: formData.sport,
        position: formData.position,
        audienceDemographics: formData.audienceDemographics,
        contentNiche: formData.contentNiche,
        pastCollaborations: formData.pastCollaborations || '',
        brandPreferences: formData.brandPreferences || '',
        uniquePitch: formData.uniquePitch,
        instagram: formData.instagram || '',
        facebook: formData.facebook || '',
        twitter: formData.twitter || '',
        linkedin: formData.linkedin || '',
        youtube: formData.youtube || '',
        tiktok: formData.tiktok || '',
        followersCount: parseInt(formData.followersCount) || 0,
        achievements: formData.achievements || '',
        profileType: formData.profileType
      };
      
      const response = await axios.post(`${baseUrl}auth/signup-athlete`, apiData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Account created successfully!');
        navigate('/verify-otp', { state: { email: formData.email } });
      }
    } catch (error) {
      if(error?.response?.status === 400 && error?.response?.data?.isVerified) {
        toast.error('Email already verified. Please login.');
        navigate('/');
      } else if(error?.response?.status === 400 && !error?.response?.data?.isVerified) {
        toast.error('Email already registered. Please verify your email.');
        navigate('/verify-otp', { state: { email: formData.email } });
      } else {
        toast.error(error.response?.data?.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-center relative px-4 sm:px-8 md:px-12 py-8 md:py-12" style={{ backgroundImage: 'url(/bgApp.png)' }}>
      {/* Header */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center md:justify-between mt-4 mb-8 gap-2 md:gap-0">
        <div className="flex justify-center w-full md:w-auto">
          <img src="/appLogo.png" alt="Locker Deal Logo" className="h-14 md:h-16" />
        </div>
        <Link
          to="/login"
          className="text-[#9afa00] font-bold text-md mt-2 md:mt-0 hover:underline"
        >
          Already have an account?
        </Link>
      </div>
      
      {/* Heading */}
      <h2 className="text-white text-2xl md:text-4xl font-bold text-center mb-2 tracking-wide">ATHLETE REGISTRATION</h2>
      <p className="text-gray-300 text-center mb-8 max-w-2xl">Join our platform and connect with brands for exciting collaboration opportunities</p>
      
      {/* Form */}
      <form className="w-full max-w-6xl bg-black bg-opacity-40 rounded-2xl p-6 md:p-8 backdrop-blur-sm border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Personal Information Section */}
          <div className="lg:col-span-3">
            <h3 className="text-[#9afa00] text-xl font-bold mb-4 flex items-center gap-2">
              <FaUsers /> Personal Information
            </h3>
          </div>
          
          {/* First Name */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-[#9afa00] transition-colors"
            />
          </div>
          
          {/* Last Name */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-[#9afa00] transition-colors"
            />
          </div>
          
          {/* Phone Number */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="phoneNumber">Phone Number *</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaPhone className="text-[#9afa00] mr-3" />
              <input
                id="phoneNumber"
                type="tel"
                placeholder="+1234567890"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="email">Email *</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaEnvelope className="text-[#9afa00] mr-3" />
              <input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Confirm Email */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="confirmEmail">Confirm Email *</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaEnvelope className="text-[#9afa00] mr-3" />
              <input
                id="confirmEmail"
                type="email"
                placeholder="Confirm your email"
                value={formData.confirmEmail}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Origin */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="origin">Origin/National Background *</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaGlobe className="text-[#9afa00] mr-3" />
              <input
                id="origin"
                type="text"
                placeholder="e.g., USA, Canada, Mexico"
                value={formData.origin}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="password">Password *</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaLock className="text-[#9afa00] mr-3" />
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
            <label className="block text-white font-semibold mb-2" htmlFor="confirmPassword">Confirm Password *</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaLock className="text-[#9afa00] mr-3" />
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
          
          {/* Academic & Athletic Information Section */}
          <div className="lg:col-span-3 mt-6">
            <h3 className="text-[#9afa00] text-xl font-bold mb-4 flex items-center gap-2">
              <FaGraduationCap /> Academic & Athletic Information
            </h3>
          </div>
          
          {/* School & Class Year */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="schoolAndClassYear">School & Class Year *</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaGraduationCap className="text-[#9afa00] mr-3" />
              <input
                id="schoolAndClassYear"
                type="text"
                placeholder="e.g., Texas High 2024"
                value={formData.schoolAndClassYear}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Sport */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="sport">Sport *</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <MdSportsVolleyball className="text-[#9afa00] mr-3" />
              <input
                id="sport"
                type="text"
                placeholder="e.g., Basketball, Football, Soccer"
                value={formData.sport}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Position */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="position">Position *</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <MdLocationOn className="text-[#9afa00] mr-3" />
              <input
                id="position"
                type="text"
                placeholder="e.g., Point Guard, Quarterback"
                value={formData.position}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Profile Type */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="profileType">Profile Type</label>
            <select
              id="profileType"
              value={formData.profileType}
              onChange={handleInputChange}
              className="w-full bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 text-white outline-none focus:border-[#9afa00] transition-colors"
            >
              {profileTypes.map(type => (
                <option key={type} value={type} className="bg-black">{type}</option>
              ))}
            </select>
          </div>
          
          {/* Achievements */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="achievements">Achievements</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaTrophy className="text-[#9afa00] mr-3" />
              <input
                id="achievements"
                type="text"
                placeholder="e.g., MVP 2023, State Champion"
                value={formData.achievements}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Social Media & Content Section */}
          <div className="lg:col-span-3 mt-6">
            <h3 className="text-[#9afa00] text-xl font-bold mb-4 flex items-center gap-2">
              <FaHashtag /> Social Media & Content
            </h3>
          </div>
          
          {/* Instagram */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="instagram">Instagram Handle</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaInstagram className="text-[#9afa00] mr-3" />
              <input
                id="instagram"
                type="text"
                placeholder="@yourusername"
                value={formData.instagram}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* TikTok */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="tiktok">TikTok Handle</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaTiktok className="text-[#9afa00] mr-3" />
              <input
                id="tiktok"
                type="text"
                placeholder="@yourusername"
                value={formData.tiktok}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Twitter */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="twitter">Twitter Handle</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaTwitter className="text-[#9afa00] mr-3" />
              <input
                id="twitter"
                type="text"
                placeholder="@yourusername"
                value={formData.twitter}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Facebook */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="facebook">Facebook Profile</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaFacebook className="text-[#9afa00] mr-3" />
              <input
                id="facebook"
                type="text"
                placeholder="your.profile.name"
                value={formData.facebook}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* LinkedIn */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="linkedin">LinkedIn Profile</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaLinkedin className="text-[#9afa00] mr-3" />
              <input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedin}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* YouTube */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="youtube">YouTube Channel</label>
            <div className="flex items-center bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaYoutube className="text-[#9afa00] mr-3" />
              <input
                id="youtube"
                type="url"
                placeholder="https://youtube.com/yourchannel"
                value={formData.youtube}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Followers Count */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="followersCount">Total Followers Count</label>
            <input
              id="followersCount"
              type="number"
              placeholder="e.g., 12000"
              value={formData.followersCount}
              onChange={handleInputChange}
              className="w-full bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-[#9afa00] transition-colors"
            />
          </div>
          
          {/* Content Niche */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="contentNiche">Content Niche *</label>
            <select
              id="contentNiche"
              value={formData.contentNiche}
              onChange={handleInputChange}
              className="w-full bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 text-white outline-none focus:border-[#9afa00] transition-colors"
            >
              <option value="" className="bg-black">Select your content niche</option>
              {contentNiches.map(niche => (
                <option key={niche} value={niche} className="bg-black">{niche}</option>
              ))}
            </select>
          </div>
          
          {/* Audience Demographics */}
          <div className="lg:col-span-2">
            <label className="block text-white font-semibold mb-2" htmlFor="audienceDemographics">Audience Demographics *</label>
            <div className="flex items-start bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaUsers className="text-[#9afa00] mr-3 mt-1" />
              <textarea
                id="audienceDemographics"
                placeholder="Describe your followers (age range, location, interests)"
                value={formData.audienceDemographics}
                onChange={handleInputChange}
                rows={3}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400 resize-none"
              />
            </div>
          </div>
          
          {/* Brand Collaboration Section */}
          <div className="lg:col-span-3 mt-6">
            <h3 className="text-[#9afa00] text-xl font-bold mb-4 flex items-center gap-2">
              <FaHandshake /> Brand Collaboration
            </h3>
          </div>
          
          {/* Past Collaborations */}
          <div className="lg:col-span-2">
            <label className="block text-white font-semibold mb-2" htmlFor="pastCollaborations">Past Collaborations</label>
            <div className="flex items-start bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaHandshake className="text-[#9afa00] mr-3 mt-1" />
              <textarea
                id="pastCollaborations"
                placeholder="List brands you've worked with (e.g., Nike Junior Program, Local Sports Store)"
                value={formData.pastCollaborations}
                onChange={handleInputChange}
                rows={3}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400 resize-none"
              />
            </div>
          </div>
          
          {/* Brand Preferences */}
          <div>
            <label className="block text-white font-semibold mb-2" htmlFor="brandPreferences">Brand Preferences</label>
            <div className="flex items-start bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaHeart className="text-[#9afa00] mr-3 mt-1" />
              <textarea
                id="brandPreferences"
                placeholder="What types of brands/products would you love to work with?"
                value={formData.brandPreferences}
                onChange={handleInputChange}
                rows={3}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400 resize-none"
              />
            </div>
          </div>
          
          {/* Unique Pitch */}
          <div className="lg:col-span-3">
            <label className="block text-white font-semibold mb-2" htmlFor="uniquePitch">Unique Pitch *</label>
            <div className="flex items-start bg-black bg-opacity-60 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-[#9afa00] transition-colors">
              <FaLightbulb className="text-[#9afa00] mr-3 mt-1" />
              <textarea
                id="uniquePitch"
                placeholder="In one sentence, what are your goals in the NIL Space?"
                value={formData.uniquePitch}
                onChange={handleInputChange}
                rows={2}
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400 resize-none"
              />
            </div>
          </div>
        </div>
        
        {/* Terms & Conditions */}
        <div className="mt-8 p-4 bg-black bg-opacity-40 rounded-lg border border-gray-600">
          <a href="#" className="text-[#9afa00] font-bold text-md hover:underline block mb-3">VIEW TERMS & CONDITIONS</a>
          <label className="flex items-start gap-3 text-white text-md cursor-pointer">
            <input 
              id="agreeToTerms"
              type="checkbox" 
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="form-checkbox h-5 w-5 text-[#9afa00] rounded mt-1 flex-shrink-0" 
            />
            <span>I agree to the terms & conditions and confirm that all information provided is accurate and truthful.</span>
          </label>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button
            type="button"
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-lg text-lg tracking-wider transition-colors duration-200"
            onClick={() => navigate(-1)}
          >
            BACK
          </button>
          <button
            type="button"
            onClick={handleSignup}
            disabled={isLoading}
            className={`flex-1 font-bold py-4 rounded-lg text-lg tracking-wider shadow-lg transition-all duration-300 ${
              isLoading 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-[#9afa00] hover:bg-[#baff32] hover:shadow-[0_0_24px_6px_#9afa00] text-black cursor-pointer'
            }`}
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AthleteForm;