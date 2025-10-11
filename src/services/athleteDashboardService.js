import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Helper function to create auth headers
const createAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get athlete dashboard data
export const getAthleteDashboardData = async () => {
  try {
    const response = await axios.get(`${baseUrl}users/athlete/dashboard`, {
      headers: createAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching athlete dashboard data:', error);
    throw error;
  }
};

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id;
};

// Get chat list for athlete
export const getChatList = async () => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not found');
    }
    
    const response = await axios.get(`${baseUrl}chat/list/${userId}`, {
      headers: createAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat list:', error);
    throw error;
  }
};