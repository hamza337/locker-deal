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

/**
 * Update account settings including MFA
 * @param {Object} settings - Account settings to update
 * @param {boolean} settings.is2FAEnabled - Whether 2FA is enabled
 * @returns {Promise<Object>} API response
 */
export const updateAccountSettings = async (settings) => {
  try {
    const response = await axios.patch(`${baseUrl}users/account-settings`, settings, {
      headers: createAuthHeaders()
    });

    if (response.data.success) {
      // Update localStorage user data if MFA setting changed
      if (settings.hasOwnProperty('is2FAEnabled')) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.is2FAEnabled = settings.is2FAEnabled;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      toast.success('Account settings updated successfully!');
      return { success: true, data: response.data };
    } else {
      throw new Error(response.data.message || 'Failed to update account settings');
    }
  } catch (error) {
    console.error('Error updating account settings:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update account settings';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Update brand profile information
 * @param {Object} profileData - Brand profile data to update
 * @returns {Promise<Object>} API response
 */
export const updateBrandProfile = async (profileData) => {
  try {
    const response = await axios.patch(`${baseUrl}users/profile`, profileData, {
      headers: createAuthHeaders()
    });

    if (response.data.success) {
      toast.success('Profile updated successfully!');
      return { success: true, data: response.data };
    } else {
      throw new Error(response.data.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Error updating brand profile:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
    toast.error(errorMessage);
    throw error;
  }
};

export default {
  updateAccountSettings,
  updateBrandProfile
};