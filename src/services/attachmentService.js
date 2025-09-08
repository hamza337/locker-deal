import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to extract filename from S3 URL and apply ellipsis
const extractFilenameFromUrl = (url, maxLength = 30) => {
  if (!url) return 'Unknown file';
  
  try {
    // Check if it's an S3 URL with 'others/' path
    if (url.includes('/others/')) {
      const parts = url.split('/others/');
      if (parts.length > 1) {
        // Get the part after 'others/'
        const afterOthers = parts[1];
        // Remove any query parameters or additional path segments
        const filename = afterOthers.split('?')[0].split('/')[0];
        
        // Apply ellipsis if too long
        if (filename.length > maxLength) {
          return filename.substring(0, maxLength - 3) + '...';
        }
        return filename;
      }
    }
    
    // Fallback: extract filename from URL path
    const urlPath = new URL(url).pathname;
    const filename = urlPath.split('/').pop() || 'Unknown file';
    
    // Apply ellipsis if too long
    if (filename.length > maxLength) {
      return filename.substring(0, maxLength - 3) + '...';
    }
    return filename;
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return 'Unknown file';
  }
};

/**
 * Get all attachments (images and documents) from a specific chat
 * @param {string} otherUserId - The ID of the other user in the chat
 * @returns {Promise<Array>} Array of attachment objects
 */
export const getChatAttachments = async (otherUserId) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_BASE_URL}chat/attachments/${otherUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching chat attachments:', error);
    throw error;
  }
};

/**
 * Filter attachments to only include signable documents (images and documents, excluding videos)
 * @param {Array} attachments - Array of attachment objects
 * @returns {Array} Filtered array of signable attachments
 */
export const getSignableAttachments = (attachments) => {
  return attachments.filter(attachment => 
    attachment.type === 'image' || attachment.type === 'document'
  ).map(attachment => ({
    id: attachment.id,
    name: attachment.mediaUrl ? extractFilenameFromUrl(attachment.mediaUrl) : `${attachment.type}_${attachment.id}`,
    size: 'Unknown size', // API doesn't provide file size, could be enhanced
    url: attachment.mediaUrl,
    type: attachment.type,
    needsSignature: true, // All documents can be signed
    messageId: attachment.id,
    sender: attachment.sender,
    receiver: attachment.receiver,
    createdAt: attachment.createdAt
  }));
};