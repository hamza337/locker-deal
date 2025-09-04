import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaMicrophone, FaEllipsisV, FaBars, FaTimes, FaPaperclip, FaRobot, FaFileSignature, FaCalendarAlt, FaFilePdf, FaImage, FaPaperPlane, FaDownload, FaPlay, FaFileAlt, FaClock, FaUser } from 'react-icons/fa';
import { getChatList, getChatHistory } from '../../services/chatService';
import socketService from '../../services/socketService';
import { uploadFile, validateFile } from '../../services/uploadService';
import { getChatAttachments, getSignableAttachments } from '../../services/attachmentService';
import { createMeeting, validateMeetingData, getDefaultMeetingTimes } from '../../services/meetingService';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

// Dynamic documents will be fetched from API

const Inbox = () => {
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
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const canvasRef = useRef(null);
  const documentRef = useRef(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

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

  // Fetch chat list on component mount
  useEffect(() => {
    fetchChatList();
  }, []);
  
  // Setup socket message listener with selectedChat dependency
  useEffect(() => {
    if (!selectedChat) {
      return; // Don't set up listener if no chat is selected
    }

    const handleMessage = (message) => {
      console.log('📨 Received new message:', message);
      console.log('📨 Current selectedChat:', selectedChat);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Only process messages that belong to the currently selected chat
      const isMessageForCurrentChat = 
        (message.sender.id === selectedChat.userId && message.receiver.id === user.id) ||
        (message.sender.id === user.id && message.receiver.id === selectedChat.userId);
      
      if (isMessageForCurrentChat) {
        // Only add messages from other users to avoid duplicates (we already add our own messages optimistically)
        if (message.sender.id !== user.id) {
          const newMessage = {
            id: message.id || Date.now(),
            fromMe: false,
            text: message.content || message.text || message.message,
            time: message.timestamp ? new Date(message.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            type: message.type || 'text',
            mediaUrl: message.mediaUrl || null,
            fileName: message.fileName || null,
            fileSize: message.fileSize || null
          };
          
          setMessages(prev => [...prev, newMessage]);
          toast.success('New message received!');
        }
      } else {
        // Show notification for messages from other chats (but don't add to current chat)
        if (message.sender.id !== user.id) {
          console.log('📨 Message from other chat, showing notification only');
          toast.success('New message from another chat');
        }
      }
    };

    const unsubscribeMessages = socketService.onMessage(handleMessage);
    
    // Cleanup socket listeners on unmount or selectedChat change
    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [selectedChat]);

  // Function to fetch chat list from API
  const fetchChatList = async () => {
    try {
      setLoadingChats(true);
      const chatData = await getChatList();

      // Transform API data to match component structure
      const transformedChats = chatData.map((chat, index) => ({
        userId: chat.user.id,
        avatar: `https://randomuser.me/api/portraits/men/${(index % 8) + 1}.jpg`, // Static placeholder
        name: chat.user.email, // Static placeholder using first 8 chars of userId
        message: chat.lastMessage,
        time: '12:25', // Static placeholder
        badge: chat.unreadCount
      }));
      
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
      const transformedMessages = sortedHistory.map((msg, index) => ({
        id: msg.id || index,
        fromMe: msg.sender.id === userId,
        text: msg.content || msg.message,
        time: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '12:00',
        type: msg.type || 'text',
        mediaUrl: msg.mediaUrl || null,
        fileName: msg.fileName || null,
        fileSize: msg.fileSize || null
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = (chat) => {
    // Leave previous room if any
    if (selectedChat) {
      socketService.leaveRoom(selectedChat.userId);
    }
    
    setSelectedChat(chat);
    fetchChatHistory(chat.userId);
    
    // Join the new chat room
    socketService.joinRoom(chat.userId);
    
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  // Send message function
  const sendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      // Send message via socket
      const success = socketService.sendMessage(selectedChat.userId, newMessage);
      
      if (success) {
        // Add message to local state immediately for better UX
        const message = {
          id: Date.now(),
          fromMe: true,
          text: newMessage,
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
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
      // Create PDF document
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('SIGNED DOCUMENT', 20, 30);
      
      // Add document info
      pdf.setFontSize(12);
      pdf.text(`Document Name: ${selectedDocument.name}`, 20, 50);
      pdf.text(`Document ID: ${selectedDocument.id}`, 20, 60);
      pdf.text(`Document Type: ${selectedDocument.type.toUpperCase()}`, 20, 70);
      pdf.text(`Signed Date: ${new Date().toLocaleDateString()}`, 20, 80);
      pdf.text(`Signed Time: ${new Date().toLocaleTimeString()}`, 20, 90);
      
      // Add document content section
      pdf.text('DOCUMENT CONTENT:', 20, 110);
      
      if (selectedDocument.type === 'image') {
        // For images, add the image to PDF
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            const imgWidth = 150;
            const imgHeight = (img.height * imgWidth) / img.width;
            
            pdf.addImage(imgData, 'JPEG', 20, 120, imgWidth, Math.min(imgHeight, 100));
            
            // Add signature
            addSignatureToPDF(pdf);
          };
          
          img.src = selectedDocument.mediaUrl;
        } catch (error) {
          console.error('Error loading image:', error);
          pdf.text('Image content could not be embedded', 20, 130);
          pdf.text(`View original: ${selectedDocument.url}`, 20, 140);
          addSignatureToPDF(pdf);
        }
      } else {
        // For documents, add reference
        pdf.text('Document Type: PDF/Document', 20, 130);
        pdf.text('Original document reference:', 20, 140);
        pdf.text(selectedDocument.url, 20, 150);
        addSignatureToPDF(pdf);
      }
      
      function addSignatureToPDF(pdfDoc) {
        // Add signature section
        pdfDoc.text('DIGITAL SIGNATURE:', 20, 200);
        
        // Add signature image
        const signatureImg = new Image();
        signatureImg.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = signatureImg.width;
          canvas.height = signatureImg.height;
          ctx.drawImage(signatureImg, 0, 0);
          
          const sigData = canvas.toDataURL('image/png');
          pdfDoc.addImage(sigData, 'PNG', 20, 210, 80, 30);
          
          // Add signature line and date
          pdfDoc.line(20, 250, 100, 250);
          pdfDoc.text('Digital Signature', 20, 260);
          pdfDoc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 250);
          
          // Save PDF
          const fileName = `signed_${selectedDocument.name.split('.')[0]}_${Date.now()}.pdf`;
          pdfDoc.save(fileName);
          
          toast.success('Signed document downloaded as PDF!');
        };
        signatureImg.src = signature;
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  // Send signed document to chat
  const sendSignedDocumentToChat = async () => {
    if (!selectedDocument || !signature || !selectedChat) {
      toast.error('Unable to send signed document');
      return;
    }

    try {
      toast.loading('Generating and uploading signed document...');
      
      // Generate signed PDF
      const signedPdfBlob = await generateSignedPDF();
      
      // Create a file from the PDF blob
      const signedFileName = `signed_${selectedDocument.name.split('.')[0]}_${Date.now()}.pdf`;
      const signedFile = new File([signedPdfBlob], signedFileName, { type: 'application/pdf' });
      
      // Upload the signed PDF
      const uploadedSignedDoc = await uploadFile(signedFile);
      
      // Create message content
      const messageContent = `📝 Signed Document: ${selectedDocument.name} (Digitally signed on ${new Date().toLocaleDateString()})`;
      
      // Send via socket using the signed PDF URL
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
      toast.error('Failed to generate or send signed document');
    }
  };

  // Generate signed PDF as blob
  const generateSignedPDF = async () => {
    return new Promise((resolve, reject) => {
      try {
        // Create PDF document
        const pdf = new jsPDF();
        
        // Add title
        pdf.setFontSize(20);
        pdf.text('SIGNED DOCUMENT', 20, 30);
        
        // Add document info
        pdf.setFontSize(12);
        pdf.text(`Document Name: ${selectedDocument.name}`, 20, 50);
        pdf.text(`Document ID: ${selectedDocument.id}`, 20, 60);
        pdf.text(`Document Type: ${selectedDocument.type.toUpperCase()}`, 20, 70);
        pdf.text(`Signed Date: ${new Date().toLocaleDateString()}`, 20, 80);
        pdf.text(`Signed Time: ${new Date().toLocaleTimeString()}`, 20, 90);
        
        // Add document content section
        pdf.text('DOCUMENT CONTENT:', 20, 110);
        
        if (selectedDocument.type === 'image') {
          // For images, add the image to PDF
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              
              const imgData = canvas.toDataURL('image/jpeg', 0.8);
              const imgWidth = 150;
              const imgHeight = (img.height * imgWidth) / img.width;
              
              pdf.addImage(imgData, 'JPEG', 20, 120, imgWidth, Math.min(imgHeight, 100));
              
              // Add signature
              addSignatureToPDF(pdf, resolve, reject);
            } catch (error) {
              console.error('Error processing image:', error);
              pdf.text('Image content could not be embedded', 20, 130);
              pdf.text(`View original: ${selectedDocument.url}`, 20, 140);
              addSignatureToPDF(pdf, resolve, reject);
            }
          };
          img.onerror = () => {
            pdf.text('Image content could not be loaded', 20, 130);
            pdf.text(`Original URL: ${selectedDocument.url}`, 20, 140);
            addSignatureToPDF(pdf, resolve, reject);
          };
          img.src = selectedDocument.mediaUrl;
        } else {
          // For documents, add reference
          pdf.text('Document Type: PDF/Document', 20, 130);
          pdf.text('Original document reference:', 20, 140);
          pdf.text(selectedDocument.url, 20, 150);
          addSignatureToPDF(pdf, resolve, reject);
        }
        
        function addSignatureToPDF(pdfDoc, resolveCallback, rejectCallback) {
          try {
            // Add signature section
            pdfDoc.text('DIGITAL SIGNATURE:', 20, 200);
            
            // Add signature image
            const signatureImg = new Image();
            signatureImg.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = signatureImg.width;
                canvas.height = signatureImg.height;
                ctx.drawImage(signatureImg, 0, 0);
                
                const sigData = canvas.toDataURL('image/png');
                pdfDoc.addImage(sigData, 'PNG', 20, 210, 80, 30);
                
                // Add signature line and date
                pdfDoc.line(20, 250, 100, 250);
                pdfDoc.text('Digital Signature', 20, 260);
                pdfDoc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 250);
                
                // Convert PDF to blob
                const pdfBlob = pdfDoc.output('blob');
                resolveCallback(pdfBlob);
              } catch (error) {
                rejectCallback(error);
              }
            };
            signatureImg.onerror = () => {
              rejectCallback(new Error('Failed to load signature image'));
            };
            signatureImg.src = signature;
          } catch (error) {
            rejectCallback(error);
          }
        }
        
      } catch (error) {
        reject(error);
      }
    });
  };

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
        const newMessage = {
          id: Date.now(),
          fromMe: true,
          text: meetingMessage,
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
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

  return (
    <div className="w-full h-full flex bg-transparent px-0 md:px-6 py-6 overflow-hidden">
      <div className="w-full max-w-6xl h-[80vh] bg-[rgba(0,0,0,0.3)] rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-lg min-w-0 mx-auto gap-0">
        {/* Sidebar (mobile overlay, md+ side) */}
        <div
          className={`fixed inset-0 z-40 bg-black bg-opacity-70 transition-opacity md:static md:bg-transparent md:z-0 ${sidebarOpen ? 'flex' : 'hidden'} md:flex`}
        >
          <div className="w-4/5 max-w-xs xl:max-w-sm min-w-[280px] bg-gradient-to-b from-[#1a2f14] to-[#0f1a0c] flex flex-col p-4 md:p-6 gap-4 h-full rounded-l-2xl md:rounded-l-2xl md:rounded-r-none rounded-r-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[#9afa00] text-lg md:text-xl font-bold">MY CHATS</h2>
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
                        <img src={chat.avatar} alt={chat.name} className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 border-[#9afa00]/20 group-hover:border-[#9afa00]/50 transition-all" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#9afa00] rounded-full border-2 border-[#1a2f14]"></div>
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
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-transparent min-w-0 h-full overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#232626] to-[#1a1f1a] px-4 md:px-6 py-4 md:py-5 sticky top-0 z-10 border-b border-[#9afa00]/20 shadow-lg rounded-tr-2xl">
            <div className="flex items-center gap-4 min-w-0">
              {/* Sidebar open button on mobile */}
              <button className="md:hidden text-white text-2xl hover:text-[#9afa00] transition-colors" onClick={() => setSidebarOpen(true)}><FaBars /></button>
              {selectedChat ? (
                <>
                  <div className="relative">
                    <img src={selectedChat.avatar} alt={selectedChat.name} className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover border-2 border-[#9afa00]/30" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#9afa00] rounded-full border-2 border-[#232626] animate-pulse"></div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-base md:text-lg truncate">{selectedChat.name}</div>
                    <div className="text-[#9afa00] text-xs md:text-sm font-medium">Online now</div>
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-sm">Select a chat to start messaging</div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-gradient-to-r from-[#2a3622] to-[#1f2b1a] p-3 rounded-full hover:from-[#9afa00]/20 hover:to-[#9afa00]/10 transition-all duration-200 border border-[#9afa00]/20">
                <FaSearch className="text-[#9afa00] text-lg" />
              </button>
              <button className="bg-gradient-to-r from-[#2a3622] to-[#1f2b1a] p-3 rounded-full hover:from-[#9afa00]/20 hover:to-[#9afa00]/10 transition-all duration-200 border border-[#9afa00]/20">
                <FaEllipsisV className="text-white text-lg" />
              </button>
            </div>
          </div>
          {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 flex flex-col gap-1 bg-gradient-to-b from-transparent to-[#0a0f08]/30 min-w-0 h-0">
              {!selectedChat ? (
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
                <>
                  <div className="text-center mb-4">
                    <span className="bg-[#232626] text-gray-300 text-xs px-4 py-2 rounded-full border border-[#9afa00]/20">24 April</span>
                  </div>
                  {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-lg mb-2">📝</div>
                        <div className="text-sm">No messages yet</div>
                        <div className="text-xs mt-1">Start the conversation!</div>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
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
                           <div className={`font-semibold ${msg.fromMe ? 'text-black' : 'text-white'}`}>{msg.fileName}</div>
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
                               <div className={`font-semibold ${msg.fromMe ? 'text-black' : 'text-white'}`}>{msg.fileName}</div>
                               <div className={`text-xs ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`}>{msg.fileSize}</div>
                             </div>
                           </div>
                         )}
                         <div className="flex items-center justify-between">
                           <span className={`text-xs ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`}>{msg.fileName}</span>
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
                               <div className={`font-semibold ${msg.fromMe ? 'text-black' : 'text-white'}`}>{msg.fileName}</div>
                               <div className={`text-xs ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`}>{msg.fileSize}</div>
                             </div>
                           </div>
                         )}
                         <div className="flex items-center justify-between">
                           <span className={`text-xs ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`}>{msg.fileName}</span>
                           <span className={`text-xs font-medium ${msg.fromMe ? 'text-black/70' : 'text-gray-400'} whitespace-nowrap`}>{msg.time}</span>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
                     ))
                   )}
                 </>
               )}
               <div ref={messagesEndRef} />
             </div>
          {/* Chat Input */}
          {selectedChat && (
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
                    onClick={() => {setShowDropdown(false); /* GPT functionality - static for now */}}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#9afa00]/10 transition-all text-left"
                  >
                    <FaRobot className="text-[#9afa00]" />
                    <span>GPT</span>
                  </button>
                  <button 
                    onClick={() => {setShowDropdown(false); fetchChatAttachments();}}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#9afa00]/10 transition-all text-left"
                    disabled={loadingDocuments}
                  >
                    <FaFileSignature className="text-[#9afa00]" />
                    <span>{loadingDocuments ? 'Loading...' : 'Sign a document'}</span>
                  </button>
                  <button 
                    onClick={openMeetingModal}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#9afa00]/10 transition-all text-left"
                  >
                    <FaCalendarAlt className="text-[#9afa00]" />
                    <span>Schedule a meeting</span>
                  </button>
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
    </div>
  );
};

export default Inbox;