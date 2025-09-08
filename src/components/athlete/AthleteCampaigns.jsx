import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaDollarSign, FaTag, FaBuilding, FaComments, FaSpinner, FaUserSecret } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getMatchingCampaigns, transformCampaignData } from '../../services/campaignService';
import toast from 'react-hot-toast';



const AthleteCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Fetch campaigns on component mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        const rawCampaigns = await getMatchingCampaigns();
        const transformedCampaigns = transformCampaignData(rawCampaigns);
        setCampaigns(transformedCampaigns);
      } catch (err) {
        setError('Failed to load campaigns');
        console.error('Error fetching campaigns:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);
  
  // Filter campaigns based on status
  const filteredCampaigns = campaigns.filter(campaign => {
    if (filterStatus === 'all') return true;
    return campaign.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const handleChatClick = (e, campaign) => {
    e.stopPropagation();
    if (!campaign.brand) {
      toast.error('Cannot start chat - brand information not available');
      return;
    }
    // Navigate to chats with brand info
    navigate('/chats', { 
      state: { 
        selectedAthleteId: campaign.brand.id, 
        selectedAthleteName: campaign.isAnonymous ? 'Anonymous Brand' : (campaign.brand.name || campaign.brand.email)
      } 
    });
    toast.success(`Opening chat with ${campaign.isAnonymous ? 'anonymous brand' : 'brand'}...`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full min-h-screen px-2 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-white text-2xl md:text-3xl font-bold uppercase tracking-wide">Available Campaigns</h1>
        
        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-md font-bold text-sm transition ${
              filterStatus === 'all' 
                ? 'bg-[#9afa00] text-black' 
                : 'bg-[#232626] text-white hover:bg-[#9afa00] hover:text-black'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-4 py-2 rounded-md font-bold text-sm transition ${
              filterStatus === 'open' 
                ? 'bg-[#9afa00] text-black' 
                : 'bg-[#232626] text-white hover:bg-[#9afa00] hover:text-black'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-md font-bold text-sm transition ${
              filterStatus === 'completed' 
                ? 'bg-[#9afa00] text-black' 
                : 'bg-[#232626] text-white hover:bg-[#9afa00] hover:text-black'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-[#9afa00] text-3xl mr-3" />
          <span className="text-white text-lg">Loading campaigns...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#9afa00] text-black px-6 py-2 rounded-md font-bold hover:bg-[#baff32] transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* No Campaigns State */}
      {!loading && !error && filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No campaigns available for your sport.</p>
        </div>
      )}

      {/* Campaigns Grid */}
      {!loading && !error && filteredCampaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map(campaign => (
          <div
            key={campaign.id}
            onClick={() => handleCampaignClick(campaign)}
            className="bg-[#232626] rounded-xl p-6 cursor-pointer hover:border-[#9afa00] border border-transparent transition-all duration-200 hover:shadow-lg"
          >
            {/* Campaign Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-white text-lg font-bold mb-2">{campaign.title}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(campaign.status)}`}>
                  {campaign.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Brand Information */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-[#181c1a] rounded-lg">
              <div className="w-12 h-12 bg-[#9afa00] rounded-full flex items-center justify-center">
                {campaign.isAnonymous ? (
                  <FaUserSecret className="text-black text-lg" />
                ) : (
                  <FaBuilding className="text-black text-lg" />
                )}
              </div>
              <div>
                {campaign.isAnonymous ? (
                  <>
                    <h4 className="text-[#9afa00] font-bold text-sm">Anonymous Brand</h4>
                    <p className="text-gray-300 text-xs">Brand details hidden</p>
                  </>
                ) : (
                  <>
                    <h4 className="text-[#9afa00] font-bold text-sm">{campaign.brand?.name || 'Unknown Brand'}</h4>
                    <p className="text-gray-300 text-xs">{campaign.brand?.email || 'No description available'}</p>
                  </>
                )}
              </div>
            </div>

            {/* Campaign Details */}
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{campaign.description}</p>
            
            {/* Budget and Date */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-[#9afa00]">
                <FaDollarSign className="text-xs" />
                <span className="font-bold">${campaign.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <FaCalendarAlt className="text-xs" />
                <span>{new Date(campaign.createdDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Sport Tag and Chat Button */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <FaTag className="text-[#9afa00] text-xs" />
                <span className="text-[#9afa00] text-xs font-bold uppercase">{campaign.sport}</span>
              </div>
              <button
                onClick={(e) => handleChatClick(e, campaign)}
                disabled={!campaign.brand}
                className={`px-3 py-1 rounded-md font-bold text-xs transition flex items-center gap-1 ${
                  !campaign.brand
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-[#9afa00] text-black hover:bg-[#baff32]'
                }`}
                title={!campaign.brand ? 'Chat not available' : `Start chat with ${campaign.isAnonymous ? 'anonymous brand' : 'brand'}`}
              >
                <FaComments className="text-xs" />
                Chat
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Campaign Detail Modal */}
      {showModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-4xl bg-[#1B2317] rounded-2xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-[#9afa00] text-2xl hover:text-white transition z-10"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            {/* Modal Content */}
            <div className="pr-8">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-white text-2xl font-bold mb-2">{selectedCampaign.title}</h2>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold text-white ${getStatusColor(selectedCampaign.status)}`}>
                  {selectedCampaign.status.toUpperCase()}
                </span>
              </div>

              {/* Brand Section */}
              <div className="bg-[#232626] rounded-xl p-6 mb-6">
                <h3 className="text-[#9afa00] text-lg font-bold mb-4">Brand Information</h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[#9afa00] rounded-full flex items-center justify-center flex-shrink-0">
                    {selectedCampaign.isAnonymous ? (
                      <FaUserSecret className="text-black text-2xl" />
                    ) : (
                      <FaBuilding className="text-black text-2xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    {selectedCampaign.isAnonymous ? (
                      <>
                        <h4 className="text-white text-xl font-bold mb-2">Anonymous Brand</h4>
                        <p className="text-gray-300 mb-2">This campaign is posted anonymously. Brand details are hidden to protect privacy.</p>
                        <p className="text-[#9afa00] text-sm">Brand information will be revealed upon campaign acceptance.</p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-white text-xl font-bold mb-2">{selectedCampaign.brand?.name || 'Unknown Brand'}</h4>
                        <p className="text-gray-300 mb-2">{selectedCampaign.brand?.email || 'No description available'}</p>
                        {selectedCampaign.brand?.logo && (
                          <img src={selectedCampaign.brand.logo} alt="Brand Logo" className="w-12 h-12 object-contain" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="mb-6">
                <h3 className="text-[#9afa00] text-lg font-bold mb-3">Campaign Details</h3>
                <p className="text-gray-300 leading-relaxed mb-6">{selectedCampaign.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaDollarSign className="text-[#9afa00]" />
                      <span className="text-white font-bold text-xl">${selectedCampaign.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaTag className="text-[#9afa00]" />
                      <span className="text-gray-300">Sport: {selectedCampaign.sport}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-[#9afa00]" />
                      <span className="text-gray-300">Created: {new Date(selectedCampaign.createdDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(selectedCampaign.status)}`}>
                        Status: {selectedCampaign.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-600">
                <button
                  className="flex-1 bg-[#232626] text-white font-bold py-3 rounded-md uppercase hover:bg-[#181c1a] transition border border-[#9afa00]"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                {selectedCampaign.status === 'Open' && (
                  <button className="flex-1 bg-[#9afa00] text-black font-bold py-3 rounded-md uppercase hover:bg-[#baff32] transition">
                    Apply for Campaign
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthleteCampaigns;