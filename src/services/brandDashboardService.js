import axios from 'axios';
import toast from 'react-hot-toast';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Get user ID from localStorage
const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id;
};

// Create axios instance with auth headers
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get brand dashboard data
export const getBrandDashboardData = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}users/brand/dashboard`,
      {
        headers: createAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching brand dashboard data:', error);
    toast.error('Failed to retrieve dashboard data');
    throw error;
  }
};

// Get chat list for current user
export const getChatList = async () => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not found');
    }

    const response = await axios.get(
      `${baseUrl}chat/list/${userId}`,
      {
        headers: createAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching chat list:', error);
    toast.error('Failed to retrieve chat data');
    throw error;
  }
};