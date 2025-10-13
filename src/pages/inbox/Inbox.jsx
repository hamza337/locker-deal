import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaMicrophone, FaEllipsisV, FaBars, FaTimes, FaPaperclip, FaRobot, FaFileSignature, FaCalendarAlt, FaFilePdf, FaImage, FaPaperPlane, FaDownload, FaPlay, FaFileAlt, FaClock, FaUser, FaVideo, FaSmile, FaFileContract, FaDollarSign, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { getChatList, getChatHistory } from '../../services/chatService';
import socketService from '../../services/socketService';
import { uploadFile, validateFile } from '../../services/uploadService';
import { getChatAttachments, getSignableAttachments } from '../../services/attachmentService';
import { createMeeting, validateMeetingData, getDefaultMeetingTimes } from '../../services/meetingService';
import VideoCall from '../../components/chat/VideoCall';
import videoCallService from '../../services/videoCallService';
import documentSigningService from '../../services/documentSigningService';
import subscriptionService from '../../services/subscriptionService';
import toast from 'react-hot-toast';

// Dynamic documents will be fetched from API

const Inbox = () => {
  // All users now have access to chat functionality regardless of subscription plan

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
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showDocuments, setShowDocuments] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [signatureStep, setSignatureStep] = useState('select'); // 'select', 'preview', 'sign', 'review', 'complete'
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState('');
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
  const [showSignatureOnDocument, setShowSignatureOnDocument] = useState(false);
  const [chatDocuments, setChatDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Meeting modal states
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingData, setMeetingData] = useState({
    invitedEmail: '',
    title: '',
    startTime: '',
    endTime: ''
  });
  
  // Video call states
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallType, setVideoCallType] = useState('outgoing'); // 'incoming', 'outgoing', 'active'
  const [videoCallData, setVideoCallData] = useState({
    callerName: '',
    callerId: '',
    channelName: ''
  });
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  
  // Emoji picker states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // GPT toggle state (only for athletes)
  const [gptEnabled, setGptEnabled] = useState(false);
  const [isAthlete, setIsAthlete] = useState(false);
  
  // Tab states for athletes
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'ai-assistant'
  const [aiMessages, setAiMessages] = useState([]);
  const [aiNewMessage, setAiNewMessage] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [aiConnectionStatus, setAiConnectionStatus] = useState('disconnected');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState(null);
  
  // Contract modal states
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractData, setContractData] = useState({
    title: '',
    amount: '',
    expiryDate: '',
    signingValidUntil: '',
    paymentResponsibility: 'brand',
    contractFile: null
  });
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [contractFileUrl, setContractFileUrl] = useState('');
  
  const canvasRef = useRef(null);
  const documentRef = useRef(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const contractFileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const aiMessagesEndRef = useRef(null);

  // Check user type and subscription access on component mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setIsAthlete(userData.role === 'athlete');
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize socket and fetch chat list on component mount
  useEffect(() => {
    // Ensure socket is connected
    if (!socketService.isConnected) {
      console.log('🔌 Connecting to socket service...');
      socketService.connect();
    }
    
    fetchChatList();
  }, []);

  // Setup AI socket event listeners
  useEffect(() => {
    if (!socketService.socket || !isAthlete) return;

    const socket = socketService.socket;

    // AI Connection Events
    const handleConnect = () => {
      setAiConnectionStatus('connected');
      console.log('🤖 Connected to AI server');
    };

    const handleDisconnect = () => {
      setAiConnectionStatus('disconnected');
      console.log('🤖 Disconnected from AI server');
    };

    // AI Streaming Events
    const handleStreamStart = () => {
      console.log('🤖 AI stream started');
      setIsAiStreaming(true);
      const newMessage = {
        id: Date.now(),
        fromMe: false,
        text: '',
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
        isStreaming: true
      };
      setCurrentStreamingMessage(newMessage);
      setAiMessages(prev => [...prev, newMessage]);
    };

    const handleStreamChunk = (data) => {
      console.log('🤖 Received chunk data:', data);
      
      // Handle both string tokens and object with token property
      const token = typeof data === 'string' ? data : (data.token || data.chunk || '');
      
      if (!token) {
        console.warn('🤖 Empty token received:', data);
        return;
      }
      
      console.log('🤖 Processing token:', token);
      
      setAiMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.isStreaming) {
          // Create a new object to ensure React detects the change
          const updatedMessage = {
            ...lastMessage,
            text: lastMessage.text + token
          };
          updated[updated.length - 1] = updatedMessage;
        }
        return updated;
      });
    };

    const handleStreamEnd = () => {
      console.log('🤖 AI stream ended');
      setIsAiStreaming(false);
      setCurrentStreamingMessage(null);
      setAiMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.isStreaming) {
          lastMessage.isStreaming = false;
        }
        return updated;
      });
    };

    // Add event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('gpt_stream_start', handleStreamStart);
    socket.on('gpt_stream_chunk', handleStreamChunk);
    socket.on('gpt_stream_end', handleStreamEnd);

    // Set initial connection status
    if (socket.connected) {
      setAiConnectionStatus('connected');
    }

    // Cleanup listeners on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('gpt_stream_start', handleStreamStart);
      socket.off('gpt_stream_chunk', handleStreamChunk);
      socket.off('gpt_stream_end', handleStreamEnd);
    };
  }, [isAthlete, socketService.socket]);

  // Cleanup socket listeners on unmount
  useEffect(() => {
    return () => {
      if (selectedChat) {
        socketService.leaveRoom(selectedChat.userId);
      }
    };
  }, []);

  // Handle automatic chat selection when navigating from athlete card
  useEffect(() => {
    const handleAutoSelection = async () => {
      if (location.state?.selectedAthleteId && chats.length >= 0 && loadingChats) {
        console.log('🎯 Auto-selecting chat for athlete:', location.state.selectedAthleteId);
        
        const targetChat = chats.find(chat => chat.userId === location.state.selectedAthleteId);
        
        if (targetChat) {
          console.log('✅ Found existing chat:', targetChat);
          // Leave previous room if any
          if (selectedChat) {
            socketService.leaveRoom(selectedChat.userId);
          }
          
          setSelectedChat(targetChat);
          
          // Fetch chat history
          try {
            await fetchChatHistory(targetChat.userId);
            // Join the new chat room
            const joinSuccess = await socketService.joinRoom(targetChat.userId);
            if (joinSuccess) {
              toast.success(`Opened chat with ${location.state.selectedAthleteName || 'athlete'}`);
            } else {
              toast.error('Failed to join chat room');
            }
          } catch (error) {
            console.error('Failed to load chat history:', error);
            toast.error('Failed to load chat history');
          }
        } else {
          console.log('📝 Creating new chat for athlete:', location.state.selectedAthleteId);
          // If chat doesn't exist, create a new chat entry
          const newChat = {
            userId: location.state.selectedAthleteId,
            avatar: `https://randomuser.me/api/portraits/men/1.jpg`,
            name: location.state.selectedAthleteName || 'Athlete',
            message: 'Start a conversation...',
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            badge: 0
          };
          
          setChats(prev => [newChat, ...prev]);
          setSelectedChat(newChat);
          setMessages([]); // Clear messages for new chat
          
          // Join the new chat room
          const joinSuccess = await socketService.joinRoom(newChat.userId);
          if (joinSuccess) {
            toast.success(`Started new chat with ${location.state.selectedAthleteName || 'athlete'}`);
          } else {
            toast.error('Failed to join new chat room');
          }
        }
        
        setSidebarOpen(false); // Close sidebar on mobile after selection
        
        // Clear the navigation state to prevent re-triggering
        window.history.replaceState({}, document.title);
      }
    };
    
    handleAutoSelection();
  }, [chats, location.state, loadingChats]);
  
  // Setup global socket message listener (always active)
  useEffect(() => {
    const handleMessage = (message) => {
      console.log('📨 Received new message:', message);
      console.log('📨 Current selectedChat:', selectedChat);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Check if message belongs to the currently selected chat
      const isMessageForCurrentChat = selectedChat && (
        (message.sender.id === selectedChat.userId && message.receiver.id === user.id) ||
        (message.sender.id === user.id && message.receiver.id === selectedChat.userId)
      );
      
      if (isMessageForCurrentChat) {
        // Add message to current chat if it's from another user (avoid duplicates)
        if (message.sender.id !== user.id) {
          const messageDate = message.createdAt || message.timestamp || new Date().toISOString();
          const newMessage = {
            id: message.id || Date.now(),
            fromMe: false,
            text: message.content || message.text || message.message,
            time: new Date(messageDate).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            createdAt: messageDate,
            type: message.type || 'text',
            mediaUrl: message.mediaUrl || null,
            fileName: message.fileName || null,
            fileSize: message.fileSize || null
          };
          
          setMessages(prev => [...prev, newMessage]);
          toast.success('New message received!');
        }
      } else {
        // Handle messages from other chats (global notifications)
        if (message.sender.id !== user.id) {
          console.log('📨 Message from other chat, showing global notification');
          
          // Find sender info from chat list for better notification
          const senderChat = chats.find(chat => chat.userId === message.sender.id);
          const senderName = senderChat?.name || message.sender.email || 'Someone';
          
          toast.success(`New message from ${senderName}`, {
            duration: 4000,
            icon: '💬',
          });
        }
      }
    };

    // Handle chat list updates from socket
    const handleChatListUpdate = (updatedChatList) => {
      console.log('📋 Received chat list update:', updatedChatList);
      
      // Transform API data to match component structure (same as fetchChatList)
      const transformedChats = updatedChatList.map((chat, index) => {
        let displayName = 'Unknown';
        let profileImage = '/user.png'; // Default fallback
        
        if (isAthlete) {
          // For athletes, show brand profile data
          if (chat.user.brandProfile) {
            displayName = `${chat.user.brandProfile.firstName || ''} ${chat.user.brandProfile.lastName || ''}`.trim();
          }
          if (chat.user.brandProfile.profilePictureUrl) {
            profileImage = chat.user.brandProfile.profilePictureUrl;
          }
        } else {
          // For brands, show athlete profile data
          if (chat.user.athleteProfile) {
            displayName = `${chat.user.athleteProfile.firstName || ''} ${chat.user.athleteProfile.lastName || ''}`.trim();
          }
          if (chat.user.athleteProfile.profilePictureUrl) {
            profileImage = chat.user.athleteProfile.profilePictureUrl;
          }
        }
        
        return {
          userId: chat.user.id,
          avatar: profileImage,
          name: displayName,
          message: chat.lastMessage,
          time: chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '12:25',
          badge: chat.unreadCount
        };
      });
      
      setChats(transformedChats);
      console.log('✅ Chat list updated automatically');
    };

    const unsubscribeMessages = socketService.onMessage(handleMessage);
    
    // Subscribe to chat list updates
    const unsubscribeChatList = socketService.onChatListUpdate(handleChatListUpdate);
    
    // Video call event listeners for new backend events
    const handleIncomingCall = ({ from, channelName }) => {
      console.log('📞 Incoming video call received:', { from, channelName });
      console.log('📞 Current user:', JSON.parse(localStorage.getItem('user') || '{}'));
      console.log('📞 Socket connected:', socketService.socket?.connected);
      
      setVideoCallData({
        callerName: from?.name || from?.email || 'Unknown User',
        callerId: from?.id || from,
        channelName: channelName
      });
      setVideoCallType('incoming');
      setShowVideoCall(true);
      
      console.log('📞 Updated video call state - showing modal');
      toast.success(`Incoming video call from ${from?.name || from?.email || 'Unknown User'}`);
    };

    const handleCallAccepted = ({ user, token }) => {
      console.log('📞 Video call accepted:', { user, token });
      
      // The caller has already joined the Agora channel when initiating the call
      // So we just need to update the UI state to 'active'
      if (videoCallService.isInCall()) {
        setVideoCallType('active');
        toast.success('Call accepted!');
      } else {
        // Fallback: try to join with token if provided
        if (token && videoCallData.channelName) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          videoCallService.joinCall(videoCallData.channelName, token, currentUser.id)
            .then(success => {
              if (success) {
                setVideoCallType('active');
                toast.success('Call accepted!');
              } else {
                setShowVideoCall(false);
                toast.error('Failed to connect to call 1');
              }
            })
            .catch(error => {
              console.error('❌ Failed to join call after acceptance:', error);
              setShowVideoCall(false);
              toast.error('Failed to connect to call 2');
            });
        } else {
          console.warn('⚠️ No token provided and not already in call');
          setShowVideoCall(false);
          toast.error('Failed to connect to call');
        }
      }
    };

    const handleCallRejected = ({ by }) => {
      console.log('📞 Video call rejected by:', by);
      setShowVideoCall(false);
      toast.error(`Call was rejected by ${by?.name || by?.email || 'user'}`);
    };

    const handleCallEnded = ({ by }) => {
      console.log('📞 Video call ended by:', by);
      videoCallService.leaveCall();
      setShowVideoCall(false);
      setVideoCallType('outgoing');
      setVideoCallData({
        callerName: '',
        callerId: '',
        channelName: ''
      });
      toast.success(`Call ended by ${by?.name || by?.email || 'user'}`);
    };

    // Set up video call socket listeners
    if (socketService.socket) {
      console.log('🔌 Setting up video call socket listeners');
      socketService.socket.on('incoming_call', handleIncomingCall);
      socketService.socket.on('call_accepted', handleCallAccepted);
      socketService.socket.on('call_rejected', handleCallRejected);
      socketService.socket.on('call_ended', handleCallEnded);
    } else {
      console.warn('⚠️ Socket not available when setting up video call listeners');
    }
    
    // Cleanup socket listeners on unmount
    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
      if (unsubscribeChatList) {
        unsubscribeChatList();
      }
      
      // Clean up video call listeners
      if (socketService.socket) {
        socketService.socket.off('incoming_call', handleIncomingCall);
        socketService.socket.off('call_accepted', handleCallAccepted);
        socketService.socket.off('call_rejected', handleCallRejected);
        socketService.socket.off('call_ended', handleCallEnded);
      }
    };
  }, [selectedChat, chats]); // Include chats in dependency for sender name lookup

  // Handle contract analysis from athlete contracts page
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const isContractAnalysis = urlParams.get('contract') === 'true';
    const shouldShowAI = urlParams.get('tab') === 'ai-assistant';
    
    if (isAthlete && isContractAnalysis && shouldShowAI) {
      // Switch to AI assistant tab
      setActiveTab('ai-assistant');
      
      // Check for pending contract analysis data
      const pendingAnalysis = localStorage.getItem('pendingContractAnalysis');
      if (pendingAnalysis) {
        try {
          const contractData = JSON.parse(pendingAnalysis);
          
          // Convert base64 back to file
          fetch(contractData.fileData)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], contractData.file.name, { type: contractData.file.type });
              
              // Upload the file to AI assistant
              handleContractAnalysis(file, contractData);
              
              // Clean up localStorage
              localStorage.removeItem('pendingContractAnalysis');
            })
            .catch(error => {
              console.error('Error processing contract file:', error);
              toast.error('Failed to process contract file');
            });
        } catch (error) {
          console.error('Error parsing contract analysis data:', error);
          toast.error('Failed to load contract analysis data');
        }
      }
      
      // Clean up URL parameters
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, isAthlete, navigate]);

  // Function to fetch chat list from API
  const fetchChatList = async () => {
    try {
      setLoadingChats(true);
      const chatData = await getChatList();

      // Determine athlete role from localStorage to avoid stale state during initial mount
      const userStr = localStorage.getItem('user');
      let isAthleteLocal = isAthlete;
      try {
        if (userStr) {
          const parsedUser = JSON.parse(userStr);
          isAthleteLocal = parsedUser?.role === 'athlete';
        }
      } catch (e) {
        console.warn('Failed to parse user from localStorage', e);
      }

      // Transform API data to match component structure
      const transformedChats = chatData.map((chat, index) => {
        let displayName = 'Unknown';
        let profileImage = '/user.png'; // Default fallback
        // debugger
        if (isAthleteLocal) {
          // For athletes, show brand profile data
          if (chat.user.brandProfile) {
            displayName = `${chat.user.brandProfile.firstName || ''} ${chat.user.brandProfile.lastName || ''}`.trim();
          }
          if (chat.user.brandProfile?.profilePictureUrl) {
            profileImage = chat.user.brandProfile.profilePictureUrl;
          }
        } else {
          // For brands, show athlete profile data
          if (chat.user.athleteProfile) {
            displayName = `${chat.user.athleteProfile.firstName || ''} ${chat.user.athleteProfile.lastName || ''}`.trim();
          }
          if (chat.user.athleteProfile?.profilePictureUrl) {
            profileImage = chat.user.athleteProfile.profilePictureUrl;
          }
        }
        
        return {
          userId: chat.user.id,
          avatar: profileImage,
          name: displayName,
          message: chat.lastMessage,
          time: chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '12:25',
          badge: chat.unreadCount
        };
      });
      
      setChats(transformedChats);
    } catch (error) {
      console.error('Failed to fetch chat list:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoadingChats(false);
    }
  };

  // Function to fetch chat history between users
  const fetchChatHistory = async (otherUserId) => {
    try {
      setLoadingMessages(true);
      const user = JSON.parse(localStorage.getItem('user'))
      const userId = user.id; // Assuming userId is stored in localStorage
     // Assuming userId is stored in localStorage
      
      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      const chatHistory = await getChatHistory(userId, otherUserId);
      
      // Sort messages by timestamp to ensure correct order (oldest first)
      const sortedHistory = chatHistory.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
        const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
        return timeA - timeB;
      });
      
      // Transform API data to match component structure
      const transformedMessages = sortedHistory.map((msg, index) => {
        const messageDate = msg.createdAt || msg.timestamp;
        return {
          id: msg.id || index,
          fromMe: msg.sender.id === userId,
          text: msg.content || msg.message,
          time: messageDate ? new Date(messageDate).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '12:00',
          createdAt: messageDate,
          type: msg.type || 'text',
          mediaUrl: msg.mediaUrl || null,
          fileName: msg.fileName || null,
          fileSize: msg.fileSize || null
        };
      });
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = async (chat) => {
    try {
      console.log('💬 Selecting chat:', chat);
      
      // Leave previous room if any
      if (selectedChat) {
        console.log('🚪 Leaving previous room:', selectedChat.userId);
        socketService.leaveRoom(selectedChat.userId);
      }
      
      setSelectedChat(chat);
      
      // Fetch chat history
      console.log('📚 Fetching chat history for:', chat.userId);
      await fetchChatHistory(chat.userId);
      
      // Join the new chat room
      console.log('🚪 Joining new room:', chat.userId);
      const joinSuccess = await socketService.joinRoom(chat.userId);
      
      if (!joinSuccess) {
        console.warn('⚠️ Failed to join chat room');
        toast.error('Failed to join chat room');
      } else {
        console.log('✅ Successfully joined chat room');
      }
      
      setSidebarOpen(false); // Close sidebar on mobile after selection
      
    } catch (error) {
      console.error('❌ Error selecting chat:', error);
      toast.error('Failed to open chat');
    }
  };

  // Send message function
  const sendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      // All users now have access to chat functionality regardless of subscription plan
      
      // Send message via socket
      const success = socketService.sendMessage(selectedChat.userId, newMessage);
      
      if (success) {
        // Add message to local state immediately for better UX
        const currentTime = new Date().toISOString();
        const message = {
          id: Date.now(),
          fromMe: true,
          text: newMessage,
          time: new Date(currentTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          createdAt: currentTime,
          type: 'text'
        };
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      } else {
        toast.error('Failed to send message. Please check your connection.');
      }
    } else if (!selectedChat) {
      toast.error('Please select a chat first.');
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedChat) {
      if (!selectedChat) {
        toast.error('Please select a chat first.');
      }
      event.target.value = '';
      return;
    }

    // Validate file
    if (!validateFile(file)) {
      event.target.value = '';
      return;
    }

    try {
      // Upload file and get media data
      const mediaData = await uploadFile(file);
      
      // Send media message via socket
      const success = socketService.sendMessage(
        selectedChat.userId, 
        file.name, // Use filename as content for media messages
        mediaData.type, 
        mediaData.mediaUrl
      );
      
      if (success) {
        // Add message to local state immediately for better UX
        const message = {
          id: Date.now(),
          fromMe: true,
          text: file.name,
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          type: mediaData.type,
          mediaUrl: mediaData.mediaUrl,
          fileName: mediaData.fileName,
          fileSize: mediaData.fileSize
        };
        setMessages(prev => [...prev, message]);
      } else {
        toast.error('Failed to send file. Please check your connection.');
      }
    } catch (error) {
      console.error('File upload failed:', error);
      // Error toast is already shown by uploadFile function
    }
    
    event.target.value = '';
  };

  // Fetch chat attachments for signing
  const fetchChatAttachments = async () => {
    if (!selectedChat) {
      toast.error('Please select a chat first');
      return;
    }
    setLoadingDocuments(true);
    try {
      const attachments = await getChatAttachments(selectedChat.userId);
      const signableDocuments = getSignableAttachments(attachments);
      setChatDocuments(signableDocuments);
      
      if (signableDocuments.length === 0) {
        toast.error('No documents or images found in this chat to sign');
        return;
      }
      
      setShowSignatureModal(true);
      setSignatureStep('select');
    } catch (error) {
      console.error('Error fetching chat attachments:', error);
      toast.error('Failed to load documents. Please try again.');
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Handle document signing
  const handleSignDocument = (document) => {
    setSelectedDocument(document);
    setShowSignatureModal(true);
    setShowDocuments(false);
    setSignatureStep('preview');
  };

  const getCanvasCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    if (e.touches && e.touches[0]) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(e, canvas);
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(e, canvas);
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    setSignature(signatureData);
    setSignatureStep('review');
  };

  const applySignatureToDocument = () => {
    setShowSignatureOnDocument(true);
    setSignatureStep('complete');
  };

  const resetSignatureModal = () => {
    setShowSignatureModal(false);
    setSelectedDocument(null);
    setSignatureStep('select');
    setSignature('');
    setShowSignatureOnDocument(false);
    if (canvasRef.current) {
      clearSignature();
    }
  };

  // Download signed document
  const downloadSignedDocument = async () => {
    if (!selectedDocument || !signature) {
      toast.error('No signed document available');
      return;
    }

    try {
      toast.loading('Preparing signed document for download...');
      
      // Sign the original document using the new service
      const { blob: signedBlob, fileName: signedFileName } = await documentSigningService.signDocument(
        selectedDocument,
        signature,
        {
          // Optional: customize signature position
          signatureWidth: 120,
          signatureHeight: 40
        }
      );
      
      // Create download link
      const downloadUrl = URL.createObjectURL(signedBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = signedFileName;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      URL.revokeObjectURL(downloadUrl);
      
      toast.dismiss();
      toast.success(`Signed document downloaded: ${signedFileName}`);
      
    } catch (error) {
      console.error('Error downloading signed document:', error);
      toast.dismiss();
      toast.error('Failed to download signed document: ' + error.message);
    }
  };

  // Send signed document to chat
  const sendSignedDocumentToChat = async () => {
    if (!selectedDocument || !signature || !selectedChat) {
      toast.error('Unable to send signed document');
      return;
    }

    try {
      toast.loading('Signing and uploading document...');
      
      // Sign the original document using the new service
      const { blob: signedBlob, fileName: signedFileName } = await documentSigningService.signDocument(
        selectedDocument,
        signature,
        {
          // Optional: customize signature position
          signatureWidth: 120,
          signatureHeight: 40
        }
      );
      
      // Determine the correct MIME type based on file extension
      const mimeType = signedFileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
      const signedFile = new File([signedBlob], signedFileName, { type: mimeType });
      
      // Upload the signed document
      const uploadedSignedDoc = await uploadFile(signedFile);
      
      // Create message content
      const messageContent = `📝 Signed Document: ${selectedDocument.name} (Digitally signed on ${new Date().toLocaleDateString()})`;
      
      // Send via socket using the signed document URL
      const success = socketService.sendMessage(
        selectedChat.userId,
        messageContent,
        'document',
        uploadedSignedDoc.mediaUrl
      );

      if (success) {
        // Add to local messages for immediate UI update
        const newMessage = {
          id: Date.now(),
          fromMe: true,
          text: messageContent,
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          type: 'document',
          mediaUrl: uploadedSignedDoc.mediaUrl,
          fileName: uploadedSignedDoc.fileName,
          fileSize: uploadedSignedDoc.fileSize
        };

        setMessages(prev => [...prev, newMessage]);
        toast.dismiss();
        toast.success('Signed document sent to chat!');
        resetSignatureModal();
      } else {
        toast.dismiss();
        toast.error('Failed to send signed document. Please check your connection.');
      }
    } catch (error) {
      console.error('Error sending signed document:', error);
      toast.dismiss();
      toast.error('Failed to sign or send document: ' + error.message);
    }
  };

  // Generate signed PDF as blob


  // Meeting modal functions
  const openMeetingModal = () => {
    if (!selectedChat) {
      toast.error('Please select a chat first');
      return;
    }
    
    const defaultTimes = getDefaultMeetingTimes();
    setMeetingData({
      invitedEmail: selectedChat.name, // Using chat name as email for now
      title: '',
      startTime: defaultTimes.startTime,
      endTime: defaultTimes.endTime
    });
    setShowMeetingModal(true);
    setShowDropdown(false);
  };

  const closeMeetingModal = () => {
    setShowMeetingModal(false);
    setMeetingData({
      invitedEmail: '',
      title: '',
      startTime: '',
      endTime: ''
    });
    setCreatingMeeting(false);
  };

  // Contract modal functions
  const openContractModal = () => {
    if (!selectedChat) {
      toast.error('Please select a chat first');
      return;
    }
    if (isAthlete) {
      toast.error('Athletes cannot create contracts');
      setShowDropdown(false);
      return;
    }
    
    // Reset contract data
    setContractData({
      title: '',
      amount: '',
      expiryDate: '',
      paymentResponsibility: 'brand',
      contractFile: null
    });
    setContractFileUrl('');
    setShowContractModal(true);
    setShowDropdown(false);
  };

  const closeContractModal = () => {
    setShowContractModal(false);
    setContractData({
      title: '',
      amount: '',
      expiryDate: '',
      signingValidUntil: '',
      paymentResponsibility: 'brand',
      contractFile: null
    });
    setContractFileUrl('');
    setIsCreatingContract(false);
  };

  const handleContractFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (PDF only for contracts)
    if (file.type !== 'application/pdf') {
      toast.error('Please upload only PDF files for contracts');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      toast.loading('Uploading contract file...', { id: 'contract-upload' });
      
      // Upload file using existing uploadService
      const uploadResult = await uploadFile(file);
      
      setContractData(prev => ({ ...prev, contractFile: file }));
      setContractFileUrl(uploadResult.mediaUrl);
      
      toast.success('Contract file uploaded successfully!', { id: 'contract-upload' });
    } catch (error) {
      console.error('Contract file upload failed:', error);
      toast.error('Failed to upload contract file', { id: 'contract-upload' });
    }

    e.target.value = '';
  };

  const createContract = async () => {
    if (!contractData.title || !contractData.amount || !contractData.expiryDate || !contractData.signingValidUntil || !contractFileUrl) {
      toast.error('Please fill in all required fields and upload a contract file');
      return;
    }

    // Validate that signingValidUntil is a future date
    const today = new Date();
    const signingValidDate = new Date(contractData.signingValidUntil);
    if (signingValidDate <= today) {
      toast.error('Offer valid till date must be in the future');
      return;
    }

    if (!selectedChat) {
      toast.error('Please select a chat first');
      return;
    }

    setIsCreatingContract(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/';
      const token = localStorage.getItem('access_token');

      const contractPayload = {
        athleteId: selectedChat.userId,
        title: contractData.title,
        amount: parseFloat(contractData.amount),
        expiryDate: contractData.expiryDate,
        signingValidUntil: contractData.signingValidUntil,
        paymentResponsibility: contractData.paymentResponsibility,
        contractFileUrl: contractFileUrl
      };

      console.log('Creating contract with payload:', contractPayload);

      const response = await fetch(`${baseUrl}contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contractPayload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Contract created successfully!');
        closeContractModal();
      } else {
        throw new Error(data.message || 'Failed to create contract');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Failed to create contract: ' + error.message);
    } finally {
      setIsCreatingContract(false);
    }
  };

  // Video call functions
  const startVideoCall = async () => {
    if (!selectedChat) {
      toast.error('Please select a chat first');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Check if socket is connected
      if (!socketService.socket?.connected) {
        toast.error('Not connected to server. Please refresh and try again.');
        return;
      }
      
      // Check if user data is valid
      if (!user.id) {
        toast.error('User authentication required. Please login again.');
        return;
      }
      
      console.log('🎥 Starting video call:', {
        caller: user,
        receiver: selectedChat,
        socketConnected: socketService.socket?.connected
      });
      
      // Show outgoing call UI
      setVideoCallData({
        callerName: selectedChat.name,
        callerId: selectedChat.userId,
        channelName: '' // Will be set when backend responds
      });
      setVideoCallType('outgoing');
      setShowVideoCall(true);
      
      // Emit start_call event to backend (exact specification)
      socketService.socket?.emit('start_call', { receiverId: selectedChat.userId }, ({ channelName, token }) => {
        console.log('📞 Backend response for start_call:', { channelName, token });
        console.log('hey Hamza is here - start_call response received', token);
        
        if (channelName && token) {
          // Update video call data with backend response
          setVideoCallData(prev => ({
            ...prev,
            channelName: channelName
          }));
          
          // Join Agora channel with token from backend
          console.log('hamza came here now', channelName);
          videoCallService.joinCall(channelName, token, user.id)
            .then(success => {
              if (success) {
                console.log('✅ Successfully joined Agora channel');
                toast.success('Calling...');
              } else {
                setShowVideoCall(false);
                toast.error('Failed to connect to call service');
              }
            })
            .catch(error => {
              console.error('❌ Failed to join Agora channel:', error);
              setShowVideoCall(false);
              toast.error('Failed to connect to call service');
            });
        } else {
          console.error('❌ Invalid response from backend - missing channelName or token');
          setShowVideoCall(false);
          toast.error('Failed to initiate call');
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to start video call:', error);
      setShowVideoCall(false);
      toast.error('Failed to start video call');
    }
  };

  const handleVideoCallAccept = () => {
    // Emit accept_call event to backend (exact specification)
    socketService.socket?.emit('accept_call', { channelName: videoCallData.channelName }, ({ token }) => {
      console.log('📞 Backend response for accept_call:', { token });
      
      if (token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // Join Agora channel with token from backend
        videoCallService.joinCall(videoCallData.channelName, token, user.id)
          .then(success => {
            if (success) {
              setVideoCallType('active');
              // Toast message will be shown by handleCallAccepted socket event
            } else {
              setShowVideoCall(false);
              toast.error('Failed to connect to call 4');
            }
          })
          .catch(error => {
            console.error('❌ Failed to join call after accepting:', error);
            setShowVideoCall(false);
            toast.error('Failed to connect to call 5');
          });
      } else {
        console.error('❌ Invalid response from backend - missing token');
        setShowVideoCall(false);
        toast.error('Failed to accept call');
      }
    });
  };

  const handleVideoCallReject = () => {
    setShowVideoCall(false);
    // Emit reject_call event to backend
    socketService.socket?.emit('reject_call', { from: videoCallData.callerId });
    toast.success('Call rejected');
  };

  const handleVideoCallEnd = () => {
    // Emit end_call event to backend
    if (videoCallData.channelName) {
      socketService.socket?.emit('end_call', { channelName: videoCallData.channelName });
    }
    
    // Leave Agora call
    videoCallService.leaveCall();
    
    // Reset UI state
    setShowVideoCall(false);
    setVideoCallType('outgoing');
    setVideoCallData({
      callerName: '',
      callerId: '',
      channelName: ''
    });
    
    toast.success('Call ended');
  };

  const handleMeetingInputChange = (field, value) => {
    setMeetingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateMeeting = async () => {
    // Validate meeting data
    const errors = validateMeetingData(meetingData);
    if (errors.length > 0) {
      toast.error(errors[0]); // Show first error
      return;
    }

    setCreatingMeeting(true);
    try {
      // Format the data for API
      const apiData = {
        invitedEmail: meetingData.invitedEmail,
        title: meetingData.title,
        startTime: new Date(meetingData.startTime).toISOString(),
        endTime: new Date(meetingData.endTime).toISOString()
      };

      const result = await createMeeting(apiData);
      
      // Send meeting info to chat
      const meetingMessage = `📅 Meeting Scheduled: "${meetingData.title}" on ${new Date(meetingData.startTime).toLocaleDateString()} at ${new Date(meetingData.startTime).toLocaleTimeString()}`;
      
      const success = socketService.sendMessage(
        selectedChat.userId,
        meetingMessage,
        'meeting',
        null
      );

      if (success) {
        // Add to local messages for immediate UI update
        const currentTime = new Date().toISOString();
        const newMessage = {
          id: Date.now(),
          fromMe: true,
          text: meetingMessage,
          time: new Date(currentTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          createdAt: currentTime,
          type: 'meeting'
        };

        setMessages(prev => [...prev, newMessage]);
        toast.success('Meeting scheduled and sent to chat!');
        closeMeetingModal();
      } else {
        toast.error('Meeting created but failed to send to chat');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create meeting');
    } finally {
      setCreatingMeeting(false);
    }
  };

  const handleSignaturePositioning = (e) => {
    if (documentRef.current && signature) {
      const rect = documentRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setSignaturePosition({ x, y });
    }
  };

  // Handle key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle back button navigation
  const handleBackToDashboard = () => {
    if (isAthlete) {
      navigate('/dashboard');
    } else {
      navigate('/brand/dashboard');
    }
  };

  // Handle back to chats from AI assistant
  const handleBackToChats = () => {
    setActiveTab('chats');
  };

  // AI Assistant functions
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload only PDF files');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploadingPdf(true);
    
    // Add system message about upload start
    const uploadMessage = {
      id: Date.now(),
      fromMe: false,
      text: `📄 Uploaded: ${file.name}\nAnalyzing contract...`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    setAiMessages(prev => [...prev, uploadMessage]);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';
      const response = await fetch(`${baseUrl}gpt/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.summary) {
        // Add document to uploaded list
        const newDocument = {
          id: Date.now(),
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toLocaleTimeString()
        };
        setUploadedDocuments(prev => [...prev, newDocument]);
        
        // Add AI analysis response
        const analysisMessage = {
          id: Date.now() + 1,
          fromMe: false,
          text: `📊 Contract Analysis:\n${data.summary}`,
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        };
        setAiMessages(prev => [...prev, analysisMessage]);
        
        toast.success('PDF analyzed successfully!');
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('PDF upload/analysis failed:', error);
      const errorMessage = {
        id: Date.now() + 2,
        fromMe: false,
        text: `❌ Error analyzing PDF: ${error.message}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      setAiMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to analyze PDF');
    } finally {
      setIsUploadingPdf(false);
    }

    e.target.value = '';
  };

  // Handle contract analysis from athlete contracts page
  const handleContractAnalysis = async (file, contractData) => {
    if (!file) return;

    setIsUploadingPdf(true);
    
    // Add system message about contract upload
    const uploadMessage = {
      id: Date.now(),
      fromMe: false,
      text: `📄 Contract Analysis Started\nContract: ${contractData.title}\nAmount: $${contractData.amount}\nFile: ${file.name}\n\nAnalyzing contract details...`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    setAiMessages(prev => [...prev, uploadMessage]);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';
      const response = await fetch(`${baseUrl}gpt/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.summary) {
        // Add document to uploaded list
        const newDocument = {
          id: Date.now(),
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toLocaleTimeString(),
          contractData: contractData
        };
        setUploadedDocuments(prev => [...prev, newDocument]);
        
        // Add AI analysis response with contract context
        const analysisMessage = {
          id: Date.now() + 1,
          fromMe: false,
          text: `📊 Contract Analysis Complete:\n\n**Contract Details:**\n• Title: ${contractData.title}\n• Amount: $${contractData.amount}\n• Expiry: ${contractData.expiryDate}\n• Payment: ${contractData.paymentResponsibility}\n\n**AI Analysis:**\n${data.summary}\n\n💡 You can now ask me specific questions about this contract!`,
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        };
        setAiMessages(prev => [...prev, analysisMessage]);
        
        toast.success('Contract analyzed successfully!');
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Contract analysis failed:', error);
      const errorMessage = {
        id: Date.now() + 2,
        fromMe: false,
        text: `❌ Error analyzing contract: ${error.message}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      setAiMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to analyze contract');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const sendAiMessage = () => {
    console.log('🤖 sendAiMessage called');
    
    if (!aiNewMessage.trim() || !socketService.socket) {
      console.log('🤖 Message empty or socket not available');
      return;
    }

    if (aiConnectionStatus !== 'connected') {
      console.log('🤖 AI not connected, status:', aiConnectionStatus);
      toast.error('AI Assistant is not connected. Please try again.');
      return;
    }

    if (isAiStreaming) {
      console.log('🤖 AI is already streaming, ignoring request');
      return;
    }

    const userMessage = {
      id: Date.now(),
      fromMe: true,
      text: aiNewMessage,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };

    console.log('🤖 Adding user message to chat:', userMessage);
    setAiMessages(prev => [...prev, userMessage]);
    
    const messageToSend = aiNewMessage;
    setAiNewMessage('');

    // Send message to AI via socket
    try {
      console.log('🤖 Emitting gpt_stream event with prompt:', messageToSend);
      console.log('🤖 Socket connected:', socketService.socket.connected);
      socketService.socket.emit('gpt_stream', { prompt: messageToSend });
      console.log('🤖 Message sent successfully');
    } catch (error) {
      console.error('🤖 Error sending AI message:', error);
      toast.error('Failed to send message to AI Assistant');
    }
  };

  const handleAiKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAiMessage();
    }
  };

  const removeDocument = (docId) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast.success('Document removed');
  };

  // Auto-scroll for AI messages
  useEffect(() => {
    if (aiMessagesEndRef.current) {
      aiMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages]);

  // Handle emoji selection
  const handleEmojiSelect = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Handle GPT toggle - COMMENTED OUT FOR ATHLETES
  // const handleGptToggle = () => {
  //   const newGptState = !gptEnabled;
  //   setGptEnabled(newGptState);
  //   
  //   // Emit socket event to toggle GPT
  //   if (socketService.socket?.connected) {
  //     socketService.socket.emit('toggle_gpt', { enabled: newGptState }, (resp) => {
  //       console.log('GPT toggled:', resp);
  //       if (resp && resp.gptEnabled) {
  //         toast.success(`GPT auto-replies ${newGptState ? 'enabled' : 'disabled'}`);
  //       } else {
  //         // Revert state if failed
  //         setGptEnabled(!newGptState);
  //         toast.error('Failed to toggle GPT. Please try again.');
  //       }
  //     });
  //   } else {
  //     toast.error('Not connected to chat server');
  //     setGptEnabled(!newGptState); // Revert state
  //   }
  // };

  return (
    <>
    {/* Global Tabs for Athletes */}
    <div className='max-w-sm mx-auto'>
      {isAthlete && (
        <div className="bg-gradient-to-r from-[#232626] to-[#1a1f1a] px-4 md:px-6 py-3 border-b border-[#9afa00]/20 rounded-2xl">
          <div className="flex gap-1 bg-[#1a1f1a] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'chats'
                  ? 'bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a3622]'
              }`}
            >
              My Chats
            </button>
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'ai-assistant'
                  ? 'bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a3622]'
              }`}
            >
              <FaRobot className="text-sm" />
              AI Assistant
            </button>
          </div>
        </div>
      )}
    </div>
    <div className="w-full h-full flex flex-col gap-8 bg-transparent px-0 md:px-6 py-6 overflow-hidden">
      <div className={`w-full max-w-7xl h-[80vh] bg-[rgba(0,0,0,0.3)] rounded-2xl ${isAthlete && activeTab === 'ai-assistant' ? 'flex flex-col' : 'flex flex-col md:flex-row'} overflow-hidden shadow-lg min-w-0 mx-auto gap-0`}>
        {/* Sidebar (mobile overlay, md+ side) - Hidden when AI Assistant is active */}
        {(!isAthlete || activeTab !== 'ai-assistant') && (
          <div
            className={`fixed inset-0 z-40 bg-black bg-opacity-70 transition-opacity md:static md:bg-transparent md:z-0 ${sidebarOpen ? 'flex' : 'hidden'} md:flex`}
          >
          <div className="w-4/5 max-w-xs xl:max-w-sm min-w-[280px] bg-gradient-to-b from-[#1a2f14] to-[#0f1a0c] flex flex-col p-4 md:p-6 gap-4 h-full rounded-l-2xl md:rounded-l-2xl md:rounded-r-none rounded-r-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleBackToDashboard}
                  className="text-white hover:text-[#9afa00] transition-all duration-200 p-2 rounded-full hover:bg-[#9afa00]/10 group flex items-center gap-2"
                  title="Back to Dashboard"
                >
                  <FaArrowLeft className="text-lg group-hover:scale-110 transition-transform" />
                </button>
                <h2 className="text-[#9afa00] text-lg md:text-xl font-bold">MY CHATS</h2>
              </div>
              <button className="md:hidden text-white text-2xl" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
            </div>
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full rounded-lg bg-[#2a3622] text-white pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 placeholder-gray-400 text-sm border border-[#9afa00]/20 transition-all"
              />
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {loadingChats ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-400 text-sm">Loading chats...</div>
                </div>
              ) : chats.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-400 text-sm text-center">
                    <div>No chats yet</div>
                    <div className="text-xs mt-1">Start a conversation to see it here</div>
                  </div>
                </div>
              ) : (
                chats.map((chat, idx) => (
                  <div 
                    key={chat.userId || idx} 
                    onClick={() => handleChatSelect(chat)}
                    className={`flex items-center justify-between py-3 px-3 rounded-xl mb-2 hover:bg-gradient-to-r hover:from-[#9afa00]/10 hover:to-[#9afa00]/5 cursor-pointer transition-all duration-200 border border-transparent hover:border-[#9afa00]/30 group mx-1 ${
                      selectedChat?.userId === chat.userId ? 'bg-gradient-to-r from-[#9afa00]/20 to-[#9afa00]/10 border-[#9afa00]/50' : ''
                    }`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative flex-shrink-0">
                        <img src={chat.avatar} alt={chat.name} className="p-1 w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 border-[#9afa00]/20 group-hover:border-[#9afa00]/50 transition-all" />
                        {/* <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#9afa00] rounded-full border-2 border-[#1a2f14]"></div> */}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold text-sm leading-tight truncate">{chat.name}</div>
                        <div className="text-gray-400 text-xs leading-tight truncate mt-1">{chat.message}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                      <span className="text-gray-400 text-xs font-medium">{chat.time}</span>
                      {chat.badge > 0 && (
                        <span className="bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-bold rounded-full px-2 py-0.5 text-xs shadow-lg min-w-[20px] text-center">{chat.badge}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Overlay click to close */}
          <div className="flex-1 md:hidden" onClick={() => setSidebarOpen(false)} />
        </div>
        )}
        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-transparent min-w-0 h-full overflow-hidden ${isAthlete && activeTab === 'ai-assistant' ? 'w-full' : ''}`}>          
          {/* Chat Header */}
          {(!isAthlete || activeTab === 'chats') && (
            <div className="bg-gradient-to-r from-[#232626] to-[#1a1f1a] px-4 md:px-6 py-4 md:py-5 sticky top-0 z-10 border-b border-[#9afa00]/20 shadow-lg ${isAthlete ? '' : 'rounded-tr-2xl'}">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <button className="md:hidden text-white text-2xl hover:text-[#9afa00] transition-colors" onClick={() => setSidebarOpen(true)}><FaBars /></button>
                  {selectedChat ? (
                    <>
                      <div className="relative">
                        <img src={selectedChat.avatar} alt={selectedChat.name} className=" p-1 w-11 h-11 md:w-12 md:h-12 rounded-full object-cover border-2 border-[#9afa00]/30" />
                        {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#9afa00] rounded-full border-2 border-[#232626] animate-pulse"></div> */}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-bold text-base md:text-lg truncate">{selectedChat.name}</div>
                        {/* <div className="text-[#9afa00] text-xs md:text-sm font-medium">Online now</div> */}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-sm">Select a chat to start messaging</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* GPT Toggle Button (only for athletes) - COMMENTED OUT */}
                  {/* {isAthlete && (
                    <button 
                      onClick={handleGptToggle}
                      className={`p-3 rounded-full transition-all duration-200 border ${
                        gptEnabled 
                          ? 'bg-gradient-to-r from-[#9afa00]/20 to-[#7dd800]/20 border-[#9afa00] text-[#9afa00]' 
                          : 'bg-gradient-to-r from-[#2a3622] to-[#1f2b1a] border-[#9afa00]/20 text-gray-400 hover:text-[#9afa00]'
                      }`}
                      title={`GPT Auto-replies ${gptEnabled ? 'Enabled' : 'Disabled'}`}
                    >
                      <FaRobot className="text-lg" />
                    </button>
                  )} */}
                  {selectedChat && (
                    <button 
                      onClick={startVideoCall}
                      className="bg-gradient-to-r from-[#2a3622] to-[#1f2b1a] p-3 rounded-full hover:from-[#9afa00]/20 hover:to-[#9afa00]/10 transition-all duration-200 border border-[#9afa00]/20"
                      title="Start Video Call"
                    >
                      <FaVideo className="text-[#9afa00] text-lg" />
                    </button>
                  )}
                  {/* Removed search and three dots menu for cleaner chat interface */}
                </div>
              </div>
            </div>
          )}
          {/* Chat Body */}
          {isAthlete && activeTab === 'ai-assistant' ? (
             <div className="flex-1 flex flex-col bg-gradient-to-b from-transparent to-[#0a0f08]/30 min-w-0 h-0">
              {/* AI Assistant Header */}
              <div className="bg-gradient-to-r from-[#232626] to-[#1a1f1a] px-4 md:px-6 py-4 border-b border-[#9afa00]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleBackToChats}
                      className="text-white hover:text-[#9afa00] transition-all duration-200 p-2 rounded-full hover:bg-[#9afa00]/10 group flex items-center gap-2"
                      title="Back to Chats"
                    >
                      <FaArrowLeft className="text-lg group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline text-sm font-medium">Chats</span>
                    </button>
                    <button className="md:hidden text-white text-2xl hover:text-[#9afa00] transition-colors" onClick={() => setSidebarOpen(true)}><FaBars /></button>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#9afa00] to-[#7dd800] rounded-full flex items-center justify-center">
                        <FaRobot className="text-black text-lg" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg">AI Assistant</div>
                        <div className={`text-sm flex items-center gap-2 ${
                          aiConnectionStatus === 'connected' ? 'text-[#9afa00]' : 'text-yellow-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            aiConnectionStatus === 'connected' ? 'bg-[#9afa00]' : 'bg-yellow-400'
                          } ${isAiStreaming ? 'animate-pulse' : ''}`} />
                          {isAiStreaming ? 'Thinking...' : 
                           aiConnectionStatus === 'connected' ? 'Ready to help' : 'Connecting...'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Removed search and three dots menu for cleaner AI assistant interface */}
                </div>
              </div>
              
              {/* Uploaded Documents */}
              {uploadedDocuments.length > 0 && (
                <div className="px-4 md:px-6 py-3 border-b border-[#9afa00]/20">
                  <div className="text-white text-sm font-medium mb-2">Uploaded Documents:</div>
                  <div className="flex flex-wrap gap-2">
                    {uploadedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 bg-[#232626] px-3 py-2 rounded-lg border border-[#9afa00]/20">
                        <FaFilePdf className="text-[#9afa00] text-sm" />
                        <span className="text-white text-xs truncate max-w-[120px]">{doc.name}</span>
                        <button 
                          onClick={() => removeDocument(doc.id)}
                          className="text-gray-400 hover:text-red-400 text-xs ml-1"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* AI Messages */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 flex flex-col gap-3">
                {aiMessages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-4">🤖</div>
                      <div className="text-lg mb-2">AI Assistant</div>
                      <div className="text-sm">Upload a PDF document and start chatting!</div>
                      <div className="text-xs mt-1 opacity-70">I can help you analyze and understand your documents</div>
                    </div>
                  </div>
                ) : (
                  aiMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'} mb-1`}
                    >
                      <div
                        className={`rounded-2xl px-3 md:px-4 py-2 md:py-3 max-w-[70%] md:max-w-[60%] text-sm md:text-base shadow-lg ${
                          msg.fromMe 
                            ? 'bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-medium' 
                            : msg.isSystem
                            ? 'bg-gradient-to-r from-[#2a3622] to-[#1f2b1a] text-white border border-[#9afa00]/30'
                            : 'bg-gradient-to-r from-[#232626] to-[#1a1f1a] text-white border border-[#9afa00]/20'
                        } transition-all hover:shadow-xl break-words`}
                      >
                        <div className="flex items-end gap-2">
                          <div className="flex-1 leading-relaxed">
                            <div className="whitespace-pre-wrap">
                              {msg.text.split('\n').map((line, index) => (
                                <div key={index} className={index > 0 ? 'mt-2' : ''}>
                                  {line.split(/\*\*(.*?)\*\*/).map((part, partIndex) => 
                                    partIndex % 2 === 1 ? (
                                      <strong key={partIndex} className="font-bold">{part}</strong>
                                    ) : (
                                      part
                                    )
                                  )}
                                </div>
                              ))}
                            </div>
                            {msg.isStreaming && (
                              <div className="inline-flex items-center ml-2 gap-1">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-[#9afa00] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                  <div className="w-2 h-2 bg-[#9afa00] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                  <div className="w-2 h-2 bg-[#9afa00] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-medium ${msg.fromMe ? 'text-black/70' : 'text-gray-400'} whitespace-nowrap flex-shrink-0`}>{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={aiMessagesEndRef} />
              </div>
              
              {/* AI Input Area */}
              <div className="px-4 md:px-6 py-4 border-t border-[#9afa00]/20 bg-gradient-to-r from-[#232626]/50 to-[#1a1f1a]/50">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={aiNewMessage}
                      onChange={(e) => setAiNewMessage(e.target.value)}
                      onKeyPress={handleAiKeyPress}
                      placeholder="Ask me anything about your documents..."
                      className="w-full bg-[#2a3622] text-white rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 placeholder-gray-400 text-sm border border-[#9afa00]/20 resize-none min-h-[44px] max-h-32"
                      rows={1}
                    />
                    <input
                      type="file"
                      ref={pdfInputRef}
                      onChange={handlePdfUpload}
                      accept=".pdf"
                      className="hidden"
                    />
                    <button
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isUploadingPdf}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-[#9afa00] hover:text-[#7dd800] transition-colors disabled:opacity-50"
                      title="Upload PDF"
                    >
                      {isUploadingPdf ? (
                        <div className="animate-spin w-4 h-4 border-2 border-[#9afa00] border-t-transparent rounded-full" />
                      ) : (
                        <FaFilePdf className="text-lg" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={sendAiMessage}
                    disabled={!aiNewMessage.trim() || isAiStreaming || aiConnectionStatus !== 'connected'}
                    className="bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black p-3 rounded-full hover:from-[#7dd800] hover:to-[#6bc700] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAiStreaming ? (
                      <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                    ) : (
                      <FaPaperPlane className="text-lg" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
             <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 flex flex-col gap-1 bg-gradient-to-b from-transparent to-[#0a0f08]/30 min-w-0 h-0">
              {(!isAthlete && !selectedChat) || (isAthlete && activeTab === 'chats' && !selectedChat) ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-lg mb-2">💬</div>
                    <div className="text-sm">Select a chat to start messaging</div>
                  </div>
                </div>
              ) : loadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-gray-400 text-sm">Loading messages...</div>
                </div>
              ) : (
                <>                  {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-lg mb-2">📝</div>
                        <div className="text-sm">No messages yet</div>
                        <div className="text-xs mt-1">Start the conversation!</div>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      // Group messages by date
                      const groupedMessages = [];
                      let currentDate = null;
                      
                      messages.forEach((msg, index) => {
                        const msgDate = msg.createdAt ? new Date(msg.createdAt).toDateString() : new Date().toDateString();
                        
                        if (msgDate !== currentDate) {
                          currentDate = msgDate;
                          const dateObj = new Date(msgDate);
                          const today = new Date().toDateString();
                          const yesterday = new Date(Date.now() - 86400000).toDateString();
                          
                          let displayDate;
                          if (msgDate === today) {
                            displayDate = 'Today';
                          } else if (msgDate === yesterday) {
                            displayDate = 'Yesterday';
                          } else {
                            displayDate = dateObj.toLocaleDateString('en-US', { 
                              day: 'numeric', 
                              month: 'long' 
                            });
                          }
                          
                          groupedMessages.push(
                            <div key={`date-${msgDate}`} className="text-center mb-4">
                              <span className="bg-[#232626] text-gray-300 text-xs px-4 py-2 rounded-full border border-[#9afa00]/20">
                                {displayDate}
                              </span>
                            </div>
                          );
                        }
                        
                        groupedMessages.push(
                           <div
                             key={msg.id}
                             className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'} mb-1`}
                           >
                             <div
                               className={`rounded-2xl px-3 md:px-4 py-2 md:py-3 max-w-[70%] md:max-w-[60%] text-sm md:text-base shadow-lg ${
                                 msg.fromMe 
                                   ? 'bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-medium' 
                                   : 'bg-gradient-to-r from-[#232626] to-[#1a1f1a] text-white border border-[#9afa00]/20'
                               } transition-all hover:shadow-xl break-words`}
                             >
                     {msg.type === 'text' && (
                       <div className="flex items-end gap-2">
                         <span className="flex-1 leading-relaxed">{msg.text}</span>
                         <span className={`text-xs font-medium ${msg.fromMe ? 'text-black/70' : 'text-gray-400'} whitespace-nowrap flex-shrink-0`}>{msg.time}</span>
                       </div>
                     )}
                     {msg.type === 'document' && (
                       <div className="flex items-center gap-3">
                         <FaFilePdf className={`text-xl ${msg.fromMe ? 'text-red-600' : 'text-red-400'}`} />
                         <div className="flex-1">
                           <div className={`font-semibold ${msg.fromMe ? 'text-black' : 'text-white'}`}>
                             {msg.mediaUrl ? extractFilenameFromUrl(msg.mediaUrl) : (msg.fileName || 'Document')}
                           </div>
                           <div className={`text-xs ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`}>{msg.fileSize}</div>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                           <button 
                             onClick={() => msg.mediaUrl && window.open(msg.mediaUrl, '_blank')}
                             className={`p-1 rounded ${msg.fromMe ? 'hover:bg-black/10' : 'hover:bg-white/10'} transition-colors`}
                           >
                             <FaDownload className={`text-sm ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`} />
                           </button>
                           <span className={`text-xs font-medium ${msg.fromMe ? 'text-black/70' : 'text-gray-400'} whitespace-nowrap`}>{msg.time}</span>
                         </div>
                       </div>
                     )}
                     {msg.type === 'image' && (
                       <div className="space-y-2">
                         {msg.mediaUrl ? (
                           <img 
                             src={msg.mediaUrl} 
                             alt={msg.fileName} 
                             className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                             onClick={() => window.open(msg.mediaUrl, '_blank')}
                           />
                         ) : (
                           <div className="flex items-center gap-3">
                             <FaImage className={`text-xl ${msg.fromMe ? 'text-blue-600' : 'text-blue-400'}`} />
                             <div className="flex-1">
                               <div className={`font-semibold ${msg.fromMe ? 'text-black' : 'text-white'}`}>
                                 {msg.mediaUrl ? extractFilenameFromUrl(msg.mediaUrl) : (msg.fileName || 'Image')}
                               </div>
                               <div className={`text-xs ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`}>{msg.fileSize}</div>
                             </div>
                           </div>
                         )}
                         <div className="flex items-center justify-between">
                           <span className={`text-xs ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`}>
                             {msg.mediaUrl ? extractFilenameFromUrl(msg.mediaUrl) : (msg.fileName || 'Image')}
                           </span>
                           <span className={`text-xs font-medium ${msg.fromMe ? 'text-black/70' : 'text-gray-400'} whitespace-nowrap`}>{msg.time}</span>
                         </div>
                       </div>
                     )}
                     {msg.type === 'video' && (
                       <div className="space-y-2">
                         {msg.mediaUrl ? (
                           <video 
                             src={msg.mediaUrl} 
                             controls 
                             className="max-w-full h-auto rounded-lg"
                             preload="metadata"
                           >
                             Your browser does not support the video tag.
                           </video>
                         ) : (
                           <div className="flex items-center gap-3">
                             <FaPlay className={`text-xl ${msg.fromMe ? 'text-green-600' : 'text-green-400'}`} />
                             <div className="flex-1">
                               <div className={`font-semibold ${msg.fromMe ? 'text-black' : 'text-white'}`}>
                                 {msg.mediaUrl ? extractFilenameFromUrl(msg.mediaUrl) : (msg.fileName || 'Video')}
                               </div>
                               <div className={`text-xs ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`}>{msg.fileSize}</div>
                             </div>
                           </div>
                         )}
                         <div className="flex items-center justify-between">
                           <span className={`text-xs ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`}>
                             {msg.mediaUrl ? extractFilenameFromUrl(msg.mediaUrl) : (msg.fileName || 'Video')}
                           </span>
                           <span className={`text-xs font-medium ${msg.fromMe ? 'text-black/70' : 'text-gray-400'} whitespace-nowrap`}>{msg.time}</span>
                         </div>
                       </div>
                     )}
                           </div>
                         </div>
                         );
                       });
                       
                       return groupedMessages;
                     })()
                   )}
                 </>
               )}
               <div ref={messagesEndRef} />
             </div>
           )}
          {/* Chat Input */}
          {selectedChat && (!isAthlete || activeTab === 'chats') && (
           <div className="px-4 md:px-6 py-4 md:py-5 bg-gradient-to-r from-[#232626] to-[#1a1f1a] border-t border-[#9afa00]/20 flex items-center gap-3 relative flex-shrink-0 rounded-br-2xl">
            <div className="relative" ref={dropdownRef}>
               <button 
                 onClick={() => setShowDropdown(!showDropdown)}
                 className="bg-gradient-to-r from-[#2a3622] to-[#1f2b1a] p-3 rounded-full hover:from-[#9afa00]/20 hover:to-[#9afa00]/10 transition-all duration-200 border border-[#9afa00]/20"
               >
                 <FaEllipsisV className="text-[#9afa00] text-lg" />
               </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute bottom-full left-0 mb-2 bg-gradient-to-b from-[#232626] to-[#1a1f1a] rounded-xl shadow-2xl border border-[#9afa00]/30 py-2 min-w-[200px] z-50">
                  
                  <button 
                    onClick={openMeetingModal}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#9afa00]/10 transition-all text-left"
                  >
                    <FaCalendarAlt className="text-[#9afa00]" />
                    <span>Schedule a meeting</span>
                  </button>
                  {!isAthlete && (
                  <button 
                    onClick={openContractModal}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#9afa00]/10 transition-all text-left"
                  >
                    <FaFileContract className="text-[#9afa00]" />
                    <span>Create a contract</span>
                  </button>
                  )}
                  <button 
                    onClick={() => {setShowDropdown(false); fileInputRef.current?.click();}}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#9afa00]/10 transition-all text-left"
                  >
                    <FaPaperclip className="text-[#9afa00]" />
                    <span>Attachments</span>
                  </button>
                </div>
              )}
            </div>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent border border-[#9afa00]/30 rounded-xl px-4 md:px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 focus:border-[#9afa00] text-sm md:text-base transition-all"
            />
            
            {/* Emoji Picker Button */}
            <div className="relative" ref={emojiPickerRef}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="bg-gradient-to-r from-[#2a3622] to-[#1f2b1a] p-3 rounded-full hover:from-[#9afa00]/20 hover:to-[#9afa00]/10 transition-all duration-200 border border-[#9afa00]/20"
              >
                <FaSmile className="text-[#9afa00] text-lg" />
              </button>
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
                  <EmojiPicker
                    onEmojiClick={handleEmojiSelect}
                    theme="dark"
                    width={300}
                    height={400}
                    searchDisabled={false}
                    skinTonesDisabled={false}
                    previewConfig={{
                      showPreview: false
                    }}
                  />
                </div>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileUpload}
            />
            
            <button 
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-[#9afa00] to-[#7dd800] p-3 rounded-full flex items-center justify-center hover:from-[#7dd800] hover:to-[#6bc700] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane className="text-black text-lg" />
            </button>
          </div>
           )}
        </div>
      </div>
      
      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#232626] to-[#1a1f1a] rounded-2xl border border-[#9afa00]/30 w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#9afa00]/20">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white">Document Signature</h2>
                <div className="flex items-center gap-2">
                   <div className={`w-3 h-3 rounded-full ${
                     signatureStep === 'preview' ? 'bg-[#9afa00]' : 
                     ['sign', 'review', 'complete'].includes(signatureStep) ? 'bg-[#9afa00]' : 'bg-gray-600'
                   }`}></div>
                   <div className="w-6 h-0.5 bg-gray-600"></div>
                   <div className={`w-3 h-3 rounded-full ${
                     signatureStep === 'sign' ? 'bg-[#9afa00]' : 
                     ['review', 'complete'].includes(signatureStep) ? 'bg-[#9afa00]' : 'bg-gray-600'
                   }`}></div>
                   <div className="w-6 h-0.5 bg-gray-600"></div>
                   <div className={`w-3 h-3 rounded-full ${
                     signatureStep === 'review' ? 'bg-[#9afa00]' : 
                     signatureStep === 'complete' ? 'bg-[#9afa00]' : 'bg-gray-600'
                   }`}></div>
                   <div className="w-6 h-0.5 bg-gray-600"></div>
                   <div className={`w-3 h-3 rounded-full ${
                     signatureStep === 'complete' ? 'bg-[#9afa00]' : 'bg-gray-600'
                   }`}></div>
                 </div>
              </div>
              <button 
                onClick={resetSignatureModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Step 1: Document Selection */}
              {signatureStep === 'select' && (
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-semibold mb-4">Select a document or image to sign:</h3>
                  {loadingDocuments ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9afa00] mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading documents...</p>
                    </div>
                  ) : chatDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <FaFileAlt className="text-gray-400 text-4xl mx-auto mb-4" />
                      <p className="text-gray-400">No documents or images found in this chat</p>
                      <p className="text-gray-500 text-sm mt-2">Upload some files to the chat first</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chatDocuments.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => handleSignDocument(doc)}
                          className="w-full flex items-center gap-4 p-4 bg-[#2a3622]/20 hover:bg-[#2a3622]/40 rounded-xl border border-[#9afa00]/20 transition-all text-left"
                        >
                          {doc.type === 'image' ? (
                            <FaImage className="text-blue-400 text-xl" />
                          ) : (
                            <FaFilePdf className="text-red-400 text-xl" />
                          )}
                          <div className="flex-1">
                            <div className="text-white font-semibold">{doc.name}</div>
                            <div className="text-gray-400 text-sm">
                              {doc.size} • {doc.type === 'image' ? 'Image' : 'Document'}
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {doc.needsSignature && (
                            <div className="bg-[#9afa00]/20 text-[#9afa00] text-xs px-2 py-1 rounded-full">
                              Can be signed
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Document Preview */}
              {signatureStep === 'preview' && selectedDocument && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-[#2a3622]/30 rounded-xl border border-[#9afa00]/20">
                    {selectedDocument.type === 'image' ? (
                      <FaImage className="text-blue-400 text-2xl" />
                    ) : (
                      <FaFilePdf className="text-red-400 text-2xl" />
                    )}
                    <div>
                      <div className="text-white font-semibold">{selectedDocument.name}</div>
                      <div className="text-gray-400 text-sm">{selectedDocument.size}</div>
                    </div>
                  </div>
                  
                  <div className="bg-[#2a3622]/20 rounded-xl p-6 border border-[#9afa00]/20 min-h-[500px]">
                     <div className="text-center mb-6">
                       <h3 className="text-white text-xl font-semibold mb-2">
                         {selectedDocument.type === 'image' ? 'Image Preview' : 'Document Preview'}
                       </h3>
                       <p className="text-gray-400">Review the {selectedDocument.type === 'image' ? 'image' : 'document'} before signing</p>
                     </div>
                     
                     {/* Actual Document/Image Content */}
                     <div ref={documentRef} className="bg-white rounded-lg p-8 text-black min-h-[400px] shadow-lg relative">
                       {selectedDocument.type === 'image' ? (
                         <div className="text-center">
                           <img 
                             src={selectedDocument.url} 
                             alt={selectedDocument.name}
                             className="max-w-full max-h-[400px] object-contain mx-auto rounded-lg shadow-md"
                             onError={(e) => {
                               e.target.style.display = 'none';
                               e.target.nextSibling.style.display = 'block';
                             }}
                           />
                           <div className="hidden text-center py-8">
                             <FaImage className="text-gray-400 text-4xl mx-auto mb-4" />
                             <p className="text-gray-600">Unable to load image</p>
                           </div>
                           
                           {/* Signature area for images */}
                           <div className="mt-8 pt-4 border-t border-gray-300">
                             <div className="flex justify-between items-center">
                               <div className="relative">
                                 <p className="font-semibold">Signature:</p>
                                 <div className="w-64 h-16 border-b-2 border-gray-400 mt-2 flex items-end relative">
                                   {showSignatureOnDocument && signature ? (
                                     <img 
                                       src={signature} 
                                       alt="Signature" 
                                       className="absolute bottom-0 left-0 h-12 w-auto max-w-full object-contain"
                                     />
                                   ) : (
                                     <span className="text-red-500 font-semibold">⚠ SIGNATURE REQUIRED</span>
                                   )}
                                 </div>
                               </div>
                               <div className="text-right">
                                 <p className="font-semibold">Date:</p>
                                 <p className="mt-2">{new Date().toLocaleDateString()}</p>
                               </div>
                             </div>
                           </div>
                         </div>
                       ) : (
                         <div>
                           <div className="text-center mb-6">
                             <h2 className="text-2xl font-bold mb-2">DOCUMENT SIGNATURE</h2>
                             <p className="text-gray-600">File: {selectedDocument.name}</p>
                           </div>
                           
                           <div className="space-y-4 text-sm leading-relaxed">
                             <p><strong>DOCUMENT:</strong> This document requires your digital signature for completion.</p>
                             
                             <p><strong>INSTRUCTIONS:</strong> Please review the document content and provide your signature below to proceed.</p>
                             
                             <div className="bg-gray-50 p-4 rounded-lg border">
                               <p className="text-center text-gray-600 italic">
                                 Document content preview not available. 
                                 <a href={selectedDocument.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                   Click here to view the full document
                                 </a>
                               </p>
                             </div>
                             
                             <div className="mt-8 pt-4 border-t border-gray-300">
                               <div className="flex justify-between items-center">
                                 <div className="relative">
                                   <p className="font-semibold">Digital Signature:</p>
                                   <div className="w-64 h-16 border-b-2 border-gray-400 mt-2 flex items-end relative">
                                     {showSignatureOnDocument && signature ? (
                                        <img 
                                          src={signature} 
                                          alt="Digital signature" 
                                          className="absolute bottom-0 left-0 h-12 w-auto max-w-full object-contain"
                                        />
                                      ) : (
                                        <span className="text-red-500 font-semibold">⚠ SIGNATURE REQUIRED</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">Date:</p>
                                    <p className="mt-2">{new Date().toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSignatureStep('select')}
                      className="flex-1 bg-[#232626] text-white font-semibold py-3 px-6 rounded-xl border border-[#9afa00]/20 hover:bg-[#9afa00]/10 transition-all"
                    >
                      Back to Documents
                    </button>
                    <button 
                      onClick={() => setSignatureStep('sign')}
                      className="flex-1 bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
                    >
                      Proceed to Sign
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Signature Canvas */}
              {signatureStep === 'sign' && selectedDocument && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-white text-xl font-semibold mb-2">Sign the Document</h3>
                    <p className="text-gray-400">Draw your signature in the box below</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border border-[#9afa00]/20">
                    <div className="text-center mb-4">
                      <p className="text-black font-semibold">Signature Area</p>
                      <p className="text-gray-600 text-sm">Use your mouse or touch to draw your signature</p>
                    </div>
                    
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair block mx-auto"
                      style={{ 
                        width: '100%', 
                        maxWidth: '600px', 
                        height: '200px',
                        touchAction: 'none'
                      }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    
                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={clearSignature}
                        className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-all"
                      >
                        Clear Signature
                      </button>
                      <button 
                        onClick={saveSignature}
                        className="flex-1 bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
                      >
                        Apply Signature
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSignatureStep('preview')}
                      className="flex-1 bg-[#232626] text-white font-semibold py-3 px-6 rounded-xl border border-[#9afa00]/20 hover:bg-[#9afa00]/10 transition-all"
                    >
                      Back to Preview
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {signatureStep === 'review' && selectedDocument && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-white text-xl font-semibold mb-2">Review Document</h3>
                    <p className="text-gray-400">Please review the document with your signature applied</p>
                  </div>
                  
                  <div className="bg-[#2a3622]/20 rounded-xl p-6 border border-[#9afa00]/20 min-h-[500px]">
                    <div className="bg-white rounded-lg p-8 text-black min-h-[400px] shadow-lg relative">
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold mb-2">{selectedDocument.name}</h2>
                        <p className="text-gray-600">Document ID: {selectedDocument.id}</p>
                      </div>
                      
                      {/* Display actual document content */}
                      <div className="mb-8">
                        {selectedDocument.type === 'image' ? (
                          <div className="text-center">
                            <img 
                              src={selectedDocument.url} 
                              alt={selectedDocument.name}
                              className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                              style={{ maxHeight: '300px' }}
                            />
                          </div>
                        ) : (
                          <div className="text-center p-8 bg-gray-50 rounded-lg border">
                            <FaFilePdf className="text-red-500 text-4xl mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold mb-2">{selectedDocument.name}</p>
                            <p className="text-gray-600 text-sm mb-4">Document preview with signature applied</p>
                            <a 
                              href={selectedDocument.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              View Original Document
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {/* Signature area */}
                      <div className="mt-8 pt-4 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <div className="relative">
                            <p className="font-semibold">Digital Signature:</p>
                            <div className="w-64 h-16 border-b-2 border-gray-400 mt-2 flex items-end relative">
                              {signature ? (
                                <img 
                                  src={signature} 
                                  alt="Digital signature" 
                                  className="absolute bottom-0 left-0 h-12 w-auto max-w-full object-contain"
                                />
                              ) : (
                                <span className="text-red-500 font-semibold">⚠ SIGNATURE REQUIRED</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">Date:</p>
                            <p className="mt-2">{new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSignatureStep('sign')}
                      className="flex-1 bg-[#232626] text-white font-semibold py-3 px-6 rounded-xl border border-[#9afa00]/20 hover:bg-[#9afa00]/10 transition-all"
                    >
                      Edit Signature
                    </button>
                    <button 
                      onClick={applySignatureToDocument}
                      className="flex-1 bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
                    >
                      Approve & Complete
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Completion */}
              {signatureStep === 'complete' && selectedDocument && (
                <div className="space-y-6 text-center">
                  <div className="bg-[#2a3622]/30 rounded-xl p-8 border border-[#9afa00]/20">
                    <div className="w-20 h-20 bg-[#9afa00] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    <h3 className="text-white text-2xl font-bold mb-2">Document Signed Successfully!</h3>
                    <p className="text-gray-400 mb-6">Your signature has been applied to {selectedDocument.name}</p>
                    
                    {signature && (
                      <div className="bg-white rounded-lg p-4 mb-6">
                        <p className="text-black font-semibold mb-2">Your Signature:</p>
                        <img src={signature} alt="Your signature" className="mx-auto border border-gray-300 rounded" />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <button 
                        onClick={downloadSignedDocument}
                        className="w-full bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <FaDownload className="text-lg" />
                        Download Signed Document
                      </button>
                      <button 
                        onClick={sendSignedDocumentToChat}
                        className="w-full bg-[#232626] text-white font-semibold py-3 px-6 rounded-xl border border-[#9afa00]/20 hover:bg-[#9afa00]/10 transition-all flex items-center justify-center gap-2"
                      >
                        <FaPaperPlane className="text-lg" />
                        Send to Chat
                      </button>
                      <button 
                        onClick={resetSignatureModal}
                        className="w-full bg-transparent text-[#9afa00] font-semibold py-3 px-6 rounded-xl border border-[#9afa00]/20 hover:bg-[#9afa00]/10 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md border border-[#9afa00]/20">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaCalendarAlt className="text-[#9afa00]" />
                  Schedule Meeting
                </h2>
                <button
                  onClick={closeMeetingModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Meeting Form */}
              <div className="space-y-4">
                {/* Invited Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaUser className="text-[#9afa00]" />
                    Invited Email
                  </label>
                  <input
                    type="email"
                    value={meetingData.invitedEmail}
                    onChange={(e) => handleMeetingInputChange('invitedEmail', e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-[#2a2a2a] border border-[#9afa00]/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 focus:border-[#9afa00]"
                  />
                </div>

                {/* Meeting Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    value={meetingData.title}
                    onChange={(e) => handleMeetingInputChange('title', e.target.value)}
                    placeholder="Enter meeting title"
                    className="w-full bg-[#2a2a2a] border border-[#9afa00]/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 focus:border-[#9afa00]"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaClock className="text-[#9afa00]" />
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={meetingData.startTime}
                    onChange={(e) => handleMeetingInputChange('startTime', e.target.value)}
                    className="w-full bg-[#2a2a2a] border border-[#9afa00]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 focus:border-[#9afa00]"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaClock className="text-[#9afa00]" />
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={meetingData.endTime}
                    onChange={(e) => handleMeetingInputChange('endTime', e.target.value)}
                    className="w-full bg-[#2a2a2a] border border-[#9afa00]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 focus:border-[#9afa00]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeMeetingModal}
                  disabled={creatingMeeting}
                  className="flex-1 bg-transparent text-gray-400 font-semibold py-3 px-6 rounded-xl border border-gray-600 hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMeeting}
                  disabled={creatingMeeting || !meetingData.title || !meetingData.invitedEmail}
                  className="flex-1 bg-[#9afa00] text-black font-semibold py-3 px-6 rounded-xl hover:bg-[#8ae000] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingMeeting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaCalendarAlt />
                      Schedule Meeting
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md border border-[#9afa00]/20">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaFileContract className="text-[#9afa00]" />
                  Create Contract
                </h2>
                <button
                  onClick={closeContractModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Contract Form */}
              <div className="space-y-4">
                {/* Contract Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contract Title *
                  </label>
                  <input
                    type="text"
                    value={contractData.title}
                    onChange={(e) => setContractData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter contract title"
                    className="w-full bg-[#2a2a2a] border border-[#9afa00]/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 focus:border-[#9afa00]"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaDollarSign className="text-[#9afa00]" />
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={contractData.amount}
                    onChange={(e) => setContractData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter contract amount"
                    min="0"
                    step="0.01"
                    className="w-full bg-[#2a2a2a] border border-[#9afa00]/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 focus:border-[#9afa00]"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaClock className="text-[#9afa00]" />
                    How long the contract payment will be held ? *
                  </label>
                  <input
                    type="date"
                    value={contractData.expiryDate}
                    onChange={(e) => setContractData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-[#9afa00]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 focus:border-[#9afa00]"
                  />
                </div>

                {/* Offer Valid Till */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-[#9afa00]" />
                    How long the offer is valid ? *
                    <FaInfoCircle
                      className="text-gray-400 hover:text-white cursor-help"
                      title="This defines the offer validity period. After this date, the offer will expire and the contract will no longer accept signatures."
                    />
                  </label>
                  <input
                    type="date"
                    value={contractData.signingValidUntil}
                    onChange={(e) => setContractData(prev => ({ ...prev, signingValidUntil: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-[#9afa00]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 focus:border-[#9afa00]"
                  />
                </div>

                {/* Who is going to pay the contract fee ? */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Who is going to pay the contract fee ?
                  </label>
                  <select
                    value={contractData.paymentResponsibility}
                    onChange={(e) => setContractData(prev => ({ ...prev, paymentResponsibility: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-[#9afa00]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 focus:border-[#9afa00]"
                  >
                    <option value="brand">Brand</option>
                    <option value="athlete">Athlete</option>
                  </select>
                </div>

                {/* Contract File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contract File (PDF) *
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => contractFileInputRef.current?.click()}
                      className="flex-1 bg-[#2a2a2a] border border-[#9afa00]/30 rounded-lg px-4 py-3 text-gray-400 hover:text-white hover:border-[#9afa00] transition-all flex items-center gap-2"
                    >
                      <FaFilePdf className="text-red-400" />
                      {contractData.contractFile ? contractData.contractFile.name : 'Choose PDF file'}
                    </button>
                    {contractFileUrl && (
                      <div className="text-[#9afa00] text-sm">✓ Uploaded</div>
                    )}
                  </div>
                  <input
                    ref={contractFileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleContractFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeContractModal}
                  disabled={isCreatingContract}
                  className="flex-1 bg-transparent text-gray-400 font-semibold py-3 px-6 rounded-xl border border-gray-600 hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createContract}
                  disabled={isCreatingContract || !contractData.title || !contractData.amount || !contractData.expiryDate || !contractData.signingValidUntil || !contractFileUrl}
                  className="flex-1 bg-[#9afa00] text-black font-semibold py-3 px-6 rounded-xl hover:bg-[#8ae000] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingContract ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaFileContract />
                      Create Contract
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Video Call Modal */}
      <VideoCall
        isOpen={showVideoCall}
        onClose={handleVideoCallEnd}
        callType={videoCallType}
        callerName={videoCallData.callerName}
        callerId={videoCallData.callerId}
        channelName={videoCallData.channelName}
        onAccept={handleVideoCallAccept}
        onReject={handleVideoCallReject}
      />
    </div>
    </>
  );
};

export default Inbox;