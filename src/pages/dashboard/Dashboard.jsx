import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AthleteDashboardHome from '../../components/athlete/AthleteDashboardHome';
import AthleteCampaigns from '../../components/athlete/AthleteCampaigns';
import { FaBell } from 'react-icons/fa';


const TABS = [
  { label: 'Dashboard', key: 'dashboard' },
  { label: 'Campaigns', key: 'campaigns' },
  { label: 'Chats', key: 'chats' },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleTabClick = (tabKey) => {
    if (tabKey === 'chats') {
      navigate('/chats');
    } else {
      setActiveTab(tabKey);
    }
  };

  return (
    <div className="w-full min-h-screen px-0 md:px-6 py-6">
      {/* Tabs Row with Bell Icon */}
      <div className="flex items-center justify-between bg-[#9BF9000D] px-2 md:px-8 py-4 rounded-b-xl overflow-x-auto whitespace-nowrap scrollbar-hide mb-6">
        <div className="flex gap-4 md:gap-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`uppercase font-bold text-white text-base md:text-lg px-2 pb-2 border-b-4 transition-all duration-200 min-w-max ${activeTab === tab.key ? 'text-[#9afa00] border-[#9afa00]' : 'border-transparent hover:text-[#9afa00]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <FaBell className="text-[#9afa00] text-xl md:text-2xl ml-4" />
      </div>
      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'dashboard' && <AthleteDashboardHome />}
        {activeTab === 'campaigns' && <AthleteCampaigns />}
      </div>
    </div>
  );
};

export default Dashboard;