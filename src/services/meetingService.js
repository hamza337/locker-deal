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

// Create a new meeting
export const createMeeting = async (meetingData) => {
  try {
    const response = await axios.post(
      `${baseUrl}meetings/create`,
      meetingData,
      {
        headers: createAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    const errorMessage = error.response?.data?.message || 'Failed to create meeting';
    toast.error(errorMessage);
    throw error;
  }
};

// Validate meeting data
export const validateMeetingData = (meetingData) => {
  const errors = [];
  
  if (!meetingData.invitedEmail || !meetingData.invitedEmail.trim()) {
    errors.push('Invited email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(meetingData.invitedEmail)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!meetingData.title || !meetingData.title.trim()) {
    errors.push('Meeting title is required');
  }
  
  if (!meetingData.startTime) {
    errors.push('Start time is required');
  }
  
  if (!meetingData.endTime) {
    errors.push('End time is required');
  }
  
  if (meetingData.startTime && meetingData.endTime) {
    const startDate = new Date(meetingData.startTime);
    const endDate = new Date(meetingData.endTime);
    
    if (startDate >= endDate) {
      errors.push('End time must be after start time');
    }
    
    if (startDate < new Date()) {
      errors.push('Start time cannot be in the past');
    }
  }
  
  return errors;
};

// Format date for datetime-local input
export const formatDateForInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Get default meeting times (current time + 1 hour for start, + 2 hours for end)
export const getDefaultMeetingTimes = () => {
  const now = new Date();
  const startTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
  const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours
  
  return {
    startTime: formatDateForInput(startTime),
    endTime: formatDateForInput(endTime)
  };
};