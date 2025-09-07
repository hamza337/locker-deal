# Video Call Debugging Guide

## 🚨 Current Issue
The video call initiator can start calls successfully, but the receiver isn't getting the popup notification. This appears to be a **backend socket relay issue**.

## 🔍 Root Cause Analysis

### The Problem
1. **Frontend-only project**: This project has no backend server code
2. **Remote backend dependency**: Connects to `https://api.lockerdeal.jif-works.in/`
3. **Socket event relay**: The backend must relay `video_call_invite` events between users
4. **Missing backend logic**: The remote backend may not be handling video call events

### What's Working ✅
- Agora SDK integration
- Channel name generation (fixed)
- Socket connection to backend
- Video call UI components
- Local video call initiation

### What's Not Working ❌
- `video_call_invite` events not reaching the receiver
- Backend not relaying socket events between users
- No popup shown to receiver

## 🧪 Debug Functions Available

Open browser console and use these functions:

### Basic Socket Testing
```javascript
// Test socket connection
window.debugVideoCall.testSocket()

// Check current user
window.debugVideoCall.getCurrentUser()

// Check selected chat
window.debugVideoCall.getSelectedChat()

// Check socket listeners
window.debugVideoCall.checkSocketListeners()
```

### Video Call Testing
```javascript
// Test sending video call invite
window.debugVideoCall.testVideoCallInvite('receiver-user-id')

// Simulate incoming call (via socket)
window.debugVideoCall.simulateIncomingCall()

// Direct trigger incoming call (bypass socket)
window.debugVideoCall.directTriggerIncomingCall()
```

## 📋 Step-by-Step Debugging

### Step 1: Verify Socket Connection
1. Open browser console on both devices
2. Run: `window.debugVideoCall.testSocket()`
3. Check if both users are connected to the same backend
4. Verify socket IDs are different

### Step 2: Test Direct Call Trigger
1. On receiver's browser, run: `window.debugVideoCall.directTriggerIncomingCall()`
2. This should show the video call popup immediately
3. If this works, the UI is fine - issue is socket communication

### Step 3: Test Socket Event Flow
1. On receiver's browser, run: `window.debugVideoCall.checkSocketListeners()`
2. Verify `video_call_invite` listeners are active
3. On sender's browser, initiate a call
4. Check receiver's console for any `video_call_invite` events

### Step 4: Backend Investigation
1. Check network tab for socket connections
2. Look for `video_call_invite` events being sent
3. Verify backend is online and responding

## 🔧 Potential Solutions

### Solution 1: Backend Fix (Recommended)
The backend at `https://api.lockerdeal.jif-works.in/` needs to handle video call events:

```javascript
// Backend should have something like this:
socket.on('video_call_invite', (data) => {
  // Find the receiver's socket
  const receiverSocket = findUserSocket(data.receiverId);
  if (receiverSocket) {
    // Relay the invitation to receiver
    receiverSocket.emit('video_call_invite', data);
  }
});
```

### Solution 2: Room-based Communication
Ensure both users are in the same socket room:

```javascript
// Backend should join users to rooms
socket.join(`user_${userId}`);

// Then broadcast to specific user
io.to(`user_${data.receiverId}`).emit('video_call_invite', data);
```

### Solution 3: Local Backend (Development)
For testing, you could create a simple local backend:

```javascript
const io = require('socket.io')(3001, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  socket.on('video_call_invite', (data) => {
    socket.broadcast.emit('video_call_invite', data);
  });
});
```

## 🚀 Quick Test Scenarios

### Scenario 1: UI Test
```javascript
// This should work immediately
window.debugVideoCall.directTriggerIncomingCall()
```

### Scenario 2: Socket Test
```javascript
// Run on both browsers, should see events in console
window.debugVideoCall.testSocket()
```

### Scenario 3: Cross-browser Test
1. Open app in two different browsers
2. Login as different users
3. Start a chat between them
4. Try video call from one browser
5. Check console logs in both browsers

## 📊 Expected Console Output

### Successful Call Flow
```
// Sender console:
📤 Emitting video_call_invite: {callerId: "...", receiverId: "...", ...}
✅ Local tracks published successfully

// Receiver console:
📞 Video call invite detected in onAny listener: {...}
📞 Direct video_call_invite listener triggered: {...}
📞 Incoming video call received: {...}
📞 Updated video call state - showing modal
```

### Failed Call Flow
```
// Sender console:
📤 Emitting video_call_invite: {callerId: "...", receiverId: "...", ...}
✅ Local tracks published successfully

// Receiver console:
(No video call events - this indicates backend issue)
```

## 🎯 Next Steps

1. **Test the UI**: Use `directTriggerIncomingCall()` to verify popup works
2. **Check Backend**: Contact backend team about video call event handling
3. **Network Analysis**: Use browser dev tools to monitor socket events
4. **Cross-device Testing**: Test on different devices/networks
5. **Backend Logs**: Check backend server logs for video call events

## 📞 Contact Backend Team

If the UI tests work but socket events don't reach the receiver, the backend team needs to:

1. Add `video_call_invite` event handler
2. Implement user-to-user event relaying
3. Ensure proper room/user management
4. Add logging for video call events
5. Test socket event broadcasting

The frontend video call implementation is complete and working - the issue is in the backend socket event handling.