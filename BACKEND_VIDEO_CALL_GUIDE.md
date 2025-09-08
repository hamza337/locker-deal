# Backend Video Call Integration Guide

## 🎯 Overview

The video call feature has been updated to use the new backend socket events. This guide explains how to test and use the new implementation.

## 📞 New Backend Events

### Caller Flow
1. **start_call** - Initiate a call
2. **call_accepted** - Receive acceptance notification
3. **call_rejected** - Receive rejection notification
4. **call_ended** - Receive call end notification

### Receiver Flow
1. **incoming_call** - Receive call invitation
2. **accept_call** - Accept the call
3. **reject_call** - Reject the call
4. **end_call** - End active call

## 🔧 Testing the Implementation

### Prerequisites
1. Backend server must be running with video call socket events
2. Two users logged into different browser sessions
3. Agora App ID configured in `.env` file

### Test Steps

#### 1. Basic Call Flow
1. **User A**: Select a chat and click the video call button
2. **User B**: Should receive an incoming call popup
3. **User B**: Click "Accept" to join the call
4. **Both Users**: Should see active video call interface
5. **Either User**: Click "End Call" to terminate

#### 2. Call Rejection Flow
1. **User A**: Initiate a video call
2. **User B**: Click "Reject" on incoming call popup
3. **User A**: Should see "Call was rejected" message

#### 3. Call End Flow
1. **Users A & B**: Start an active call
2. **User A**: Click "End Call"
3. **User B**: Should see "Call ended" message and UI cleanup

## 🐛 Debugging

### Console Logs to Monitor
- `🎥 Starting video call:` - Call initiation
- `📞 Backend response for start_call:` - Backend response
- `📞 Incoming video call received:` - Incoming call
- `📞 Video call accepted:` - Call acceptance
- `📞 Video call rejected:` - Call rejection
- `📞 Video call ended:` - Call termination

### Common Issues

#### Backend Not Responding
- Check if backend server is running
- Verify socket connection in browser console
- Ensure backend implements the new video call events

#### Agora Connection Failed
- Verify `VITE_AGORA_APP_ID` in `.env` file
- Check if backend provides valid Agora tokens
- Monitor network tab for Agora SDK errors

#### Socket Events Not Working
- Check browser console for socket connection status
- Verify backend socket event names match frontend
- Test with multiple browser sessions

## 🔄 Event Flow Diagram

```
Caller                    Backend                    Receiver
  |                         |                          |
  |--- start_call --------->|                          |
  |<-- {channelName,token}--|                          |
  |                         |--- incoming_call ------->|
  |                         |                          |
  |                         |<-- accept_call -----------|
  |<-- call_accepted -------|--- {token} ------------->|
  |                         |                          |
  |--- end_call ----------->|--- call_ended ---------->|
  |<-- call_ended ----------|                          |
```

## ✅ Expected Results

### Successful Call
- Caller sees "Calling..." status
- Receiver gets incoming call popup
- Both users connect to Agora channel
- Video/audio streams work properly
- Call can be ended by either party

### Failed Call
- Clear error messages displayed
- UI resets to normal state
- No hanging connections or states

## 🚀 Production Considerations

1. **Error Handling**: All socket events have proper error handling
2. **Token Security**: Agora tokens are generated server-side
3. **Connection Cleanup**: Proper cleanup on call end/rejection
4. **User Experience**: Clear status messages and loading states

## 📝 Notes

- The old debug functions have been removed
- Frontend no longer generates channel names (backend handles this)
- All Agora tokens come from backend for security
- Socket event names match backend specification exactly