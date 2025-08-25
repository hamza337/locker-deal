import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaDollarSign, FaTag, FaBuilding, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Sample campaigns data with brand information
const campaignsData = [
  {
    id: 1,
    title: 'Ice Hockey Final',
    description: 'wear armani t shirt in the ice hockey world cup final',
    budget: 37000,
    status: 'Open',
    sport: 'ice hockey',
    createdDate: '2025-08-25',
    brand: {
      name: 'Armani Sports',
      logo: '/brand-logo1.png',
      description: 'Premium sports apparel brand',
      website: 'www.armanisports.com'
    },
    requirements: [
      'Must wear Armani t-shirt during the final match',
      'Social media posts required (3 posts minimum)',
      'Tag @ArmanSports in all posts',
      'Professional photos during the event'
    ],
    duration: '1 day event',
    deliverables: [
      'Wear branded apparel during match',
      '3 social media posts',
      'Professional event photos',
      'Post-event interview mention'
    ]
  },
  {
    id: 2,
    title: 'Hockey Championship Gear',
    description: 'Promote our new hockey gear line during championship season',
    budget: 25000,
    status: 'Open',
    sport: 'ice hockey',
    createdDate: '2025-01-15',
    brand: {
      name: 'ProHockey Gear',
      logo: '/brand-logo2.png',
      description: 'Professional hockey equipment manufacturer',
      website: 'www.prohockeygear.com'
    },
    requirements: [
      'Use ProHockey equipment during training',
      'Create equipment review video',
      'Attend brand photoshoot',
      'Social media campaign participation'
    ],
    duration: '3 months',
    deliverables: [
      'Equipment usage during training',
      '1 review video (5+ minutes)',
      'Photoshoot participation',
      '5 social media posts per month'
    ]
  },
  {
    id: 3,
    title: 'Winter Sports Collection',
    description: 'Showcase our winter sports apparel collection',
    budget: 18000,
    status: 'Open',
    sport: 'ice hockey',
    createdDate: '2025-01-10',
    brand: {
      name: 'Arctic Wear',
      logo: '/brand-logo3.png',
      description: 'Winter sports clothing specialist',
      website: 'www.arcticwear.com'
    },
    requirements: [
      'Wear Arctic Wear apparel in training',
      'Create styling content',
      'Participate in brand events',
      'Cross-platform promotion'
    ],
    duration: '2 months',
    deliverables: [
      'Training session content',
      'Styling videos and photos',
      'Event appearances',
      'Multi-platform posts'
    ]
  },
  {
    id: 4,
    title: 'Energy Drink Partnership',
    description: 'Promote our energy drink for athletes',
    budget: 15000,
    status: 'Completed',
    sport: 'ice hockey',
    createdDate: '2024-12-01',
    brand: {
      name: 'PowerBoost Energy',
      logo: '/brand-logo4.png',
      description: 'Premium energy drinks for athletes',
      website: 'www.powerboost.com'
    },
    requirements: [
      'Use PowerBoost during training',
      'Create testimonial content',
      'Attend launch event',
      'Social media endorsement'
    ],
    duration: '1 month',
    deliverables: [
      'Product usage content',
      'Testimonial video',
      'Event participation',
      'Social endorsements'
    ]
  }
];

const AthleteCampaigns = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  
  // Filter campaigns based on status
  const filteredCampaigns = campaignsData.filter(campaign => {
    if (filterStatus === 'all') return true;
    return campaign.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const handleChatClick = (e, campaign) => {
    e.stopPropagation();
    navigate('/chats');
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

      {/* Campaigns Grid */}
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
                <FaBuilding className="text-black text-lg" />
              </div>
              <div>
                <h4 className="text-[#9afa00] font-bold text-sm">{campaign.brand.name}</h4>
                <p className="text-gray-300 text-xs">{campaign.brand.description}</p>
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
                className="bg-[#9afa00] text-black px-3 py-1 rounded-md font-bold text-xs hover:bg-[#baff32] transition flex items-center gap-1"
              >
                <FaComments className="text-xs" />
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Detail Modal */}
      {showModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
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
                    <FaBuilding className="text-black text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white text-xl font-bold mb-2">{selectedCampaign.brand.name}</h4>
                    <p className="text-gray-300 mb-2">{selectedCampaign.brand.description}</p>
                    <a href={`https://${selectedCampaign.brand.website}`} target="_blank" rel="noopener noreferrer" className="text-[#9afa00] hover:underline text-sm">
                      {selectedCampaign.brand.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* Campaign Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-[#9afa00] text-lg font-bold mb-3">Campaign Details</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedCampaign.description}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#9afa00] text-lg font-bold mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {selectedCampaign.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-[#9afa00] mt-1">•</span>
                          <span className="text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-[#9afa00] text-lg font-bold mb-3">Campaign Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FaDollarSign className="text-[#9afa00]" />
                        <span className="text-white font-bold text-xl">${selectedCampaign.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-[#9afa00]" />
                        <span className="text-gray-300">Created: {new Date(selectedCampaign.createdDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaTag className="text-[#9afa00]" />
                        <span className="text-gray-300">Sport: {selectedCampaign.sport}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-[#9afa00]" />
                        <span className="text-gray-300">Duration: {selectedCampaign.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#9afa00] text-lg font-bold mb-3">Deliverables</h3>
                    <ul className="space-y-2">
                      {selectedCampaign.deliverables.map((deliverable, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-[#9afa00] mt-1">✓</span>
                          <span className="text-sm">{deliverable}</span>
                        </li>
                      ))}
                    </ul>
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