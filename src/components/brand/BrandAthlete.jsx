import React, { useState, useEffect } from 'react';
import { FaTiktok, FaFacebookF, FaInstagram, FaLock, FaTrophy, FaBriefcase, FaTimes, FaChevronLeft, FaChevronRight, FaCommentDots } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllAthletes } from '../../services/athleteService';
import socketService from '../../services/socketService';

const athletes = [
  {
    name: 'ALICE JANE',
    type: 'Other',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete1.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Athlete Runner',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete2.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Boxer',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete3.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Other',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete4.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Runner',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete5.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Cyclist',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete6.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Archer',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete7.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Boxer',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete8.jpg',
  },
];

const BrandAthlete = () => {
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showAthleteModal, setShowAthleteModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('bronze');
  const [payAnnually, setPayAnnually] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    profile: [],
    sport: '',
    location: '',
    page: 1,
    limit: 10
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Fetch athletes on component mount and when filters change
  useEffect(() => {
    fetchAthletes();
  }, [filters.page, filters.limit]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== undefined) {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchAthletes();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  // Fetch athletes when other filters change
  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchAthletes();
  }, [filters.profile, filters.sport, filters.location]);

  const fetchAthletes = async () => {
    setIsLoading(true);
    try {
      const queryFilters = {
        ...filters,
        profile: filters.profile.length > 0 ? filters.profile.join(',') : undefined,
        sport: filters.sport || undefined
      };
      
      const response = await getAllAthletes(queryFilters);
      setAthletes(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 10, total: 0 });
    } catch (error) {
      console.error('Failed to fetch athletes:', error);
      toast.error('Failed to load athletes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterType, value, checked = null) => {
    setFilters(prev => {
      if (filterType === 'search' || filterType === 'location' || filterType === 'sport') {
        return { ...prev, [filterType]: value };
      }
      
      if (filterType === 'profile') {
        const currentArray = prev[filterType];
        if (checked) {
          return { ...prev, [filterType]: [...currentArray, value] };
        } else {
          return { ...prev, [filterType]: currentArray.filter(item => item !== value) };
        }
      }
      
      return prev;
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const plans = [
    {
      key: 'bronze',
      label: 'BRONZE',
      price: '$500 per month',
      icon: <FaTrophy className="text-[#9afa00] text-4xl" />,
      features: [
        '15% Transaction fee.',
        'Access to all athletes',
        'Direct Campaigns',
      ],
      details: 'Annual Commitment',
      moreDetails: ['15% Transaction fee.', 'Access to all athletes', 'Direct Campaigns'],
    },
    {
      key: 'silver',
      label: 'SILVER',
      price: '$500 per month',
      icon: <FaTrophy className="text-gray-300 text-4xl" />,
      features: [
        '10% Transaction fee.',
        'Tier 1 Support',
        'Direct Campaigns',
        'Open Campaigns',
        'Access to all athletes',
        'Product Campaigns',
      ],
      details: 'Annual Commitment',
      moreDetails: ['10% Transaction fee.', 'Tier 1 Support', 'Direct Campaigns', 'Open Campaigns', 'Access to all athletes', 'Product Campaigns'],
    },
    {
      key: 'icon',
      label: 'STAND ALONE',
      price: '$500 per month',
      icon: <FaBriefcase className="text-[#9afa00] text-4xl" />,
      features: [
        'Leverage icon source platform to target, recruit & hire elite athletes to your team!',
        'No Setup Fee',
        'Access to all athletes',
        'No Transaction Fee',
      ],
      details: 'Annual Commitment',
      moreDetails: ['Leverage icon source platform to target, recruit & hire elite athletes to your team!', 'No Setup Fee', 'Access to all athletes', 'No Transaction Fee'],
    },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 md:gap-8 h-auto md:h-[calc(100vh-120px)] px-2 md:px-4">
      {/* Sidebar Filters (collapsible on mobile) */}
      <div className="md:w-64 w-full md:sticky md:top-24 flex-shrink-0 bg-transparent z-10 mb-4 md:mb-0">
        {/* Mobile: Filter toggle button */}
        <button
          className="md:hidden w-full bg-[#232626] text-[#9afa00] font-bold py-2 rounded-md mb-2 flex items-center justify-center gap-2"
          onClick={() => setShowFilters(v => !v)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        {/* Filters panel */}
        <div className={`transition-all duration-300 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="p-4 md:p-0">
            <input
              type="text"
              placeholder="Search by name"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm"
            />
            
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm"
            />
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-[#9afa00] font-bold text-base md:text-lg mb-2 uppercase">Profile Filters</h3>
              <div className="flex flex-col gap-2 text-white">
                <label className="flex items-center gap-2 text-sm md:text-base">
                  <input 
                    type="checkbox" 
                    className="accent-[#9afa00]" 
                    checked={filters.profile.includes('College')}
                    onChange={(e) => handleFilterChange('profile', 'College', e.target.checked)}
                  /> 
                  College
                </label>
                <label className="flex items-center gap-2 text-sm md:text-base">
                  <input 
                    type="checkbox" 
                    className="accent-[#9afa00]" 
                    checked={filters.profile.includes('Professional')}
                    onChange={(e) => handleFilterChange('profile', 'Professional', e.target.checked)}
                  /> 
                  Professional
                </label>
                <label className="flex items-center gap-2 text-sm md:text-base">
                  <input 
                    type="checkbox" 
                    className="accent-[#9afa00]" 
                    checked={filters.profile.includes('High School')}
                    onChange={(e) => handleFilterChange('profile', 'High School', e.target.checked)}
                  /> 
                  High School
                </label>
              </div>
            </div>
            
            <div className="mb-6 md:mb-8">
              <h3 className="text-[#9afa00] font-bold text-base md:text-lg mb-2 uppercase">Sport</h3>
              <input
                type="text"
                placeholder="Enter sport (e.g., Football, Basketball)"
                value={filters.sport}
                onChange={(e) => handleFilterChange('sport', e.target.value)}
                className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm"
              />
            </div>
            
            <div className="bg-[#232626] rounded-lg p-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <FaLock className="text-[#9afa00] text-xl" />
                <span className="text-[#9afa00] font-bold uppercase text-sm md:text-md">Featured Locked</span>
              </div>
              <button 
                className="mt-2 bg-[#9afa00] text-black font-bold px-4 md:px-6 py-2 rounded-md uppercase text-xs md:text-sm hover:bg-[#baff32] transition"
                onClick={() => setShowSubscriptionModal(true)}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Athlete Cards Grid */}
      <main className="flex-1 overflow-y-auto pr-0 md:pr-1">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide">Athletes</h2>
          <div className="text-gray-400 text-sm">
            Showing {athletes.length} of {pagination.total} athletes
          </div>
        </div>
        
        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="text-white text-xl">Loading athletes...</div>
          </div>
        ) : (
          <>
            {/* Athletes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 pb-8">
              {athletes.map((athlete) => (
                <div key={athlete.id} className="bg-[#232626] rounded-xl p-3 md:p-4 flex flex-col shadow-md border border-transparent hover:border-[#9afa00] transition min-w-0 relative">
                  {/* Chat Icon - Top Right */}
                  <button 
                    className="absolute top-3 right-3 bg-[#9afa00] hover:bg-[#baff32] p-2 rounded-full transition-all duration-200 z-10 shadow-lg"
                    onClick={() => {
                      // Navigate to chats with athlete info
                      navigate('/chats', { state: { selectedAthleteId: athlete.id, selectedAthleteName: athlete.athleteProfile?.fullName || athlete.email } });
                      toast.success('Opening chat with athlete...');
                    }}
                    title="Start Chat"
                  >
                    <FaCommentDots className="text-black text-sm" />
                  </button>
                  
                  {/* Profile Image */}
                  <div className="w-full h-40 md:h-48 rounded-lg overflow-hidden mb-3 md:mb-4 bg-black flex items-center justify-center">
                    {athlete.athleteProfile?.profilePictureUrl ? (
                      <img src={athlete.athleteProfile.profilePictureUrl} alt={athlete.athleteProfile?.fullName || 'Athlete'} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  {/* Athlete Info */}
                  <div className="w-full text-left flex-1">
                    {/* Name/Email with proper truncation */}
                    <div className="text-white font-bold text-base md:text-lg leading-tight mb-1">
                      {(athlete.athleteProfile?.firstName && athlete.athleteProfile?.lastName) ? (
                        <span className="block truncate text-sm">{athlete.athleteProfile.firstName + ' ' + athlete.athleteProfile.lastName}</span>
                      ) : (
                        <span className="block truncate text-sm" title={athlete.email}>
                          {athlete.email.length > 20 ? `${athlete.email.substring(0, 20)}...` : athlete.email}
                        </span>
                      )}
                    </div>
                    
                    {/* Sport */}
                    <div className="font-bold text-sm md:text-md text-[#9afa00] mb-2">
                      {athlete.athleteProfile?.sport || 'Athlete'}
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm mb-3">
                      <svg className="w-4 h-4 text-[#9afa00] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 9 7 9s7-3.75 7-9c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 10 6a2.5 2.5 0 0 1 0 5.5z" />
                      </svg>
                      <span className="truncate">{athlete.athleteProfile?.origin || 'Location not specified'}</span>
                    </div>
                    
                    {/* Social Media Icons */}
                    <div className="flex gap-2 md:gap-3 mb-3 md:mb-4 justify-center">
                      <a href="#" className="bg-[#181c1a] hover:bg-[#9afa00] hover:text-black p-2 rounded-full transition-all duration-200" title="TikTok">
                        <FaTiktok className="text-[#9afa00] hover:text-black text-base transition-colors" />
                      </a>
                      <a href="#" className="bg-[#181c1a] hover:bg-[#9afa00] hover:text-black p-2 rounded-full transition-all duration-200" title="Facebook">
                        <FaFacebookF className="text-[#9afa00] hover:text-black text-base transition-colors" />
                      </a>
                      <a href="#" className="bg-[#181c1a] hover:bg-[#9afa00] hover:text-black p-2 rounded-full transition-all duration-200" title="Instagram">
                        <FaInstagram className="text-[#9afa00] hover:text-black text-base transition-colors" />
                      </a>
                    </div>
                    
                    {/* View Profile Button */}
                    <button 
                      className="w-full bg-[#9afa00] text-black font-bold py-2.5 rounded-md uppercase text-xs md:text-sm hover:bg-[#baff32] transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={() => {
                        setSelectedAthlete(athlete);
                        setShowAthleteModal(true);
                      }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty State */}
            {athletes.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="text-6xl text-gray-600 mx-auto mb-4">🏃‍♂️</div>
                <h3 className="text-2xl font-bold text-white mb-2">No Athletes Found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters to find more athletes</p>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-[#232626] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#181c1a] transition"
                >
                  <FaChevronLeft /> Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-md transition ${
                          pageNum === pagination.page
                            ? 'bg-[#9afa00] text-black font-bold'
                            : 'bg-[#232626] text-white hover:bg-[#181c1a]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-[#232626] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#181c1a] transition"
                >
                  Next <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Subscription Modal Popup */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm px-2 md:px-0">
            <div className="relative w-full max-w-lg md:max-w-2xl bg-[#1B2317] rounded-2xl shadow-lg p-6 md:p-10 flex flex-col items-center animate-fadeIn">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-[#9afa00] text-2xl hover:text-white transition"
                onClick={() => setShowSubscriptionModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
              {/* Title */}
              <h2 className="text-white text-lg md:text-2xl font-bold mb-2 text-center uppercase tracking-wide">Choose a Subscription Plan to Get Started</h2>
              {/* Plan Tabs */}
              <div className="flex w-full justify-center gap-2 md:gap-6 mb-6 mt-2">
                {plans.map(plan => (
                  <button
                    key={plan.key}
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[110px] md:min-w-[180px] ${
                      selectedPlan === plan.key ? 'border-[#9afa00] bg-[#181c1a]' : 'border-transparent bg-black bg-opacity-60'
                    } hover:border-[#9afa00]`}
                  >
                    {plan.icon}
                    <span className={`mt-2 font-bold text-base md:text-lg ${selectedPlan === plan.key ? 'text-[#9afa00]' : 'text-white'}`}>{plan.label}</span>
                    <span className="text-xs md:text-sm text-gray-300 mt-1">{plan.price}</span>
                  </button>
                ))}
              </div>
              {/* Plan Details */}
              <div className="w-full rounded-xl p-4 md:p-6 flex flex-col items-center mb-4">
                <span className="text-[#9afa00] font-bold text-sm md:text-base mb-2">Annual Commitment <span className="text-[#9afa00] underline cursor-pointer ml-2">More Details</span></span>
                <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 w-full justify-center items-center mb-2 mt-2">
                  {plans.find(p => p.key === selectedPlan).moreDetails.map((feature, i) => (
                    <span key={i} className="flex items-center gap-2 text-white text-xs md:text-sm"><span className="text-[#9afa00]">✔</span> {feature}</span>
                  ))}
                </div>
                {/* ... existing plan-specific content ... */}
              </div>
              {/* Modal Actions */}
              <div className="flex w-full gap-4 mt-2">
                <button
                  className="flex-1 bg-[#232626] text-white font-bold py-2 rounded-md uppercase text-xs md:text-base border border-[#9afa00] hover:bg-[#181c1a] transition"
                  onClick={() => setShowSubscriptionModal(false)}
                >
                  Close
                </button>
                <button
                  className="flex-1 bg-[#9afa00] text-black font-bold py-2 rounded-md uppercase text-xs md:text-base hover:bg-[#baff32] transition"
                >
                  Continue
                </button>
              </div>
              <div className="w-full text-center mt-4">
                <span className="text-gray-300 text-xs md:text-sm">Not sure which plan suits you? <span className="text-[#9afa00] underline cursor-pointer">Contact our team</span></span>
              </div>
            </div>
          </div>
        )}
        
        {/* Athlete Profile Modal */}
        {showAthleteModal && selectedAthlete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm px-2 md:px-0">
            <div className="relative w-full max-w-4xl bg-[#1B2317] rounded-2xl shadow-lg p-6 md:p-8 flex flex-col animate-fadeIn max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-[#9afa00] text-2xl hover:text-white transition z-10"
                onClick={() => {
                  setShowAthleteModal(false);
                  setSelectedAthlete(null);
                }}
                aria-label="Close"
              >
                <FaTimes />
              </button>
              
              {/* Header Section */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Profile Image */}
                <div className="w-full md:w-64 h-64 rounded-xl overflow-hidden bg-black flex items-center justify-center flex-shrink-0">
                  {selectedAthlete.athleteProfile?.profilePictureUrl ? (
                    <img 
                      src={selectedAthlete.athleteProfile.profilePictureUrl} 
                      alt={selectedAthlete.athleteProfile?.fullName || 'Athlete'} 
                      className="object-cover w-full h-full" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                
                {/* Basic Info */}
                <div className="flex-1">
                  <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">
                    {(selectedAthlete.athleteProfile?.firstName && selectedAthlete.athleteProfile?.lastName) 
                      ? `${selectedAthlete.athleteProfile.firstName} ${selectedAthlete.athleteProfile.lastName}`
                      : selectedAthlete.email
                    }
                  </h2>
                  <div className="text-[#9afa00] text-lg font-bold mb-3">
                    {selectedAthlete.athleteProfile?.sport || 'Athlete'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 mb-4">
                    <svg className="w-5 h-5 text-[#9afa00]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 9 7 9s7-3.75 7-9c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 10 6a2.5 2.5 0 0 1 0 5.5z" />
                    </svg>
                    <span>{selectedAthlete.athleteProfile?.origin || 'Location not specified'}</span>
                  </div>
                  
                  {/* Social Media Links */}
                  <div className="flex gap-3 mb-4">
                    {selectedAthlete.athleteProfile?.instagram && (
                      <a href={`https://instagram.com/${selectedAthlete.athleteProfile.instagram}`} target="_blank" rel="noopener noreferrer" className="bg-[#181c1a] hover:bg-[#9afa00] hover:text-black p-3 rounded-full transition-all duration-200">
                        <FaInstagram className="text-[#9afa00] hover:text-black text-lg" />
                      </a>
                    )}
                    {selectedAthlete.athleteProfile?.tiktok && (
                      <a href={`https://tiktok.com/@${selectedAthlete.athleteProfile.tiktok}`} target="_blank" rel="noopener noreferrer" className="bg-[#181c1a] hover:bg-[#9afa00] hover:text-black p-3 rounded-full transition-all duration-200">
                        <FaTiktok className="text-[#9afa00] hover:text-black text-lg" />
                      </a>
                    )}
                    {selectedAthlete.athleteProfile?.facebook && (
                      <a href={`https://facebook.com/${selectedAthlete.athleteProfile.facebook}`} target="_blank" rel="noopener noreferrer" className="bg-[#181c1a] hover:bg-[#9afa00] hover:text-black p-3 rounded-full transition-all duration-200">
                        <FaFacebookF className="text-[#9afa00] hover:text-black text-lg" />
                      </a>
                    )}
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#232626] rounded-lg p-3">
                      <div className="text-[#9afa00] text-sm font-bold">Profile Type</div>
                      <div className="text-white">{selectedAthlete.athleteProfile?.profileType || 'Not specified'}</div>
                    </div>
                    <div className="bg-[#232626] rounded-lg p-3">
                      <div className="text-[#9afa00] text-sm font-bold">Followers</div>
                      <div className="text-white">{selectedAthlete.athleteProfile?.followersCount || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detailed Information Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-[#232626] rounded-xl p-4">
                  <h3 className="text-[#9afa00] text-lg font-bold mb-4 flex items-center gap-2">
                    <FaTrophy className="text-[#9afa00]" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    {selectedAthlete.athleteProfile?.age && (
                      <div>
                        <span className="text-gray-400 text-sm">Age:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.age}</div>
                      </div>
                    )}
                    {selectedAthlete.athleteProfile?.height && (
                      <div>
                        <span className="text-gray-400 text-sm">Height:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.height}</div>
                      </div>
                    )}
                    {selectedAthlete.athleteProfile?.weight && (
                      <div>
                        <span className="text-gray-400 text-sm">Weight:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.weight}</div>
                      </div>
                    )}
                    {selectedAthlete.athleteProfile?.school && (
                      <div>
                        <span className="text-gray-400 text-sm">School:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.school}</div>
                      </div>
                    )}
                    {selectedAthlete.athleteProfile?.major && (
                      <div>
                        <span className="text-gray-400 text-sm">Major:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.major}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Athletic Information */}
                <div className="bg-[#232626] rounded-xl p-4">
                  <h3 className="text-[#9afa00] text-lg font-bold mb-4 flex items-center gap-2">
                    <FaTrophy className="text-[#9afa00]" />
                    Athletic Information
                  </h3>
                  <div className="space-y-3">
                    {selectedAthlete.athleteProfile?.achievements && (
                      <div>
                        <span className="text-gray-400 text-sm">Achievements:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.achievements}</div>
                      </div>
                    )}
                    {selectedAthlete.athleteProfile?.position && (
                      <div>
                        <span className="text-gray-400 text-sm">Position:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.position}</div>
                      </div>
                    )}
                    {selectedAthlete.athleteProfile?.teamName && (
                      <div>
                        <span className="text-gray-400 text-sm">Team:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.teamName}</div>
                      </div>
                    )}
                    {selectedAthlete.athleteProfile?.coachName && (
                      <div>
                        <span className="text-gray-400 text-sm">Coach:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.coachName}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Social Media & Content */}
                <div className="bg-[#232626] rounded-xl p-4">
                  <h3 className="text-[#9afa00] text-lg font-bold mb-4 flex items-center gap-2">
                    <FaInstagram className="text-[#9afa00]" />
                    Social Media & Content
                  </h3>
                  <div className="space-y-3">
                    {selectedAthlete.athleteProfile?.contentNiche && (
                      <div>
                        <span className="text-gray-400 text-sm">Content Niche:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.contentNiche}</div>
                      </div>
                    )}
                    {selectedAthlete.athleteProfile?.followersCount && (
                      <div>
                        <span className="text-gray-400 text-sm">Total Followers:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.followersCount}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedAthlete.athleteProfile?.instagram && (
                        <div>
                          <span className="text-gray-400">Instagram:</span>
                          <div className="text-white truncate">@{selectedAthlete.athleteProfile.instagram}</div>
                        </div>
                      )}
                      {selectedAthlete.athleteProfile?.tiktok && (
                        <div>
                          <span className="text-gray-400">TikTok:</span>
                          <div className="text-white truncate">@{selectedAthlete.athleteProfile.tiktok}</div>
                        </div>
                      )}
                      {selectedAthlete.athleteProfile?.twitter && (
                        <div>
                          <span className="text-gray-400">Twitter:</span>
                          <div className="text-white truncate">@{selectedAthlete.athleteProfile.twitter}</div>
                        </div>
                      )}
                      {selectedAthlete.athleteProfile?.youtube && (
                        <div>
                          <span className="text-gray-400">YouTube:</span>
                          <div className="text-white truncate">{selectedAthlete.athleteProfile.youtube}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Brand Collaboration */}
                <div className="bg-[#232626] rounded-xl p-4">
                  <h3 className="text-[#9afa00] text-lg font-bold mb-4 flex items-center gap-2">
                    <FaBriefcase className="text-[#9afa00]" />
                    Brand Collaboration
                  </h3>
                  <div className="space-y-3">
                    {selectedAthlete.athleteProfile?.audienceDemographics && (
                      <div>
                        <span className="text-gray-400 text-sm">Audience Demographics:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.audienceDemographics}</div>
                      </div>
                    )}
                    {selectedAthlete.athleteProfile?.pastCollaborations && (
                      <div>
                        <span className="text-gray-400 text-sm">Past Collaborations:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.pastCollaborations}</div>
                      </div>
                    )}
                    {selectedAthlete.athleteProfile?.brandPreferences && (
                      <div>
                        <span className="text-gray-400 text-sm">Brand Preferences:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.brandPreferences}</div>
                      </div>
                    )}
                    {selectedAthlete.athleteProfile?.uniquePitch && (
                      <div>
                        <span className="text-gray-400 text-sm">Unique Pitch:</span>
                        <div className="text-white">{selectedAthlete.athleteProfile.uniquePitch}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  className="flex-1 bg-[#232626] text-white font-bold py-3 rounded-md uppercase text-sm border border-[#9afa00] hover:bg-[#181c1a] transition"
                  onClick={() => {
                    setShowAthleteModal(false);
                    setSelectedAthlete(null);
                  }}
                >
                  Close
                </button>
                <button
                  className="flex-1 bg-[#9afa00] text-black font-bold py-3 rounded-md uppercase text-sm hover:bg-[#baff32] transition"
                  onClick={() => {
                    navigate('/chats', { state: { selectedAthleteId: selectedAthlete.id, selectedAthleteName: selectedAthlete.athleteProfile?.fullName || selectedAthlete.email } });
                    toast.success('Opening chat with athlete...');
                  }}
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrandAthlete;