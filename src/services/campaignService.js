import axios from 'axios';
import toast from 'react-hot-toast';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Create axios instance with auth headers
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Create a new campaign
export const createCampaign = async (campaignData) => {
  try {
    const response = await axios.post(
      `${baseUrl}campaigns`,
      {
        title: campaignData.title,
        description: campaignData.description,
        budget: campaignData.budget,
        targetSport: campaignData.targetSport,
        isAnonymous: campaignData.isAnonymous || false // Default to false
      },
      {
        headers: createAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    toast.error(error.response?.data?.message || 'Failed to create campaign');
    throw error;
  }
};

// Get all campaigns
export const getAllCampaigns = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}campaigns/my-campaigns`,
      {
        headers: createAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch campaigns');
    throw error;
  }
};

// Update a campaign
export const updateCampaign = async (campaignId, updateData) => {
  try {
    const response = await axios.patch(
      `${baseUrl}campaigns/${campaignId}`,
      updateData,
      {
        headers: createAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating campaign:', error);
    toast.error(error.response?.data?.message || 'Failed to update campaign');
    throw error;
  }
};

// Delete a campaign
export const deleteCampaign = async (campaignId) => {
  try {
    const response = await axios.delete(
      `${baseUrl}campaigns/${campaignId}`,
      {
        headers: createAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    toast.error(error.response?.data?.message || 'Failed to delete campaign');
    throw error;
  }
};

/**
 * Get campaigns that match the athlete's sport
 * @returns {Promise<Array>} Array of campaign objects
 */
export const getMatchingCampaigns = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}campaigns/match/my-sport`,
      {
        headers: createAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching matching campaigns:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch campaigns');
    throw error;
  }
};

/**
 * Transform API campaign data to match component expectations
 * @param {Array} campaigns - Raw campaign data from API
 * @returns {Array} Transformed campaign data
 */
export const transformCampaignData = (campaigns) => {
  return campaigns.map(campaign => ({
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    budget: parseInt(campaign.budget),
    status: campaign.status,
    sport: campaign.targetSport,
    createdDate: campaign.createdAt,
    isAnonymous: campaign.isAnonymous,
    brand: campaign.brand ? {
      id: campaign.brand.id,
      name: campaign.brand.name,
      logo: campaign.brand.logo,
      email: campaign.brand.email,
      profile: campaign.brand.profile,
      createdAt: campaign.brand.createdAt,
      updatedAt: campaign.brand.updatedAt
    } : null
  }));
};