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

// Determine file type based on MIME type
const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) {
    return 'images';
  } else if (mimeType.startsWith('video/')) {
    return 'videos';
  } else {
    return 'others';
  }
};

// Get message type based on MIME type
const getMessageType = (mimeType) => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else {
    return 'document';
  }
};

// Get presigned URL for file upload
export const getPresignedUrl = async (fileName, fileType) => {
  try {
    const response = await axios.post(
      `${baseUrl}users/presigned-urls`,
      {
        files: [
          {
            fileName: fileName,
            fileType: fileType
          }
        ]
      },
      {
        headers: createAuthHeaders()
      }
    );
    
    return response.data[0]; // Return the first (and only) file object
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    toast.error('Failed to prepare file upload');
    throw error;
  }
};

// Upload file to S3 using presigned URL
export const uploadFileToS3 = async (presignedUrl, file) => {
  try {
    const response = await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    toast.error('Failed to upload file');
    throw error;
  }
};

// Complete file upload process
export const uploadFile = async (file) => {
  try {
    // Show upload progress
    toast.loading('Uploading file...', { id: 'file-upload' });
    
    // Step 1: Get presigned URL
    const fileType = getFileType(file.type);
    const presignedData = await getPresignedUrl(file.name, fileType);
    
    // Step 2: Upload file to S3
    const uploadSuccess = await uploadFileToS3(presignedData.url, file);
    
    if (uploadSuccess) {
      toast.success('File uploaded successfully!', { id: 'file-upload' });
      
      // Return the data needed for the message
      return {
        mediaUrl: presignedData.imageUrl,
        type: getMessageType(file.type),
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      };
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    toast.error('File upload failed', { id: 'file-upload' });
    throw error;
  }
};

// Validate file before upload
export const validateFile = (file) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    // Videos
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    toast.error('File type not supported. Please upload images, videos, or documents.');
    return false;
  }
  
  if (file.size > maxSize) {
    toast.error('File size too large. Maximum size is 50MB.');
    return false;
  }
  
  return true;
};