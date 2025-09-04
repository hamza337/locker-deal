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

// Get chat list for current user
export const getChatList = async () => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found in localStorage');
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
    toast.error(error.response?.data?.message || 'Failed to fetch chat list');
    throw error;
  }
};

// Get chat messages between users
export const getChatMessages = async (otherUserId) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found in localStorage');
    }

    const response = await axios.get(
      `${baseUrl}chat/messages/${userId}/${otherUserId}`,
      {
        headers: createAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch messages');
    throw error;
  }
};

// Get chat history between users
export const getChatHistory = async (userId, otherUserId) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(
      `${baseUrl}chat/history/${userId}/${otherUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.put(
      `${baseUrl}chat/read/${messageId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};