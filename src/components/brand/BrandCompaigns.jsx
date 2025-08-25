import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaTimes, FaDollarSign, FaCalendarAlt, FaFlag } from 'react-icons/fa';

const CAMPAIGN_STATUSES = {
  OPEN: 'open',
  COMPLETED: 'completed',
  CLOSED: 'closed'
};

const STATUS_COLORS = {
  [CAMPAIGN_STATUSES.OPEN]: 'bg-green-500',
  [CAMPAIGN_STATUSES.COMPLETED]: 'bg-blue-500',
  [CAMPAIGN_STATUSES.CLOSED]: 'bg-gray-500'
};

const initialCampaigns = [
  {
    id: 1,
    title: 'Summer Sports Collection',
    description: 'Promote our new summer sports collection targeting young athletes aged 18-25.',
    budget: '$5,000',
    status: CAMPAIGN_STATUSES.OPEN,
    createdAt: '2024-01-15',
    sport: 'Basketball'
  },
  {
    id: 2,
    title: 'Winter Training Gear',
    description: 'Campaign for winter training equipment and apparel for professional athletes.',
    budget: '$8,500',
    status: CAMPAIGN_STATUSES.COMPLETED,
    createdAt: '2024-01-10',
    sport: 'Football'
  },
  {
    id: 3,
    title: 'Marathon Sponsorship',
    description: 'Sponsorship opportunity for upcoming city marathon event.',
    budget: '$12,000',
    status: CAMPAIGN_STATUSES.CLOSED,
    createdAt: '2024-01-05',
    sport: 'Running'
  }
];

