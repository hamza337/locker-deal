import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBullhorn, FaFileContract, FaDollarSign, FaCalendarAlt, FaComments, FaSpinner } from 'react-icons/fa';
import { getBrandDashboardData, getChatList } from '../../services/brandDashboardService';
import toast from 'react-hot-toast';

const BrandDashboardHome = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('total');

  useEffect(() => {
    fetchDashboardData();
    fetchChats();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getBrandDashboardData();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    try {
      setChatsLoading(true);
      const response = await getChatList();
      if (response.length >= 1) {
        setChats(response.slice(0, 5)); // Show only first 5 chats
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    } finally {
      setChatsLoading(false);
    }
  };

  const getCampaignCount = () => {
    if (!dashboardData) return '_';
    
    switch (campaignFilter) {
      case 'open':
        return dashboardData.openCampaignsCount;
      case 'paused':
        return dashboardData.pausedCampaignsCount;
      case 'closed':
        return dashboardData.completeCampaignsCount;
      default:
        return dashboardData.openCampaignsCount + dashboardData.pausedCampaignsCount + dashboardData.completeCampaignsCount;
    }
  };

  const getContractCount = () => {
    if (!dashboardData) return '_';
    return contractFilter === 'active' ? dashboardData.totalActiveContractsCount : dashboardData.totalContractsCount;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '_';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full px-2 md:px-4 flex items-center justify-center py-20">
        <FaSpinner className="text-[#9afa00] text-4xl animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full px-2 md:px-4">
      {/* Stats Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 mt-2">
        {/* Campaigns Card */}
        <div className="bg-[rgba(0,0,0,0.3)] border border-[#9afa00] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <FaBullhorn className="text-[#9afa00] text-3xl" />
            <select 
              value={campaignFilter} 
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="bg-[#232626] text-white text-sm px-2 py-1 rounded border border-gray-600 focus:border-[#9afa00] focus:outline-none"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="text-white text-3xl font-bold mb-2">
            {getCampaignCount()}
          </div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">
            {campaignFilter === 'all' ? 'Total Campaigns' : `${campaignFilter} Campaigns`}
          </div>
        </div>

        {/* Contracts Card */}
        <div className="bg-[rgba(0,0,0,0.3)] border border-[#9afa00] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <FaFileContract className="text-[#9afa00] text-3xl" />
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Active</label>
              <input
                type="checkbox"
                checked={contractFilter === 'active'}
                onChange={(e) => setContractFilter(e.target.checked ? 'active' : 'total')}
                className="form-checkbox h-4 w-4 text-[#9afa00] rounded"
              />
            </div>
          </div>
          <div className="text-white text-3xl font-bold mb-2">
            {getContractCount()}
          </div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">
            {contractFilter === 'active' ? 'Active Contracts' : 'Total Contracts'}
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-[rgba(0,0,0,0.3)] border border-[#9afa00] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <FaDollarSign className="text-[#9afa00] text-3xl" />
          </div>
          <div className="text-white text-3xl font-bold mb-2">
            {dashboardData ? formatCurrency(dashboardData.totalSpendOnContracts) : '_'}
          </div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">
            Total Spent on Contracts
          </div>
        </div>

        {/* Member Since Card */}
        <div className="bg-[rgba(0,0,0,0.3)] border border-[#9afa00] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <FaCalendarAlt className="text-[#9afa00] text-3xl" />
          </div>
          <div className="text-white text-3xl font-bold mb-2">
            {formatDate(dashboardData?.memberSince)}
          </div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">
            Member Since
          </div>
        </div>
      </div>

      {/* Recent Chats Section */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl md:text-2xl font-bold flex items-center gap-3">
            <FaComments className="text-[#9afa00]" />
            RECENT CHATS
          </h2>
          <button 
            onClick={() => navigate('/chats')}
            className="bg-[#9afa00] text-black px-4 py-2 rounded-md font-bold hover:bg-[#8ae600] transition-colors"
          >
            Show All Chats
          </button>
        </div>

        {chatsLoading ? (
          <div className="flex items-center justify-center py-10">
            <FaSpinner className="text-[#9afa00] text-2xl animate-spin" />
          </div>
        ) : chats.length > 0 ? (
          <div className="space-y-4">
            {chats.map((chat, index) => (
              <div 
                key={chat.id || index}
                className="bg-[rgba(0,0,0,0.3)] border border-gray-600 rounded-lg p-4 hover:border-[#9afa00] transition-colors cursor-pointer"
                onClick={() => navigate('/chats')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white font-semibold mb-1">
                      {chat.user?.athleteProfile?.firstName} {chat.user?.athleteProfile?.lastName}
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      {chat.lastMessage || 'No messages yet'}
                    </div>
                  </div>
                  <div className="text-gray-500 text-xs ml-4">
                    {formatTime(chat.lastMessageAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[rgba(0,0,0,0.3)] border border-gray-600 rounded-lg p-8 text-center">
            <FaComments className="text-gray-500 text-4xl mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">No chats yet</div>
            <div className="text-gray-500 text-sm">Start connecting with athletes to see your conversations here</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDashboardHome;