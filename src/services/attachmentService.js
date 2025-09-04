import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    name: attachment.mediaUrl ? attachment.mediaUrl.split('/').pop() : `${attachment.type}_${attachment.id}`,
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