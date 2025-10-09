import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaTimes, FaCheckCircle, FaCamera, FaCrop, FaUsers, FaGraduationCap, FaHashtag, FaHandshake, FaCrown, FaTrophy } from 'react-icons/fa';
import { MdSportsVolleyball, MdLocationOn } from 'react-icons/md';
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaTiktok } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../../services/uploadService';
import axios from 'axios';
import toast from 'react-hot-toast';
import subscriptionService from '../../services/subscriptionService';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState('/default-avatar.svg');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropData, setCropData] = useState({ x: 0, y: 0, size: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [athleteFormData, setAthleteFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    origin: '',
    schoolAndClassYear: '',
    sport: '',
    position: '',
    profileType: 'College',
    achievements: '',
    instagram: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    followersCount: '',
    audienceDemographics: '',
    contentNiche: '',
    pastCollaborations: '',
    brandPreferences: '',
    uniquePitch: ''
  });
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Get user data from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      
      // Populate athlete form data if user is athlete
      if (parsedUser.role === 'athlete' && parsedUser.athleteProfile) {
        setAthleteFormData({
          firstName: parsedUser.athleteProfile.firstName || '',
          lastName: parsedUser.athleteProfile.lastName || '',
          phoneNumber: parsedUser.athleteProfile.phoneNumber || '',
          origin: parsedUser.athleteProfile.origin || '',
          schoolAndClassYear: parsedUser.athleteProfile.schoolAndClassYear || '',
          sport: parsedUser.athleteProfile.sport || '',
          position: parsedUser.athleteProfile.position || '',
          profileType: parsedUser.athleteProfile.profileType || 'College',
          achievements: parsedUser.athleteProfile.achievements || '',
          instagram: parsedUser.athleteProfile.instagram || '',
          facebook: parsedUser.athleteProfile.facebook || '',
          twitter: parsedUser.athleteProfile.twitter || '',
          linkedin: parsedUser.athleteProfile.linkedin || '',
          youtube: parsedUser.athleteProfile.youtube || '',
          tiktok: parsedUser.athleteProfile.tiktok || '',
          followersCount: parsedUser.athleteProfile.followersCount || '',
          audienceDemographics: parsedUser.athleteProfile.audienceDemographics || '',
          contentNiche: parsedUser.athleteProfile.contentNiche || '',
          pastCollaborations: parsedUser.athleteProfile.pastCollaborations || '',
          brandPreferences: parsedUser.athleteProfile.brandPreferences || '',
          uniquePitch: parsedUser.athleteProfile.uniquePitch || ''
        });
      }
    }
  }, []);

  // Helper functions to get user profile data with fallbacks
  const getUserName = () => {
    if (userData?.role === 'athlete') {
      // Check if athleteProfile exists and has name data
      if (userData?.athleteProfile) {
        const firstName = userData.athleteProfile.firstName;
        const lastName = userData.athleteProfile.lastName;
        if (firstName && lastName) {
          return `${firstName} ${lastName}`;
        } else if (firstName) {
          return firstName;
        }
      }
      // Fallback for null athleteProfile
      return 'Professional Athlete';
    } else if (userData?.role === 'brand') {
      // Check if brandProfile exists and has name data
      if (userData?.brandProfile) {
        const brandName = userData.brandProfile.brandName || userData.brandProfile.companyName;
        if (brandName) {
          return brandName;
        }
      }
      // Fallback for null brandProfile
      return 'Brand';
    }
    return 'Athlete';
  };

  const getUserEmail = () => {
    return userData?.email || 'user@professional.com';
  };

  const getUserProfileImage = () => {
    if (userData?.role === 'athlete') {
      // Check if athleteProfile exists and has profile picture
      if (userData?.athleteProfile?.profilePictureUrl) {
        return userData.athleteProfile.profilePictureUrl;
      }
    } else if (userData?.role === 'brand') {
      // Check if brandProfile exists and has logo or profile picture
      if (userData?.brandProfile?.logo) {
        return userData.brandProfile.logo;
      } else if (userData?.brandProfile?.profilePictureUrl) {
        return userData.brandProfile.profilePictureUrl;
      }
    }
    // Return professional default avatar for all cases
    return '/default-avatar.svg';
  };

  const getBrandCategory = () => {
    return userData?.brandProfile?.category || userData?.brandProfile?.industry || 'Professional Services';
  };

  const getSubscriptionPlan = () => {
    return userData?.subscriptionPlan || 'PAY_PER_DEAL';
  };

  const getSubscriptionBadgeColor = (plan) => {
    switch(plan) {
      case 'PREMIUM':
      case 'PREMIUM_MONTHLY':
        return 'bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black';
      case 'PAY_PER_DEAL':
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    }
  };

  const handleUpgradeSubscription = () => {
    subscriptionService.showRestrictionPopup('upgrade');
    setProfileModalOpen(false);
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your Premium subscription? You will be switched back to Pay Per Deal.')) {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}payment/cancel-subscription`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          toast.success('Subscription cancelled successfully. You are now on Pay Per Deal.');
          // Update user data to reflect the change
          const updatedUserData = { ...userData, subscriptionPlan: 'PAY_PER_DEAL' };
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
          window.location.reload(); // Refresh to update UI
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to cancel subscription');
        }
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        toast.error('An error occurred while cancelling subscription');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle athlete form data changes
  const handleAthleteInputChange = (e) => {
    const { name, value } = e.target;
    setAthleteFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update athlete profile
  const updateAthleteProfile = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const updateData = { ...athleteFormData };
      
      // Add profile image URL if it exists
      if (profileImage && profileImage !== 'https://randomuser.me/api/portraits/men/32.jpg') {
        updateData.profilePictureUrl = profileImage;
      }

      const response = await axios.patch(
        `${baseUrl}users/athlete-profile`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Update localStorage with new data
        const updatedUserData = {
          ...userData,
          athleteProfile: {
            ...userData.athleteProfile,
            ...updateData
          }
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        
        toast.success('Profile updated successfully!');
        setProfileModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating athlete profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      canvas.width = cropData.size;
      canvas.height = cropData.size;
      
      ctx.drawImage(
        img,
        cropData.x, cropData.y, cropData.size, cropData.size,
        0, 0, cropData.size, cropData.size
      );
      
      try {
        setIsUploading(true);
        
        // Convert canvas to blob
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', 0.8);
        });
        
        // Create file from blob
        const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
        
        // Upload to S3
        const uploadResult = await uploadFile(file);
        
        // Update profile image
        setProfileImage(uploadResult.mediaUrl);
        
        // Update user data in localStorage if needed
        if (userData) {
          const updatedUserData = { ...userData };
          if (userData.role === 'athlete') {
            updatedUserData.athleteProfile = {
              ...updatedUserData.athleteProfile,
              profileImage: uploadResult.mediaUrl
            };
          } else if (userData.role === 'brand') {
            updatedUserData.brandProfile = {
              ...updatedUserData.brandProfile,
              profileImage: uploadResult.mediaUrl
            };
          }
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          setUserData(updatedUserData);
        }
        
        toast.success('Profile image updated successfully!');
        setCropModalOpen(false);
        setSelectedImage(null);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cropX = (cropData.x / (imageRef.current?.naturalWidth || 1)) * rect.width;
    const cropY = (cropData.y / (imageRef.current?.naturalHeight || 1)) * rect.height;
    const cropSize = (cropData.size / (imageRef.current?.naturalWidth || 1)) * rect.width;
    
    if (x >= cropX && x <= cropX + cropSize && y >= cropY && y <= cropY + cropSize) {
      setIsDragging(true);
      setDragStart({ x: x - cropX, y: y - cropY });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imageRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;
    
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    
    const newX = Math.max(0, Math.min(x * scaleX, imageRef.current.naturalWidth - cropData.size));
    const newY = Math.max(0, Math.min(y * scaleY, imageRef.current.naturalHeight - cropData.size));
    
    setCropData(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 bg-transparent">
      {/* Left: Logo */}
      <img 
        src="/appLogo.png" 
        alt="Locker Deal Logo" 
        className="h-10 md:h-12 cursor-pointer hover:opacity-80 transition" 
        onClick={() => {
          if (userData?.role === 'athlete') {
            navigate('/dashboard');
          } else if (userData?.role === 'brand') {
            navigate('/brand/dashboard');
          }
        }}
      />
      {/* Right: User Info (hidden on mobile) and menu */}
      <div className="flex items-center gap-4 relative">
        {/* Profile info and avatar only on md+ */}
        <div className="hidden md:flex items-center gap-4">
          <img
            src={getUserProfileImage()}
            alt="User Avatar"
            className="h-12 w-12 md:h-12 md:w-12 rounded-full object-cover border-2 border-white"
          />
          <div className="flex flex-col items-start justify-center">
            <span className="text-white font-bold text-base md:text-lg leading-tight">{getUserName()}</span>
            <span className="text-white text-xs md:text-md leading-tight">{getUserEmail()}</span>
          </div>
        </div>
        {/* Three dots always visible */}
        <div className="relative" ref={menuRef}>
          <FaEllipsisV className="text-white text-2xl ml-2 cursor-pointer" onClick={() => setMenuOpen(v => !v)} />
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#232626] rounded-lg shadow-lg py-2 z-50 border border-[#9afa00] animate-fadeIn">
              <button
                className="w-full text-left px-4 py-2 text-white hover:bg-[#181c1a] transition text-sm"
                onClick={() => { setMenuOpen(false); setProfileModalOpen(true); }}
              >
                View Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-[#9afa00] hover:bg-[#181c1a] transition text-sm font-bold"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
        {/* Profile Modal */}
        {profileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm px-2 md:px-0">
            <div className="relative w-full max-w-2xl bg-[#23281e] rounded-2xl shadow-lg p-0 flex flex-col animate-fadeIn max-h-[90vh]">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-[#9afa00] text-2xl hover:text-white transition z-10"
                onClick={() => setProfileModalOpen(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
              {/* Header */}
              <div className="w-full flex flex-row items-center gap-4 bg-[#23281e] rounded-t-2xl px-6 pt-6 pb-4 border-b border-[#2e3627]">
                <div className="relative">
                  <img src={getUserProfileImage()} alt="User Avatar" className="h-14 w-14 rounded-full object-cover border-2 border-[#9afa00]" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-[#9afa00] text-black rounded-full p-1.5 hover:bg-[#baff32] transition"
                    title="Change Profile Picture"
                  >
                    <FaCamera className="text-xs" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-white font-bold text-lg md:text-xl">{getUserName()}</span>
                  <span className="text-[#baff32] text-base md:text-lg">{getBrandCategory()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-[#9afa00] text-xl" />
                  <span className="text-[#9afa00] font-bold text-sm md:text-base">Successfully Verified</span>
                </div>
              </div>
              {/* Tabs */}
              <div className="flex flex-row w-full border-b border-[#2e3627] bg-[#23281e] px-6">
                {userData?.role === 'athlete' ? (
                  <>
                    <button
                      className={`py-4 px-4 font-bold uppercase text-base md:text-lg transition-all border-b-4 ${activeTab === 'personal' ? 'text-[#9afa00] border-[#9afa00]' : 'text-white border-transparent hover:text-[#9afa00]'}`}
                      onClick={() => setActiveTab('personal')}
                    >
                      Personal
                    </button>
                    <button
                      className={`py-4 px-4 font-bold uppercase text-base md:text-lg transition-all border-b-4 ${activeTab === 'social' ? 'text-[#9afa00] border-[#9afa00]' : 'text-white border-transparent hover:text-[#9afa00]'}`}
                      onClick={() => setActiveTab('social')}
                    >
                      Social
                    </button>
                    <button
                      className={`py-4 px-4 font-bold uppercase text-base md:text-lg transition-all border-b-4 ${activeTab === 'preferences' ? 'text-[#9afa00] border-[#9afa00]' : 'text-white border-transparent hover:text-[#9afa00]'}`}
                      onClick={() => setActiveTab('preferences')}
                    >
                      Preferences
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`py-4 px-4 font-bold uppercase text-base md:text-lg transition-all border-b-4 ${activeTab === 'brand' ? 'text-[#9afa00] border-[#9afa00]' : 'text-white border-transparent hover:text-[#9afa00]'}`}
                      onClick={() => setActiveTab('brand')}
                    >
                      Brand Identity
                    </button>
                    <button
                      className={`py-4 px-4 font-bold uppercase text-base md:text-lg transition-all border-b-4 ${activeTab === 'account' ? 'text-[#9afa00] border-[#9afa00]' : 'text-white border-transparent hover:text-[#9afa00]'}`}
                      onClick={() => setActiveTab('account')}
                    >
                      Account Setting
                    </button>
                  </>
                )}
              </div>
              {/* Tab Content */}
              <div className="flex-1 flex flex-col min-h-[300px]">
                <div className="flex-1 overflow-y-auto px-6 pt-4 pb-2 max-h-[60vh]">
                  {userData?.role === 'athlete' ? (
                    <form className="flex flex-col gap-6">
                      {activeTab === 'personal' && (
                        <>
                          {/* Personal Information Section */}
                      <div>
                        <h3 className="text-[#9afa00] text-xl font-bold mb-4 flex items-center gap-2">
                          <FaUsers /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">First Name *</label>
                            <input 
                              name="firstName"
                              value={athleteFormData.firstName}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Last Name *</label>
                            <input 
                              name="lastName"
                              value={athleteFormData.lastName}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="Enter last name"
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Phone Number *</label>
                            <input 
                              name="phoneNumber"
                              value={athleteFormData.phoneNumber}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="+1234567890"
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Origin/National Background *</label>
                            <input 
                              name="origin"
                              value={athleteFormData.origin}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="e.g., USA, Canada, Mexico"
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Email *</label>
                            <input 
                              type="email"
                              value={getUserEmail()}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="Enter email address"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      {/* Academic & Athletic Information Section */}
                      <div>
                        <h3 className="text-[#9afa00] text-xl font-bold mb-4 flex items-center gap-2">
                          <FaGraduationCap /> Academic & Athletic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">School & Class Year *</label>
                            <input 
                              name="schoolAndClassYear"
                              value={athleteFormData.schoolAndClassYear}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="e.g., Texas High 2024"
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Sport *</label>
                            <input 
                              name="sport"
                              value={athleteFormData.sport}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="e.g., Basketball, Football, Soccer"
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Position *</label>
                            <input 
                              name="position"
                              value={athleteFormData.position}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="e.g., Point Guard, Quarterback"
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Profile Type</label>
                            <select 
                              name="profileType"
                              value={athleteFormData.profileType}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm"
                            >
                              <option value="High School">High School</option>
                              <option value="College">College</option>
                              <option value="Professional">Professional</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-white text-sm md:text-base mb-1 block">Achievements</label>
                            <input 
                              name="achievements"
                              value={athleteFormData.achievements}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="e.g., MVP 2023, State Champion"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-white text-sm md:text-base mb-1 block">Audience Demographics</label>
                            <input 
                              name="audienceDemographics"
                              value={athleteFormData.audienceDemographics}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="e.g., 18-24 years old, 60% male, sports enthusiasts"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-white text-sm md:text-base mb-1 block">Past Collaborations</label>
                            <input 
                              name="pastCollaborations"
                              value={athleteFormData.pastCollaborations}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="e.g., Nike, Adidas, Local Sports Store"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-white text-sm md:text-base mb-1 block">Brand Preferences</label>
                            <input 
                              name="brandPreferences"
                              value={athleteFormData.brandPreferences}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="e.g., Athletic wear, Health supplements, Tech gadgets"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-white text-sm md:text-base mb-1 block">Unique Pitch</label>
                            <textarea 
                              name="uniquePitch"
                              value={athleteFormData.uniquePitch}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                              placeholder="What makes you unique as an athlete and influencer?"
                              rows="3"
                            />
                          </div>
                        </div>
                      </div>



                      {/* Brand Collaboration Section */}
                      <div>
                        <h3 className="text-[#9afa00] text-xl font-bold mb-4 flex items-center gap-2">
                          <FaHandshake /> Brand Collaboration
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Audience Demographics *</label>
                            <textarea 
                              name="audienceDemographics"
                              value={athleteFormData.audienceDemographics}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm min-h-[60px]" 
                              placeholder="Describe your followers (age range, location, interests)"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Past Collaborations</label>
                            <textarea 
                              name="pastCollaborations"
                              value={athleteFormData.pastCollaborations}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm min-h-[60px]" 
                              placeholder="List brands you've worked with (e.g., Nike Junior Program, Local Sports Store)"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Brand Preferences</label>
                            <textarea 
                              name="brandPreferences"
                              value={athleteFormData.brandPreferences}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm min-h-[60px]" 
                              placeholder="What types of brands/products would you love to work with?"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Unique Pitch *</label>
                            <textarea 
                              name="uniquePitch"
                              value={athleteFormData.uniquePitch}
                              onChange={handleAthleteInputChange}
                              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm min-h-[60px]" 
                              placeholder="In one sentence, what are your goals in the NIL Space?"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                        </>
                      )}
                      
                      {activeTab === 'social' && (
                        <>
                          {/* Social Media & Content Section */}
                          <div>
                            <h3 className="text-[#9afa00] text-xl font-bold mb-4 flex items-center gap-2">
                              <FaHashtag /> Social Media & Content
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-white text-sm md:text-base mb-1 block flex items-center gap-2">
                                  <FaInstagram className="text-pink-500" /> Instagram Handle
                                </label>
                                <input 
                                  name="instagram"
                                  value={athleteFormData.instagram}
                                  onChange={handleAthleteInputChange}
                                  className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                                  placeholder="@your_handle"
                                />
                              </div>
                              <div>
                                <label className="text-white text-sm md:text-base mb-1 block flex items-center gap-2">
                                  <FaTiktok className="text-black" /> TikTok Handle
                                </label>
                                <input 
                                  name="tiktok"
                                  value={athleteFormData.tiktok}
                                  onChange={handleAthleteInputChange}
                                  className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                                  placeholder="@your_handle"
                                />
                              </div>
                              <div>
                                <label className="text-white text-sm md:text-base mb-1 block flex items-center gap-2">
                                  <FaTwitter className="text-blue-400" /> Twitter Handle
                                </label>
                                <input 
                                  name="twitter"
                                  value={athleteFormData.twitter}
                                  onChange={handleAthleteInputChange}
                                  className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                                  placeholder="@your_handle"
                                />
                              </div>
                              <div>
                                <label className="text-white text-sm md:text-base mb-1 block flex items-center gap-2">
                                  <FaYoutube className="text-red-500" /> YouTube Channel
                                </label>
                                <input 
                                  name="youtube"
                                  value={athleteFormData.youtube}
                                  onChange={handleAthleteInputChange}
                                  className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                                  placeholder="@your_channel"
                                />
                              </div>
                              <div>
                                <label className="text-white text-sm md:text-base mb-1 block flex items-center gap-2">
                                  <FaLinkedin className="text-blue-600" /> LinkedIn Profile
                                </label>
                                <input 
                                  name="linkedin"
                                  value={athleteFormData.linkedin}
                                  onChange={handleAthleteInputChange}
                                  className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                                  placeholder="@your_profile"
                                />
                              </div>
                              <div>
                                <label className="text-white text-sm md:text-base mb-1 block flex items-center gap-2">
                                  <FaFacebook className="text-blue-500" /> Facebook Profile
                                </label>
                                <input 
                                  name="facebook"
                                  value={athleteFormData.facebook}
                                  onChange={handleAthleteInputChange}
                                  className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                                  placeholder="@your_profile"
                                />
                              </div>
                              <div>
                                <label className="text-white text-sm md:text-base mb-1 block">Followers Count</label>
                                <input 
                                  name="followersCount"
                                  value={athleteFormData.followersCount}
                                  onChange={handleAthleteInputChange}
                                  className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" 
                                  placeholder="e.g., 10000"
                                />
                              </div>
                              <div>
                                <label className="text-white text-sm md:text-base mb-1 block">Content Niche</label>
                                <select 
                                  name="contentNiche"
                                  value={athleteFormData.contentNiche}
                                  onChange={handleAthleteInputChange}
                                  className="w-full bg-[#181c1a] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm"
                                >
                                  <option value="">Select Content Niche</option>
                                  <option value="Gaming">Gaming</option>
                                  <option value="Sports">Sports</option>
                                  <option value="Fitness">Fitness</option>
                                  <option value="Lifestyle">Lifestyle</option>
                                  <option value="Education">Education</option>
                                  <option value="Entertainment">Entertainment</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {activeTab === 'preferences' && (
                        <>
                          {/* Multi-Factor Authentication Section */}
                          <div className="bg-[#232626] rounded-lg p-4">
                            <h3 className="text-[#9afa00] text-xl font-bold mb-4">Multi-Factor Authentication</h3>
                            <p className="text-white text-xs md:text-sm mb-4">You can enable MFA to add an extra layer of security to your account. When you log in, you will be required to enter a code sent to your phone or email address.</p>
                            <div className="flex items-center gap-2 mb-4">
                              <input type="checkbox" id="athlete-enable-mfa" className="accent-[#9afa00] w-4 h-4" />
                              <label htmlFor="athlete-enable-mfa" className="text-white text-xs md:text-sm">Enable MFA</label>
                            </div>
                            <div>
                              <label className="text-white text-xs md:text-sm mb-1 block">MFA Device</label>
                              <select className="w-full bg-[#181c1a] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm">
                                <option>Email</option>
                                <option>SMS</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}
                    </form>
                  ) : activeTab === 'brand' && (
                    <form className="flex flex-col gap-6">
                      {/* Brand Representatives */}
                      <div>
                        <span className="text-[#9afa00] font-bold text-lg flex items-center gap-2">BRAND REPRESENTATIVES <FaCheckCircle className="text-[#9afa00] text-base" /></span>
                        <div className="text-white mt-2 text-sm md:text-base">Name: {getUserName()}</div>
                        <div className="text-white text-sm md:text-base">Job Title: {userData?.brandProfile?.jobTitle || 'Not Specified'}</div>
                      </div>
                      {/* Brand Identity */}
                      <div>
                        <span className="text-[#9afa00] font-bold text-lg">BRAND IDENTITY</span>
                        <div className="mt-2 flex flex-col gap-4">
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Brand Name</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue={userData?.brandProfile?.brandName || userData?.brandProfile?.companyName || 'Professional Brand'} />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Brand Website URL</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue={userData?.brandProfile?.website || 'https://professional-brand.com'} />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Brand Category</label>
                            <select className="w-full bg-[#181c1a] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm">
                              <option>{getBrandCategory()}</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Company Size (Employees)</label>
                            <select className="w-full bg-[#181c1a] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm">
                              <option>Media & Entertainment</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      {/* Social Links */}
                      <div>
                        <span className="text-[#9afa00] font-bold text-lg">SOCIAL LINKS</span>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Instagram</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Tiktok</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Twitter</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Facebook</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Youtube</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">LinkedIn</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="text-white text-sm md:text-base mb-1 block">Brand Description</label>
                          <textarea className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm min-h-[60px]" placeholder="Type your Brand Description here" />
                        </div>
                      </div>
                    </form>
                  )}
                  {activeTab === 'account' && (
                    <form className="flex flex-col gap-6">
                      {/* Public Display Info */}
                      <div>
                        <span className="text-[#9afa00] font-bold text-lg">PUBLIC DISPLAY INFORMATION</span>
                        <div className="mt-2 flex flex-col gap-4">
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">First Name</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue={userData?.athleteProfile?.firstName || userData?.brandProfile?.firstName || 'Professional'} />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Last Name</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue={userData?.athleteProfile?.lastName || userData?.brandProfile?.lastName || 'User'} />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Job Title</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue={userData?.brandProfile?.jobTitle || userData?.athleteProfile?.position || 'Professional'} placeholder="Enter Job Title" />
                          </div>
                        </div>
                      </div>
                      {/* Account & Security */}
                      <div>
                        <span className="text-[#9afa00] font-bold text-lg">ACCOUNT & SECURITY</span>
                        <div className="mt-2 flex flex-col gap-4">
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Email</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue={getUserEmail()} />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Phone Number</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue={userData?.athleteProfile?.phoneNumber || userData?.brandProfile?.phoneNumber || '+1 (555) 123-4567'} />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Extension</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" placeholder="Ext." />
                          </div>
                        </div>
                      </div>
                      {/* MFA */}
                      <div className="bg-[#232626] rounded-lg p-4 mt-2">
                        <span className="text-[#9afa00] font-bold text-lg block mb-2">MULTI FACTOR AUTHENTICATION</span>
                        <p className="text-white text-xs md:text-sm mb-2">You can enable MFA to add an extra layer of security to your account. When you log in, you will be required to enter a code sent to your phone or email address.</p>
                        <div className="flex items-center gap-2 mb-2">
                          <input type="checkbox" id="enable-mfa" className="accent-[#9afa00] w-4 h-4" />
                          <label htmlFor="enable-mfa" className="text-white text-xs md:text-sm">Enable MFA</label>
                        </div>
                        <div>
                          <label className="text-white text-xs md:text-sm mb-1 block">MPA Device</label>
                          <select className="w-full bg-[#181c1a] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm">
                            <option>Email</option>
                          </select>
                        </div>
                      </div>
                      {/* Subscription */}
                      <div className="bg-[#232626] rounded-lg p-4 mt-2">
                        <span className="text-[#9afa00] font-bold text-lg block mb-4">SUBSCRIPTION PLAN</span>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getSubscriptionPlan() === 'PREMIUM' || getSubscriptionPlan() === 'PREMIUM_MONTHLY' ? (
                              <FaCrown className="text-[#9afa00] text-2xl" />
                            ) : (
                              <FaTrophy className="text-blue-500 text-2xl" />
                            )}
                            <div>
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getSubscriptionBadgeColor(getSubscriptionPlan())}`}>
                                {getSubscriptionPlan() === 'PREMIUM' || getSubscriptionPlan() === 'PREMIUM_MONTHLY' ? 'PREMIUM' : 'PAY PER DEAL'}
                              </div>
                              <p className="text-gray-300 text-xs mt-1">
                                {getSubscriptionPlan() === 'PREMIUM' || getSubscriptionPlan() === 'PREMIUM_MONTHLY' 
                                  ? 'Full access with monthly billing' 
                                  : 'Pay only for completed deals'
                                }
                              </p>
                            </div>
                          </div>
                          {(getSubscriptionPlan() === 'PAY_PER_DEAL' || !getSubscriptionPlan()) && (
                             <button
                               onClick={handleUpgradeSubscription}
                               className="bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-bold px-4 py-2 rounded-lg text-sm hover:shadow-lg hover:shadow-[#9afa00]/25 transition-all duration-200"
                             >
                               Upgrade
                             </button>
                           )}
                           {(getSubscriptionPlan() === 'PREMIUM' || getSubscriptionPlan() === 'PREMIUM_MONTHLY') && (
                             <button
                               onClick={handleCancelSubscription}
                               disabled={isLoading}
                               className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               {isLoading ? 'Cancelling...' : 'Cancel'}
                             </button>
                           )}
                        </div>
                        <div className="text-white text-xs">
                          <p className="mb-2">Current Plan Benefits:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-300">
                            {getSubscriptionPlan() === 'PREMIUM' || getSubscriptionPlan() === 'PREMIUM_MONTHLY' ? (
                              <>
                                <li>Unlimited campaigns</li>
                                <li>Priority support</li>
                                <li>Advanced analytics</li>
                                <li>Direct athlete messaging</li>
                              </>
                            ) : (
                              <>
                                <li>Full access to all features</li>
                                <li>Pay only for completed deals</li>
                                <li>Chat with athletes</li>
                                <li>Create campaigns</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
                {/* Modal Actions - static */}
                <div className="flex w-full gap-4 px-6 pb-6 bg-[#23281e] sticky bottom-0 z-10 pt-2">
                  <button
                    className="flex-1 bg-[#232626] text-white font-bold py-2 rounded-md uppercase text-xs md:text-base border border-[#9afa00] hover:bg-[#181c1a] transition"
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 bg-[#9afa00] text-black font-bold py-2 rounded-md uppercase text-xs md:text-base hover:bg-[#baff32] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    onClick={userData?.role === 'athlete' ? updateAthleteProfile : undefined}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Crop Modal */}
        {cropModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-2xl bg-[#23281e] rounded-2xl shadow-lg p-6 flex flex-col animate-fadeIn">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-[#9afa00] text-2xl hover:text-white transition z-10"
                onClick={() => { setCropModalOpen(false); setSelectedImage(null); }}
                aria-label="Close"
              >
                <FaTimes />
              </button>
              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <FaCrop className="text-[#9afa00] text-xl" />
                <h2 className="text-white font-bold text-xl">Crop Profile Image</h2>
              </div>
              {/* Image with Crop Area */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative bg-[#181c1a] rounded-lg p-4 max-w-lg w-full">
                  {selectedImage && (
                    <div 
                      className="relative cursor-move select-none"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <img
                        ref={imageRef}
                        src={selectedImage}
                        alt="Selected"
                        className="w-full h-auto max-h-96 object-contain rounded pointer-events-none"
                        onLoad={() => {
                          if (imageRef.current) {
                            const img = imageRef.current;
                            const size = Math.min(img.naturalWidth, img.naturalHeight) * 0.6;
                            setCropData({
                              x: (img.naturalWidth - size) / 2,
                              y: (img.naturalHeight - size) / 2,
                              size: size
                            });
                          }
                        }}
                        draggable={false}
                      />
                      {/* Crop Overlay */}
                       <div
                         className="absolute border-2 border-[#9afa00] cursor-move"
                         style={{
                           left: `${(cropData.x / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                           top: `${(cropData.y / (imageRef.current?.naturalHeight || 1)) * 100}%`,
                           width: `${(cropData.size / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                           height: `${(cropData.size / (imageRef.current?.naturalHeight || 1)) * 100}%`,
                           backgroundColor: 'transparent'
                         }}
                       >
                         {/* Corner indicators */}
                         <div className="absolute -top-1 -left-1 w-3 h-3 border-2 border-[#9afa00] bg-[#9afa00]" />
                         <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-[#9afa00] bg-[#9afa00]" />
                         <div className="absolute -bottom-1 -left-1 w-3 h-3 border-2 border-[#9afa00] bg-[#9afa00]" />
                         <div className="absolute -bottom-1 -right-1 w-3 h-3 border-2 border-[#9afa00] bg-[#9afa00]" />
                         {/* Center text */}
                         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs bg-black bg-opacity-70 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                           Drag to adjust
                         </div>
                       </div>
                    </div>
                  )}
                </div>
                {/* Preview */}
                <div className="flex items-center gap-4">
                  <span className="text-white text-sm">Preview:</span>
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#9afa00] bg-[#232626]">
                    {selectedImage && (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${selectedImage})`,
                          backgroundPosition: `${-cropData.x * (64 / cropData.size)}px ${-cropData.y * (64 / cropData.size)}px`,
                          backgroundSize: `${(imageRef.current?.naturalWidth || 1) * (64 / cropData.size)}px ${(imageRef.current?.naturalHeight || 1) * (64 / cropData.size)}px`
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* Modal Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  className="flex-1 bg-[#232626] text-white font-bold py-2 rounded-md uppercase border border-[#9afa00] hover:bg-[#181c1a] transition"
                  onClick={() => { setCropModalOpen(false); setSelectedImage(null); }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-[#9afa00] text-black font-bold py-2 rounded-md uppercase hover:bg-[#baff32] transition"
                  onClick={handleCropSave}
                >
                  Save Image
                </button>
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;