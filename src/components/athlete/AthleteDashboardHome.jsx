import React, { useState, useEffect } from 'react';
import { FaHandshake, FaDollarSign, FaEye, FaCalendarAlt, FaFileContract } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAthleteDashboardData, getChatList } from '../../services/athleteDashboardService';
import { getContracts } from '../../services/contractService';

// Dynamic stat cards based on API data
const getStatCards = (dashboardData) => [
  {
    icon: <FaHandshake className="text-[#9afa00] text-3xl" />,
    label: 'ACTIVE CONTRACTS',
    value: dashboardData?.activeContracts || 0,
  },
  {
    icon: <FaDollarSign className="text-[#9afa00] text-3xl" />,
    label: 'TOTAL EARNINGS',
    value: `$${dashboardData?.totalEarnings || 0}`,
  },
  {
    icon: <FaEye className="text-[#9afa00] text-3xl" />,
    label: 'BRAND VIEWS',
    value: dashboardData?.brandViews || 0,
  },
  {
    icon: <FaCalendarAlt className="text-[#9afa00] text-3xl" />,
    label: 'MEMBER SINCE',
    value: dashboardData?.memberSince ? new Date(dashboardData.memberSince).getFullYear() : new Date().getFullYear(),
  },
];

const AthleteDashboardHome = () => {
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      setUserData(JSON.parse(user));
    }
    
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard stats
      const dashboardResponse = await getAthleteDashboardData();
      setDashboardData(dashboardResponse);
      
      // Fetch contracts (top 5)
      const contractsResponse = await getContracts(1, 5);
      setContracts(contractsResponse.contracts || []);
      
      // Fetch chats (top 5)
      const chatsResponse = await getChatList();
      setChats(chatsResponse.slice(0, 5) || []);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Get user's full name for greeting
  const getFullName = () => {
    if (dashboardData?.profile?.athleteProfile?.firstName && dashboardData?.profile?.athleteProfile?.lastName) {
      return `${dashboardData.profile.athleteProfile.firstName} ${dashboardData.profile.athleteProfile.lastName}`;
    }
    if (userData?.athleteProfile?.firstName && userData?.athleteProfile?.lastName) {
      return `${userData.athleteProfile.firstName} ${userData.athleteProfile.lastName}`;
    }
    return 'Professional Athlete'; // Fallback
  };

  // Get user's achievements
  const getUserAchievements = () => {
    if (dashboardData?.profile?.athleteProfile?.achievements) {
      return dashboardData.profile.athleteProfile.achievements;
    }
    if (userData?.athleteProfile?.achievements) {
      return userData.athleteProfile.achievements;
    }
    return 'No achievements yet';
  };

  // Format time for chat messages
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hr ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} day ago`;
    }
  };

  // Format contract amount
  const formatAmount = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  // Get contract status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'completed':
        return 'text-blue-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-cover bg-center px-2 md:px-8 py-4 flex items-center justify-center" style={{ backgroundImage: "url('/bgApp.png')" }}>
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-cover bg-center px-2 md:px-8 py-4 flex items-center justify-center" style={{ backgroundImage: "url('/bgApp.png')" }}>
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <>
      
      <div className="min-h-screen w-full bg-cover bg-center px-2 md:px-8 py-4" style={{ backgroundImage: "url('/bgApp.png')" }}>
        {/* Greeting */}
        <h2 className="text-white text-xl md:text-3xl font-bold mb-6 flex items-center gap-2">Hi, {getFullName()} <span className="text-2xl">👋</span></h2>

        {/* Stat Cards - responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {getStatCards(dashboardData).map((card, idx) => (
            <div
              key={card.label}
              className="border border-[#9afa00] rounded-xl flex flex-col items-center min-w-0 px-4 md:px-8 py-4 md:py-6 bg-[rgba(0,0,0,0.3)]"
            >
              <div className="bg-[rgba(0,0,0,0.3)] rounded-lg flex items-center justify-center w-12 h-12 md:w-16 md:h-16 min-w-0 mb-2">
                {card.icon}
              </div>
              <div className="flex flex-col items-center justify-center min-w-0 w-full">
                <span className="text-white font-bold uppercase text-base md:text-xl tracking-wide text-center break-words w-full">{card.label}</span>
                <span className="text-[#9afa00] font-bold text-xl md:text-3xl mt-2 text-center break-words w-full">{card.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid - responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top 5 Contracts */}
          <div className="bg-[rgba(0,0,0,0.3)] rounded-xl p-4 md:p-6 flex flex-col min-h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-lg md:text-xl">TOP 5 CONTRACTS</span>
              <Link to="/dashboard?tab=contracts" className="bg-black text-white text-xs px-3 py-1 rounded-md font-bold hover:bg-[#9afa00] hover:text-black transition-colors">View All</Link>
            </div>
            <div className="flex flex-col gap-4 mt-2 overflow-y-auto">
              {contracts.length > 0 ? contracts.map((contract, idx) => (
                <div key={contract.id || idx} className="flex items-center justify-between bg-[rgba(0,0,0,0.3)] rounded-md px-4 md:px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-white text-base md:text-lg font-semibold">{contract.brandName || contract.title || 'Contract'}</span>
                    <span className={`text-sm ${getStatusColor(contract.status)}`}>{contract.status || 'Unknown'}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[#9afa00] font-bold text-base md:text-lg">{formatAmount(contract.amount)}</span>
                    <span className="text-white text-xs">{contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              )) : (
                <div className="flex items-center justify-center h-32">
                  <span className="text-gray-400">No contracts found</span>
                </div>
              )}
            </div>
          </div>
          {/* Achievements */}
          <div className="bg-[rgba(0,0,0,0.3)] rounded-xl p-4 md:p-6 flex flex-col min-h-[340px]">
            <span className="text-white font-bold text-lg md:text-xl mb-2">ACHIEVEMENTS</span>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex flex-col items-center justify-center bg-[rgba(0,0,0,0.3)] rounded-lg p-4 md:p-6 flex-1">
                <span className="text-white font-bold mb-2 text-center">{getUserAchievements()}</span>
                <span className="text-5xl">🏆</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[rgba(0,0,0,0.3)] rounded-lg p-4 md:p-6 flex-1">
                <span className="text-white font-bold mb-2">Profile Type</span>
                <span className="text-[#9afa00] font-bold text-lg">{userData?.athleteProfile?.profileType || 'Professional'}</span>
              </div>
            </div>
          </div>
          {/* Messages */}
          <div className="bg-[rgba(0,0,0,0.3)] rounded-xl p-4 md:p-6 flex flex-col min-h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-lg md:text-xl">RECENT MESSAGES</span>
              <Link to="/chats" className="bg-black text-white px-4 py-1 rounded-md font-bold hover:bg-[#9afa00] hover:text-black transition-colors">See All</Link>
            </div>
            <div className="flex flex-col gap-4 mt-2 overflow-y-auto">
              {chats.length > 0 ? chats.map((chat, idx) => (
                <div key={chat.id || idx} className="flex flex-col md:flex-row md:items-center justify-between bg-[rgba(0,0,0,0.3)] rounded-md px-4 md:px-6 py-4 gap-2 md:gap-0">
                  <div>
                    <span className="text-[#9afa00] font-bold block text-base md:text-lg uppercase">{chat.participantName || chat.name || 'Unknown'}</span>
                    <span className="text-white text-sm md:text-md block mt-1">{chat.lastMessage || 'No messages yet'}</span>
                  </div>
                  <div className="flex flex-row md:flex-col items-end md:items-end gap-2 md:gap-2 justify-between md:justify-end">
                    <span className="text-white text-xs md:text-sm">{formatTime(chat.lastMessageAt)}</span>
                    {chat.unreadCount > 0 && (
                      <span className="bg-[#9afa00] text-black font-bold rounded-full px-3 py-1 text-base md:text-lg">{chat.unreadCount}</span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="flex items-center justify-center h-32">
                  <span className="text-gray-400">No messages found</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AthleteDashboardHome;