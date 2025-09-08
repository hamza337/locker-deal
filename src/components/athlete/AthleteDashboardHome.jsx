import React, { useState, useEffect } from 'react';
import { FaRunning, FaTrophy, FaUserPlus, FaHandshake, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const matchOpportunities = [
  { name: 'PRO SPORTS VENTURES', count: '08' },
  { name: 'REAL SPORTS', count: '03' },
  { name: 'VENUS PLAYERS', count: '01' },
  { name: 'PROGRESS BAR SPORTS', count: '04' },
];

const messages = [
  { sender: 'ALEX JANE', message: 'Sent a new message', time: '5 min ago', badge: 2 },
  { sender: 'JORDAN', message: 'Replied to your message.', time: '7 min ago', badge: 3 },
  { sender: 'Taylor', message: 'Sent an offer.', time: '1 day ago', badge: 1 },
  { sender: 'Taylor', message: 'Sent an offer.', time: '1 day ago', badge: 1 },
];

// Static data - will be replaced with dynamic data later
const getStatCards = (followersCount) => [
  {
    icon: <FaRunning className="text-[#9afa00] text-3xl" />, label: 'MATCHES PLAYED', value: '34',
  },
  {
    icon: <FaTrophy className="text-[#9afa00] text-3xl" />, label: 'WIN RATE', value: '68%',
  },
  {
    icon: <FaUserPlus className="text-[#9afa00] text-3xl" />, label: 'FOLLOWERS', value: followersCount,
  },
  {
    icon: <FaHandshake className="text-[#9afa00] text-3xl" />, label: 'BRAND DEALS', value: <><span>5</span> <span className="text-[#9afa00] text-lg font-bold ml-1">ACTIVE</span></>,
  },
];

const AthleteDashboardHome = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, []);

  // Get user's first name for greeting
  const getFirstName = () => {
    if (userData?.athleteProfile?.firstName) {
      return userData.athleteProfile.firstName;
    }
    return 'Athlete'; // Fallback
  };

  // Get user's full name for greeting
  const getFullName = () => {
    if (userData?.athleteProfile?.firstName && userData?.athleteProfile?.lastName) {
      return `${userData.athleteProfile.firstName} ${userData.athleteProfile.lastName}`;
    }
    return 'Athlete'; // Fallback
  };

  // Get user's followers count
  const getFollowersCount = () => {
    if (userData?.athleteProfile?.followersCount) {
      const count = userData.athleteProfile.followersCount;
      if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
      } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
      }
      return count.toString();
    }
    return '0';
  };

  // Get user's achievements
  const getUserAchievements = () => {
    if (userData?.athleteProfile?.achievements) {
      return userData.athleteProfile.achievements;
    }
    return 'No achievements yet';
  };

  return (
    <>
      
      <div className="min-h-screen w-full bg-cover bg-center px-2 md:px-8 py-4" style={{ backgroundImage: "url('/bgApp.png')" }}>
        {/* Greeting */}
        <h2 className="text-white text-xl md:text-3xl font-bold mb-6 flex items-center gap-2">Hi, {getFullName()} <span className="text-2xl">👋</span></h2>

        {/* Stat Cards - responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {getStatCards(getFollowersCount()).map((card, idx) => (
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
          {/* Monthly Performance Overview */}
          <div className="bg-[rgba(0,0,0,0.3)] rounded-xl p-4 md:p-6 flex flex-col min-h-[340px]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
              <span className="text-white font-bold text-lg md:text-xl">MONTHLY PERFORMANCE OVERVIEW</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#9afa00] inline-block"></span> Match Played</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span> Performance Score</span>
              </div>
            </div>
            {/* Chart Placeholder */}
            <div className="w-full h-48 flex items-end">
              <svg width="100%" height="100%" viewBox="0 0 400 180">
                <rect x="10" y="110" width="40" height="60" fill="#9afa00" rx="6" />
                <rect x="70" y="80" width="40" height="90" fill="#9afa00" rx="6" />
                <rect x="130" y="60" width="40" height="110" fill="#9afa00" rx="6" />
                <rect x="190" y="90" width="40" height="80" fill="#9afa00" rx="6" />
                <rect x="250" y="70" width="40" height="100" fill="#9afa00" rx="6" />
                <rect x="310" y="50" width="40" height="120" fill="#9afa00" rx="6" />
                <polyline points="30,120 90,100 150,80 210,110 270,70 330,60" fill="none" stroke="#fff" strokeWidth="4" />
                <text x="20" y="175" fill="#fff" fontSize="14">Jan</text>
                <text x="80" y="175" fill="#fff" fontSize="14">Feb</text>
                <text x="140" y="175" fill="#fff" fontSize="14">Mar</text>
                <text x="200" y="175" fill="#fff" fontSize="14">Apr</text>
                <text x="260" y="175" fill="#fff" fontSize="14">May</text>
                <text x="320" y="175" fill="#fff" fontSize="14">Jun</text>
                <line x1="0" y1="10" x2="400" y2="10" stroke="#444" strokeWidth="1" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#444" strokeWidth="1" />
                <line x1="0" y1="90" x2="400" y2="90" stroke="#444" strokeWidth="1" />
                <line x1="0" y1="130" x2="400" y2="130" stroke="#444" strokeWidth="1" />
                <line x1="0" y1="170" x2="400" y2="170" stroke="#444" strokeWidth="1" />
                <text x="0" y="20" fill="#fff" fontSize="14">100</text>
                <text x="0" y="60" fill="#fff" fontSize="14">75</text>
                <text x="0" y="100" fill="#fff" fontSize="14">50</text>
                <text x="0" y="140" fill="#fff" fontSize="14">25</text>
                <text x="0" y="180" fill="#fff" fontSize="14">0</text>
              </svg>
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
          {/* Match Opportunities */}
          <div className="bg-[rgba(0,0,0,0.3)] rounded-xl p-4 md:p-6 flex flex-col min-h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-lg md:text-xl">MATCH OPPORTUNITIES</span>
              <button className="bg-black text-white text-xs px-3 py-1 rounded-md font-bold">6 Month</button>
            </div>
            <div className="flex flex-col gap-4 mt-2">
              {matchOpportunities.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between bg-[rgba(0,0,0,0.3)] rounded-md px-4 md:px-6 py-4">
                  <span className="text-white text-base md:text-lg font-semibold">{item.name}</span>
                  <span className="bg-[#9afa00] text-black font-bold rounded-full px-4 py-1 text-base md:text-lg">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Messages */}
          <div className="bg-[rgba(0,0,0,0.3)] rounded-xl p-4 md:p-6 flex flex-col min-h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-lg md:text-xl">MESSAGES</span>
              <Link to="/chats" className="bg-black text-white px-4 py-1 rounded-md font-bold hover:bg-[#9afa00] hover:text-black transition-colors">See All</Link>
            </div>
            <div className="flex flex-col gap-4 mt-2">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between bg-[rgba(0,0,0,0.3)] rounded-md px-4 md:px-6 py-4 gap-2 md:gap-0">
                  <div>
                    <span className="text-[#9afa00] font-bold block text-base md:text-lg uppercase">{msg.sender}</span>
                    <span className="text-white text-sm md:text-md block mt-1">{msg.message}</span>
                  </div>
                  <div className="flex flex-row md:flex-col items-end md:items-end gap-2 md:gap-2 justify-between md:justify-end">
                    <span className="text-white text-xs md:text-sm">{msg.time}</span>
                    <span className="bg-[#9afa00] text-black font-bold rounded-full px-3 py-1 text-base md:text-lg">{msg.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AthleteDashboardHome;