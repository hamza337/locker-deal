import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaTimes, FaDollarSign, FaCalendarAlt, FaFlag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { createCampaign, getAllCampaigns, updateCampaign, deleteCampaign } from '../../services/campaignService';

const CAMPAIGN_STATUSES = {
  OPEN: 'OPEN',
  PAUSED: 'PAUSED', 
  CLOSED: 'CLOSED'
};

const STATUS_COLORS = {
  [CAMPAIGN_STATUSES.OPEN]: 'bg-green-500',
  [CAMPAIGN_STATUSES.PAUSED]: 'bg-yellow-500',
  [CAMPAIGN_STATUSES.CLOSED]: 'bg-gray-500'
};

const BrandCompaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    sport: '',
    status: '',
    isAnonymous: false
  });

  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const campaignsData = await getAllCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    setModalMode('create');
    setFormData({ title: '', description: '', budget: '', sport: '', status: CAMPAIGN_STATUSES.OPEN, isAnonymous: false });
    setIsModalOpen(true);
  };

  const handleEditCampaign = (campaign) => {
    setModalMode('edit');
    setSelectedCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      budget: campaign.budget,
      sport: campaign.sport || campaign.targetSport || '',
      status: campaign.status,
      isAnonymous: campaign.isAnonymous || false
    });
    setIsModalOpen(true);
  };

  const handleViewCampaign = (campaign) => {
    setModalMode('view');
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDeleteCampaign = (campaignId) => {
    setCampaignToDelete(campaignId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCampaign = async () => {
    if (campaignToDelete) {
      setIsDeleting(true);
      try {
        await deleteCampaign(campaignToDelete);
        toast.success('Campaign deleted successfully!');
        // Refresh campaigns list
        fetchCampaigns();
      } catch (error) {
        console.error('Failed to delete campaign:', error);
      } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setCampaignToDelete(null);
      }
    }
  };

  const cancelDeleteCampaign = () => {
    setIsDeleteModalOpen(false);
    setCampaignToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (modalMode === 'create') {
        await createCampaign({
          title: formData.title,
          description: formData.description,
          budget: formData.budget,
          targetSport: formData.sport,
          isAnonymous: formData.isAnonymous
        });
        toast.success('Campaign created successfully!');
        // Refresh campaigns list
        fetchCampaigns();
      } else if (modalMode === 'edit') {
        // Prepare update data - only send fields that have changed
        const updateData = {};
        if (formData.title !== selectedCampaign.title) {
          updateData.title = formData.title;
        }
        if (formData.description !== selectedCampaign.description) {
          updateData.description = formData.description;
        }
        if (formData.budget !== selectedCampaign.budget) {
          updateData.budget = formData.budget;
        }
        if (formData.sport !== (selectedCampaign.sport || selectedCampaign.targetSport || '')) {
          updateData.targetSport = formData.sport;
        }
        if (formData.status !== selectedCampaign.status) {
          updateData.status = formData.status;
        }
        if (formData.isAnonymous !== (selectedCampaign.isAnonymous || false)) {
          updateData.isAnonymous = formData.isAnonymous;
        }
        
        // Only make API call if there are changes
        if (Object.keys(updateData).length > 0) {
          await updateCampaign(selectedCampaign.id, updateData);
          toast.success('Campaign updated successfully!');
          // Refresh campaigns list
          fetchCampaigns();
        } else {
          toast.info('No changes detected');
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove the handleStatusChange function as it's no longer needed

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatBudget = (budget) => {
    // If budget is already formatted with $, return as is
    if (typeof budget === 'string' && budget.startsWith('$')) {
      return budget;
    }
    // Otherwise, add $ prefix
    return `$${budget}`;
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

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-[#9afa00]"></div>
            <div className="text-white text-xl">Loading campaigns...</div>
          </div>
        </div>
      ) : (
        <>
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
                        {campaign.status}
                      </span>
                      {campaign.brand && (
                        <span className="text-gray-400 text-sm">{campaign.brand.email}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Campaign Description */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{campaign.description}</p>

                {/* Campaign Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#9afa00]">
                    {/* <FaDollarSign className="text-sm" /> */}
                    <span className="font-semibold">{formatBudget(campaign.budget)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaCalendarAlt className="text-sm" />
                    <span className="text-sm">Created: {formatDate(campaign.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {campaigns.length === 0 && !isLoading && (
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
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50 p-4">
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
              /* View Mode - Status dropdown removed */
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
                    <p className="text-white text-lg font-bold">{formatBudget(selectedCampaign?.budget)}</p>
                  </div>
                  <div>
                    <label className="block text-[#9afa00] font-semibold mb-2">Target Sport</label>
                    <p className="text-white">{selectedCampaign?.sport || selectedCampaign?.targetSport || 'Not specified'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#9afa00] font-semibold mb-2">Anonymous</label>
                    <p className="text-white">{selectedCampaign?.isAnonymous ? 'Yes' : 'No'}</p>
                  </div>
                  <div></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#9afa00] font-semibold mb-2">Status</label>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold text-white ${STATUS_COLORS[selectedCampaign?.status]}`}>
                      {selectedCampaign?.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[#9afa00] font-semibold mb-2">Created Date</label>
                    <p className="text-white">{formatDate(selectedCampaign?.createdAt)}</p>
                  </div>
                </div>
                {selectedCampaign?.brand && (
                  <div>
                    <label className="block text-[#9afa00] font-semibold mb-2">Brand</label>
                    <p className="text-white">{selectedCampaign.brand.email}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Create/Edit Form - Status dropdown added to edit mode */
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
                      placeholder="e.g., 5000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#9afa00] font-semibold mb-2">Target Sport</label>
                    <input
                      type="text"
                      value={formData.targetSport || formData.sport}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      className="w-full bg-[rgba(0,0,0,0.5)] text-white border border-[#9afa00]/30 rounded-lg px-4 py-3 focus:outline-none focus:border-[#9afa00] transition-colors"
                      placeholder="e.g., Basketball"
                    />
                  </div>
                </div>
                {/* Status dropdown - only shown in edit mode */}
                {modalMode === 'edit' && (
                  <div>
                    <label className="block text-[#9afa00] font-semibold mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[rgba(0,0,0,0.5)] text-white border border-[#9afa00]/30 rounded-lg px-4 py-3 focus:outline-none focus:border-[#9afa00] transition-colors"
                    >
                      <option value={CAMPAIGN_STATUSES.OPEN}>Open</option>
                      <option value={CAMPAIGN_STATUSES.PAUSED}>Paused</option>
                      <option value={CAMPAIGN_STATUSES.CLOSED}>Closed</option>
                    </select>
                  </div>
                )}
                {/* Anonymous posting checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="w-5 h-5 text-[#9afa00] bg-[rgba(0,0,0,0.5)] border border-[#9afa00]/30 rounded focus:ring-[#9afa00] focus:ring-2"
                  />
                  <label htmlFor="isAnonymous" className="text-white font-medium cursor-pointer">
                    Post campaign anonymously
                  </label>
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
                    disabled={isSubmitting}
                    className={`flex-1 py-3 px-6 rounded-lg transition-all duration-200 font-bold ${
                      isSubmitting 
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black hover:shadow-lg hover:shadow-[#9afa00]/25'
                    }`}
                  >
                    {isSubmitting 
                      ? (modalMode === 'create' ? 'Creating...' : 'Updating...')
                      : (modalMode === 'create' ? 'Create Campaign' : 'Update Campaign')
                    }
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1a2f14] to-[#0f1a0c] rounded-2xl p-6 w-full max-w-md border border-red-500/30">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Confirm Delete</h2>
              <button
                onClick={cancelDeleteCampaign}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mb-6">
              <p className="text-white text-center mb-4">
                Are you sure you want to delete this campaign?
              </p>
              <p className="text-red-400 text-sm text-center">
                This action cannot be undone.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4">
              <button
                onClick={cancelDeleteCampaign}
                className="flex-1 py-3 px-6 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCampaign}
                disabled={isDeleting}
                className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-200 ${
                  isDeleting 
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandCompaigns;