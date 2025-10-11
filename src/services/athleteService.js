import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get all athletes with filters and pagination
export const getAllAthletes = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to params
    if (filters.search) params.append('search', filters.search);
    if (filters.profile) params.append('profile', filters.profile);
    if (filters.type) params.append('type', filters.type);
    if (filters.location) params.append('location', filters.location);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await axios.get(`${baseUrl}users/athletes?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching athletes:', error);
    throw error;
  }
};

// Get individual athlete profile data
export const getAthleteProfile = async (athleteId) => {
  try {
    const response = await axios.post(`${baseUrl}users/athlete/${athleteId}/view`,{}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching athlete profile:', error);
    throw error;
  }
};