const BrandCompaigns = () => {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    sport: ''
  });

  const handleCreateCampaign = () => {
    setModalMode('create');
    setFormData({ title: '', description: '', budget: '', sport: '' });
    setIsModalOpen(true);
  };

  const handleEditCampaign = (campaign) => {
    setModalMode('edit');
    setSelectedCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      budget: campaign.budget,
      sport: campaign.sport
    });
    setIsModalOpen(true);
  };

  const handleViewCampaign = (campaign) => {
    setModalMode('view');
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDeleteCampaign = (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const newCampaign = {
        id: Date.now(),
        ...formData,
        status: CAMPAIGN_STATUSES.OPEN,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCampaigns([...campaigns, newCampaign]);
    } else if (modalMode === 'edit') {
      setCampaigns(campaigns.map(c => 
        c.id === selectedCampaign.id 
          ? { ...c, ...formData }
          : c
      ));
    }
    setIsModalOpen(false);
  };

  const handleStatusChange = (campaignId, newStatus) => {
    setCampaigns(campaigns.map(c => 
      c.id === campaignId 
        ? { ...c, status: newStatus }
        : c
    ));
  };

  return (
    <div className="w-full min-h-screen bg-transparent px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Campaigns</h1>
          <p className="text-gray-400 text-lg">Manage your marketing campaigns and sponsorship opportunities</p>
        </div>
        <button
          onClick={handleCreateCampaign}
          className="flex items-center gap-2 bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-[#9afa00]/25 transition-all duration-200 transform hover:scale-105"
        >
          <FaPlus /> Create Campaign
        </button>
      </div>

      {/* Campaigns Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {campaigns.map((campaign) => (
           <div 
             key={campaign.id} 
             className="bg-gradient-to-br from-[rgba(0,0,0,0.4)] to-[rgba(0,0,0,0.6)] rounded-2xl p-6 border border-[#9afa00]/20 hover:border-[#9afa00]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#9afa00]/10 cursor-pointer"
             onClick={() => handleViewCampaign(campaign)}
           >
             {/* Campaign Header */}
             <div className="flex justify-between items-start mb-4">
               <div className="flex-1">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xl font-bold text-white line-clamp-2 flex-1">{campaign.title}</h3>
                   <div className="flex items-center gap-2 ml-3">
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleEditCampaign(campaign);
                       }}
                       className="text-[#9afa00] hover:text-[#7dd800] transition-colors p-1"
                       title="Edit Campaign"
                     >
                       <FaEdit className="text-sm" />
                     </button>
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDeleteCampaign(campaign.id);
                       }}
                       className="text-red-400 hover:text-red-300 transition-colors p-1"
                       title="Delete Campaign"
                     >
                       <FaTrash className="text-sm" />
                     </button>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 mb-2">
                   <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${STATUS_COLORS[campaign.status]}`}>
                     {campaign.status.toUpperCase()}
                   </span>
                   <span className="text-gray-400 text-sm">{campaign.sport}</span>
                 </div>
               </div>
             </div>

             {/* Campaign Description */}
             <p className="text-gray-300 text-sm mb-4 line-clamp-3">{campaign.description}</p>

             {/* Campaign Details */}
             <div className="space-y-2">
               <div className="flex items-center gap-2 text-[#9afa00]">
                 <FaDollarSign className="text-sm" />
                 <span className="font-semibold">{campaign.budget}</span>
               </div>
               <div className="flex items-center gap-2 text-gray-400">
                 <FaCalendarAlt className="text-sm" />
                 <span className="text-sm">Created: {campaign.createdAt}</span>
               </div>
             </div>
           </div>
         ))}
       </div>

      {/* Empty State */}
      {campaigns.length === 0 && (
        <div className="text-center py-16">
          <FaFlag className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Campaigns Yet</h3>
          <p className="text-gray-400 mb-6">Create your first campaign to start reaching athletes</p>
          <button
            onClick={handleCreateCampaign}
            className="bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-[#9afa00]/25 transition-all duration-200"
          >
            Create Your First Campaign
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1a2f14] to-[#0f1a0c] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#9afa00]/30">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {modalMode === 'create' && 'Create New Campaign'}
                {modalMode === 'edit' && 'Edit Campaign'}
                {modalMode === 'view' && 'Campaign Details'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {modalMode === 'view' ? (
              /* View Mode */
              <div className="space-y-6">
                <div>
                  <label className="block text-[#9afa00] font-semibold mb-2">Title</label>
                  <p className="text-white text-lg">{selectedCampaign?.title}</p>
                </div>
                <div>
                  <label className="block text-[#9afa00] font-semibold mb-2">Description</label>
                  <p className="text-gray-300 leading-relaxed">{selectedCampaign?.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#9afa00] font-semibold mb-2">Budget</label>
                    <p className="text-white text-lg font-bold">{selectedCampaign?.budget}</p>
                  </div>
                  <div>
                    <label className="block text-[#9afa00] font-semibold mb-2">Sport</label>
                    <p className="text-white">{selectedCampaign?.sport}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[#9afa00] font-semibold mb-2">Status</label>
                     <div className="flex items-center gap-4">
                       <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold text-white ${STATUS_COLORS[selectedCampaign?.status]}`}>
                         {selectedCampaign?.status.toUpperCase()}
                       </span>
                       <select
                         value={selectedCampaign?.status}
                         onChange={(e) => handleStatusChange(selectedCampaign?.id, e.target.value)}
                         className="bg-[rgba(0,0,0,0.5)] text-white border border-[#9afa00]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#9afa00] transition-colors"
                       >
                         <option value={CAMPAIGN_STATUSES.OPEN}>Open</option>
                         <option value={CAMPAIGN_STATUSES.COMPLETED}>Completed</option>
                         <option value={CAMPAIGN_STATUSES.CLOSED}>Closed</option>
                       </select>
                     </div>
                   </div>
                   <div>
                     <label className="block text-[#9afa00] font-semibold mb-2">Created Date</label>
                     <p className="text-white">{selectedCampaign?.createdAt}</p>
                   </div>
                 </div>
              </div>
            ) : (
              /* Create/Edit Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#9afa00] font-semibold mb-2">Campaign Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.5)] text-white border border-[#9afa00]/30 rounded-lg px-4 py-3 focus:outline-none focus:border-[#9afa00] transition-colors"
                    placeholder="Enter campaign title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#9afa00] font-semibold mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.5)] text-white border border-[#9afa00]/30 rounded-lg px-4 py-3 focus:outline-none focus:border-[#9afa00] transition-colors h-32 resize-none"
                    placeholder="Describe your campaign objectives and target audience"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#9afa00] font-semibold mb-2">Budget *</label>
                    <input
                      type="text"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full bg-[rgba(0,0,0,0.5)] text-white border border-[#9afa00]/30 rounded-lg px-4 py-3 focus:outline-none focus:border-[#9afa00] transition-colors"
                      placeholder="e.g., $5,000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#9afa00] font-semibold mb-2">Target Sport *</label>
                    <input
                      type="text"
                      value={formData.sport}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      className="w-full bg-[rgba(0,0,0,0.5)] text-white border border-[#9afa00]/30 rounded-lg px-4 py-3 focus:outline-none focus:border-[#9afa00] transition-colors"
                      placeholder="e.g., Basketball"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-[#9afa00]/25 transition-all duration-200 font-bold"
                  >
                    {modalMode === 'create' ? 'Create Campaign' : 'Update Campaign'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandCompaigns;