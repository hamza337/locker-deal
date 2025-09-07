#!/usr/bin/env node

/**
 * Simple Video Call Server for Testing
 * 
 * This is a minimal Node.js server to handle video call socket events
 * between users for testing purposes.
 * 
 * To use:
 * 1. Install dependencies: npm install socket.io cors
 * 2. Run: node simple-video-call-server.js
 * 3. Update .env: VITE_API_BASE_URL=http://localhost:3001
 */

const { Server } = require('socket.io');
const cors = require('cors');

// Create HTTP server
const http = require('http');
const server = http.createServer();

// Create Socket.IO server with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST"]
  }
});

// Store connected users
const connectedUsers = new Map();

console.log('🚀 Video Call Test Server Starting...');

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Handle user joining with their ID
  socket.on('join_room', (data) => {
    console.log('🚪 User joining room:', data);
    if (data.userId) {
      connectedUsers.set(data.userId, socket.id);
      socket.userId = data.userId;
      console.log(`📝 Registered user ${data.userId} with socket ${socket.id}`);
    }
  });

  // Handle alternative join events
  socket.on('join', (data) => {
    console.log('🚪 User joining (alt):', data);
    if (data.userId) {
      connectedUsers.set(data.userId, socket.id);
      socket.userId = data.userId;
      console.log(`📝 Registered user ${data.userId} with socket ${socket.id}`);
    }
  });

  socket.on('user_join', (data) => {
    console.log('🚪 User joining (user_join):', data);
    if (data.userId) {
      connectedUsers.set(data.userId, socket.id);
      socket.userId = data.userId;
      console.log(`📝 Registered user ${data.userId} with socket ${socket.id}`);
    }
  });

  // Handle video call invitations
  socket.on('video_call_invite', (data) => {
    console.log('📞 Video call invite received:', data);
    console.log('📞 Looking for receiver:', data.receiverId);
    
    // Find the receiver's socket
    const receiverSocketId = connectedUsers.get(data.receiverId);
    
    if (receiverSocketId) {
      console.log(`📞 Forwarding call to receiver socket: ${receiverSocketId}`);
      // Send the invitation to the specific receiver
      io.to(receiverSocketId).emit('video_call_invite', data);
      console.log('✅ Video call invitation sent successfully');
    } else {
      console.log('❌ Receiver not found or not connected');
      console.log('📋 Connected users:', Array.from(connectedUsers.keys()));
      // Optionally notify sender that receiver is not available
      socket.emit('video_call_error', {
        message: 'Receiver is not online',
        receiverId: data.receiverId
      });
    }
  });

  // Handle video call rejection
  socket.on('video_call_reject', (data) => {
    console.log('📞 Video call rejected:', data);
    
    // Find the caller's socket
    const callerSocketId = connectedUsers.get(data.callerId);
    
    if (callerSocketId) {
      console.log(`📞 Notifying caller of rejection: ${callerSocketId}`);
      io.to(callerSocketId).emit('video_call_reject', data);
    }
  });

  // Handle video call acceptance (optional)
  socket.on('video_call_accept', (data) => {
    console.log('📞 Video call accepted:', data);
    
    // Find the caller's socket
    const callerSocketId = connectedUsers.get(data.callerId);
    
    if (callerSocketId) {
      console.log(`📞 Notifying caller of acceptance: ${callerSocketId}`);
      io.to(callerSocketId).emit('video_call_accept', data);
    }
  });

  // Handle regular chat messages (pass through)
  socket.on('send_message', (data, callback) => {
    console.log('💬 Message received:', data);
    
    // Find receiver and forward message
    const receiverSocketId = connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', {
        id: Date.now(),
        sender: { id: data.senderId },
        receiver: { id: data.receiverId },
        content: data.content,
        type: data.type || 'text',
        timestamp: data.timestamp || Date.now(),
        mediaUrl: data.mediaUrl
      });
    }
    
    // Send success response
    if (callback) {
      callback({ success: true, id: Date.now() });
    }
  });

  // Handle test events
  socket.on('test_event', (data) => {
    console.log('🧪 Test event received:', data);
    socket.emit('test_event', { message: 'Test response from server', original: data });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    
    // Remove user from connected users
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`🗑️ Removed user ${socket.userId} from connected users`);
    }
    
    console.log('📋 Remaining connected users:', Array.from(connectedUsers.keys()));
  });

  // Log all events for debugging
  socket.onAny((eventName, ...args) => {
    if (!['ping', 'pong'].includes(eventName)) {
      console.log(`🔍 Event '${eventName}' from ${socket.id}:`, args);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎯 Video Call Test Server running on port ${PORT}`);
  console.log(`🔗 Update your .env file: VITE_API_BASE_URL=http://localhost:${PORT}`);
  console.log('📞 Ready to handle video call events!');
  console.log('\n📋 Supported Events:');
  console.log('  - video_call_invite');
  console.log('  - video_call_reject');
  console.log('  - video_call_accept');
  console.log('  - send_message');
  console.log('  - join_room / join / user_join');
  console.log('  - test_event');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});