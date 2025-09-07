# 🎥 Video Call Setup Guide

## 🚨 Problem Solved!

Since there's **no backend support for video calls yet**, I've created a **simple test server** to handle video call socket events between users.

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Server Dependencies
```bash
# Copy the server package.json
cp server-package.json package-server.json

# Install server dependencies
npm install --prefix . socket.io@^4.7.5 cors@^2.8.5

# Or install globally
npm install -g socket.io cors
```

### Step 2: Start the Test Server
```bash
# Start the video call test server
node simple-video-call-server.js
```

You should see:
```
🎯 Video Call Test Server running on port 3001
🔗 Update your .env file: VITE_API_BASE_URL=http://localhost:3001
📞 Ready to handle video call events!
```

### Step 3: Update Frontend Configuration
```bash
# Update your .env file
echo "VITE_API_BASE_URL=http://localhost:3001" > .env.local
```

Or manually edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_AGORA_APP_ID=dcce798ad5f947488b4f2e6ac2616d5e
```

### Step 4: Start Your Frontend
```bash
# In a new terminal
npm run dev
```

## 🧪 Testing Video Calls

### Method 1: Two Browser Windows
1. Open your app in **two different browser windows**
2. Login as **different users** in each window
3. Start a chat between the users
4. Click the video call button in one window
5. The other window should show the incoming call popup! 🎉

### Method 2: Two Different Browsers
1. Open app in **Chrome** and **Firefox** (or Safari)
2. Login as different users
3. Test video calling between browsers

### Method 3: Debug Console Testing
```javascript
// In receiver's browser console:
window.debugVideoCall.directTriggerIncomingCall()

// Should show popup immediately
```

## 📊 Server Logs

When testing, you'll see logs like:
```
✅ User connected: abc123
📝 Registered user f2844996-6d0d-48ed-92d6-f0d4187a4f10 with socket abc123
📞 Video call invite received: {callerId: "...", receiverId: "..."}
📞 Forwarding call to receiver socket: def456
✅ Video call invitation sent successfully
```

## 🔧 Server Features

### ✅ What the Test Server Handles:
- **Video Call Invitations** (`video_call_invite`)
- **Call Rejections** (`video_call_reject`)
- **Call Acceptance** (`video_call_accept`)
- **Regular Chat Messages** (`send_message`)
- **User Registration** (`join_room`, `join`, `user_join`)
- **Test Events** (`test_event`)
- **Connection Management**
- **Error Handling**

### 🎯 How It Works:
1. **User Registration**: When users connect, they register with their user ID
2. **Event Relay**: Server maintains a map of user IDs to socket IDs
3. **Direct Messaging**: Video call events are sent directly to the target user
4. **Real-time Communication**: Instant event forwarding between users

## 🐛 Troubleshooting

### Issue: "Connection Failed"
```bash
# Check if server is running
lsof -i :3001

# Restart server
node simple-video-call-server.js
```

### Issue: "User Not Found"
- Make sure both users are logged in and connected
- Check server logs for user registration
- Verify user IDs match between frontend and server

### Issue: "No Popup Shown"
```javascript
// Test UI directly (should work)
window.debugVideoCall.directTriggerIncomingCall()

// Test socket connection
window.debugVideoCall.testSocket()

// Check socket listeners
window.debugVideoCall.checkSocketListeners()
```

## 🔄 Development Workflow

### Terminal 1: Server
```bash
node simple-video-call-server.js
```

### Terminal 2: Frontend
```bash
npm run dev
```

### Browser 1: User A
```
http://localhost:5173
Login as User A
```

### Browser 2: User B
```
http://localhost:5173
Login as User B
```

## 🚀 Production Considerations

For production deployment, the main backend should implement:

```javascript
// Backend should add these handlers:
socket.on('video_call_invite', (data) => {
  const receiverSocket = findUserSocket(data.receiverId);
  if (receiverSocket) {
    receiverSocket.emit('video_call_invite', data);
  }
});

socket.on('video_call_reject', (data) => {
  const callerSocket = findUserSocket(data.callerId);
  if (callerSocket) {
    callerSocket.emit('video_call_reject', data);
  }
});
```

## 📞 Expected Results

After setup, you should have:
- ✅ **Working Video Call Popups**: Receiver gets notifications
- ✅ **Real-time Communication**: Instant event delivery
- ✅ **Full Video Call Flow**: Accept/reject/hang up all working
- ✅ **Agora Integration**: Video/audio streaming between users
- ✅ **Debug Tools**: Console functions for testing

## 🎉 Success Indicators

### Server Console:
```
📞 Video call invite received: {...}
📞 Forwarding call to receiver socket: def456
✅ Video call invitation sent successfully
```

### Receiver Browser:
```
📞 Video call invite detected in onAny listener: {...}
📞 Incoming video call received: {...}
📞 Updated video call state - showing modal
```

### UI:
- 🔔 **Popup appears** with caller's name
- 🎵 **Toast notification** shows
- 📞 **Accept/Reject buttons** work
- 🎥 **Video call connects** when accepted

Your video call system should now be **fully functional**! 🎊