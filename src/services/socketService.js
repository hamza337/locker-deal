import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.baseUrl = import.meta.env.VITE_API_BASE_URL;
    this.connectionListeners = [];
    this.messageListeners = [];
    this.chatListUpdateListeners = [];
    this.currentRoom = null;
    this.joinedRooms = new Set();
  }

  // Initialize socket connection
  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.id) {
      console.error('No authentication token or user found');
      return null;
    }

    console.log('Connecting to socket server...', this.baseUrl);

    this.socket = io(this.baseUrl, {
      auth: {
        token: token,
        userId: user.id,
        userRole: user.role
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();
    return this.socket;
  }

  // Setup all socket event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully!', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      // toast.success('Connected to chat server!');
      
      // Join user room
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.socket.emit('join_room', { 
        userId: user.id, 
        userRole: user.role 
      });
      
      // Also try alternative join events
      this.socket.emit('join', { userId: user.id });
      this.socket.emit('user_join', { userId: user.id, role: user.role });
      
      // Notify all connection listeners
      this.connectionListeners.forEach(callback => callback(true));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      // toast.error('Disconnected from chat server');
      
      // Notify all connection listeners
      this.connectionListeners.forEach(callback => callback(false));
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.isConnected = false;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
      } else {
        // toast.error('Failed to connect to chat server');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      // toast.success('Reconnected to chat server!');
    });

    // Listen for the specific receive_message event
    this.socket.on('receive_message', (message) => {
      console.log('📨 Received message:', message);
      console.log('📨 Message content fields:', {
        content: message.content,
        text: message.text,
        message: message.message,
        senderId: message.sender.id,
        receiverId: message.receiver.id
      });
      // Notify all message listeners
      this.messageListeners.forEach(callback => callback(message));
    });

    // Listen for chat list updates
    this.socket.on('chat_list_update', (chatList) => {
      console.log('📋 Received chat list update:', chatList);
      // Notify all chat list update listeners
      this.chatListUpdateListeners.forEach(callback => callback(chatList));
    });

    // Room and user events
    this.socket.on('room_joined', (data) => {
      console.log('✅ Joined room:', data);
    });

    this.socket.on('joined', (data) => {
      console.log('✅ User joined:', data);
    });

    this.socket.on('user_online', (data) => {
      console.log('🟢 User came online:', data);
    });

    this.socket.on('user_offline', (data) => {
      console.log('🔴 User went offline:', data);
    });

    // Listen for exception events from backend
    this.socket.on('exception', (error) => {
      console.error('🚨 Backend exception:', error);
      if (error && error.message) {
        toast.error(`Server Error: ${error.message}`);
      } else {
        toast.error('An error occurred on the server');
      }
    });

    // Listen for any unhandled events (debugging)
    this.socket.onAny((eventName, ...args) => {
      console.log(`🔍 Received event '${eventName}':`, args);
      
      // Special handling for video call events
      if (eventName === 'video_call_invite') {
        console.log('📞 Video call invite detected in onAny listener:', args[0]);
      }
    });
    
    // Add explicit video call event listeners for debugging
    this.socket.on('video_call_invite', (data) => {
      console.log('📞 Direct video_call_invite listener triggered:', data);
    });
    
    this.socket.on('video_call_reject', (data) => {
      console.log('📞 Direct video_call_reject listener triggered:', data);
    });
  }

  // Test connection with multiple methods
  testConnection() {
    if (!this.socket?.connected) {
      console.log('❌ Socket not connected');
      toast.error('Socket not connected');
      return false;
    }

    console.log('🏓 Testing connection with multiple methods...');
    
    // Test 1: Basic ping
    this.socket.emit('ping', { timestamp: Date.now() }, (response) => {
      console.log('🏓 Ping response:', response);
    });

    // Test 2: Alternative ping events
    this.socket.emit('test', { message: 'connection test' });
    this.socket.emit('heartbeat', { timestamp: Date.now() });
    
    // Test 3: Check what events the server supports
    this.socket.emit('get_events', {}, (response) => {
      console.log('📋 Available events:', response);
    });

    toast.success('Connection tests sent - check console for responses');
    return true;
  }

  // Send a message
  sendMessage(receiverId, text, type = 'text', mediaUrl = null) {
    if (!this.socket?.connected) {
      // toast.error('Not connected to chat server');
      return false;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const messageData = {
      senderId: user.id,
      receiverId,
      content: text,
      type,
      timestamp: Date.now()
    };
    
    // Add mediaUrl if provided (for images, videos, documents)
    if (mediaUrl) {
      messageData.mediaUrl = mediaUrl;
    }

    console.log('📤 Sending message:', messageData);
    console.log('📤 Message content fields being sent:', {
      content: messageData.content,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      type: messageData.type
    });
    
    // Use the specific send_message event as requested
    this.socket.emit('send_message', messageData, (response) => {
      console.log('📨 Server response:', response);
      console.log('📨 Response content fields:', {
        success: response?.success,
        status: response?.status,
        id: response?.id,
        message: response?.message
      });
      
      if (response && (response.success || response.status === 'success' || response.id)) {
        console.log('✅ Message sent successfully:', response);
        toast.success('Message sent!');
      } else {
        console.error('❌ Failed to send message:', response);
        toast.error('Failed to send message');
      }
    });

    return true;
  }

  // Join a chat room with another user
  joinRoom(otherUserId) {
    if (!this.socket?.connected) {
      console.error('❌ Socket not connected, cannot join room');
      // toast.error('Not connected to chat server');
      return false;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roomData = {
      userId: user.id,
      otherUserId: otherUserId
    };

    console.log('🚪 Joining room with user:', otherUserId);
    
    // Return a promise to handle async response
    return new Promise((resolve) => {
      // Emit join event
      this.socket.emit('join', roomData, (response) => {
        console.log('🚪 Join room response:', response);
        
        if (response && (response.success || response.status === 'success' || response.status === 'joined')) {
          this.currentRoom = otherUserId;
          this.joinedRooms.add(otherUserId);
          console.log('✅ Successfully joined room with:', otherUserId);
          resolve(true);
        } else {
          console.error('❌ Failed to join room:', response);
          toast.error('Failed to join chat room');
          resolve(false);
        }
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        console.warn('⏰ Join room timeout for user:', otherUserId);
        resolve(false);
      }, 5000);
    });
  }

  // Leave current room
  leaveRoom(otherUserId) {
    if (!this.socket?.connected) {
      return false;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roomData = {
      userId: user.id,
      otherUserId: otherUserId
    };

    console.log('🚪 Leaving room with user:', otherUserId);
    
    this.socket.emit('leave', roomData, (response) => {
      console.log('🚪 Leave room response:', response);
      
      if (response && (response.success || response.status === 'success' || response.status === 'left')) {
        this.joinedRooms.delete(otherUserId);
        if (this.currentRoom === otherUserId) {
          this.currentRoom = null;
        }
        console.log('✅ Successfully left room with:', otherUserId);
      }
    });

    return true;
  }



  // Subscribe to connection status changes
  onConnectionChange(callback) {
    this.connectionListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  // Subscribe to new messages
  onMessage(callback) {
    this.messageListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  // Subscribe to chat list updates
  onChatListUpdate(callback) {
    this.chatListUpdateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.chatListUpdateListeners = this.chatListUpdateListeners.filter(cb => cb !== callback);
    };
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  // Reconnect socket
  reconnect() {
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }
}

// Export singleton instance
export default new SocketService();