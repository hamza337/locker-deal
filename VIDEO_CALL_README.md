# Video Call Feature Implementation

## Overview
This implementation adds video calling functionality to the chat application using Agora SDK. Users can make video calls with basic features including accept/reject calls, mute/unmute, and hang up.

## Features Implemented

### ✅ Core Video Call Features
- **Outgoing Calls**: Start video calls from any chat
- **Incoming Calls**: Receive and handle incoming video calls
- **Accept/Reject**: Accept or reject incoming calls
- **Mute/Unmute**: Toggle microphone during calls
- **Video Toggle**: Turn camera on/off during calls
- **Hang Up**: End calls at any time
- **Call Duration**: Display call timer
- **Real-time Communication**: Socket-based call signaling

### 🎨 UI Components
- **Video Call Button**: Added to chat header when a chat is selected
- **Video Call Modal**: Full-screen video call interface
- **Call Status Indicators**: Visual feedback for call states
- **Professional Design**: Matches the existing app theme

## Files Created/Modified

### New Files
1. **`src/services/videoCallService.js`** - Agora SDK integration service
2. **`src/components/chat/VideoCall.jsx`** - Video call UI component
3. **`VIDEO_CALL_README.md`** - This documentation file

### Modified Files
1. **`src/pages/inbox/Inbox.jsx`** - Added video call integration
2. **`package.json`** - Added Agora SDK dependencies
3. **`.env`** - Added Agora App ID configuration

## Setup Instructions

### 1. Agora Account Setup
1. Create an account at [Agora.io](https://www.agora.io/)
2. Create a new project in the Agora Console
3. Get your App ID from the project settings
4. Replace `your_agora_app_id_here` in `.env` with your actual App ID:
   ```
   VITE_AGORA_APP_ID=your_actual_app_id_here
   ```

### 2. Dependencies
The following packages have been installed:
- `agora-rtc-react` - React hooks for Agora
- `agora-rtc-sdk-ng` - Agora RTC SDK

### 3. Environment Variables
Add to your `.env` file:
```
VITE_AGORA_APP_ID=your_agora_app_id_here
```

## How to Use

### Starting a Video Call
1. Select a chat from the chat list
2. Click the video call button (📹) in the chat header
3. The call will start and a notification will be sent to the other user

### Receiving a Video Call
1. When someone calls you, a video call modal will appear
2. Click the green phone button to accept
3. Click the red phone button to reject

### During a Call
- **Mute/Unmute**: Click the microphone button
- **Video On/Off**: Click the video camera button
- **Hang Up**: Click the red phone button
- **Call Duration**: Displayed in the header

## Technical Implementation

### Video Call Service (`videoCallService.js`)
- Manages Agora client initialization
- Handles joining/leaving channels
- Manages local audio/video tracks
- Provides mute/video toggle functionality
- Event handling for remote users

### Video Call Component (`VideoCall.jsx`)
- Full-screen video call interface
- Handles different call states (incoming, outgoing, active, ended)
- Local and remote video rendering
- Call controls (accept, reject, mute, video, hang up)
- Call duration timer

### Socket Integration
- `video_call_invite` - Sent when starting a call
- `video_call_reject` - Sent when rejecting a call
- Real-time call signaling between users

## Call Flow

### Outgoing Call
1. User clicks video call button
2. Agora channel is created with unique name
3. Local user joins the channel
4. Socket invitation is sent to the other user
5. Call becomes active when both users are connected

### Incoming Call
1. Socket receives `video_call_invite` event
2. Video call modal appears with caller information
3. User can accept or reject the call
4. If accepted, user joins the Agora channel
5. Call becomes active

### Channel Naming
Channels are named using a deterministic format:
```javascript
const channelName = `call_${Math.min(userId1, userId2)}_${Math.max(userId1, userId2)}`;
```
This ensures both users join the same channel regardless of who initiates the call.

## Error Handling
- Camera/microphone access errors
- Network connection issues
- Agora service errors
- Socket connection problems
- User-friendly toast notifications for all errors

## Security Considerations
- App ID is stored in environment variables
- Channel names are deterministic but not easily guessable
- No sensitive data is transmitted through sockets
- Agora handles all media encryption

## Future Enhancements
- Token-based authentication for production
- Screen sharing capability
- Group video calls
- Call recording
- Call history
- Push notifications for missed calls
- Bandwidth optimization settings

## Troubleshooting

### Common Issues
1. **"Agora App ID not found"** - Check your `.env` file
2. **Camera/microphone not working** - Check browser permissions
3. **Call not connecting** - Check network connectivity
4. **No incoming calls** - Check socket connection

### Browser Compatibility
- Chrome 58+
- Firefox 56+
- Safari 11+
- Edge 79+

### Required Permissions
- Camera access
- Microphone access
- Network access

## Support
For Agora-specific issues, refer to:
- [Agora Documentation](https://docs.agora.io/)
- [Agora React SDK Guide](https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=react-js)

---

**Note**: Remember to replace the placeholder App ID in `.env` with your actual Agora App ID for the video calling to work properly.