# Video Call Error Debugging Guide

## Current Issue: Internal Server Error on start_call

### Error Details
```
Received event 'exception': 
[{
  cause: {
    data: {
      receiverId: "e9479e9d-4773-4849-8b29-4c2397bd7631"
    },
    pattern: "start_call"
  },
  message: "Internal server error",
  status: "error"
}]
```

## Debugging Steps

### 1. Check Frontend Implementation
✅ **Socket Connection**: Verify socket is connected before emitting events
✅ **User Authentication**: Check user ID exists in localStorage
✅ **Event Data**: Include callerId and callerName in start_call event
✅ **Error Handling**: Added exception event listener and response error checking

### 2. Backend Investigation Required

The error suggests the backend is having issues processing the `start_call` event. Common causes:

#### A. Authentication Issues
- Backend may not be able to authenticate the user
- Token validation failing
- User not found in database

#### B. Database Issues
- User lookup failing
- Receiver ID not found
- Database connection problems

#### C. Agora Integration Issues
- Agora App ID not configured
- Agora token generation failing
- Channel name generation issues

### 3. Frontend Debugging Tools

#### Check User Data
```javascript
// In browser console
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('Token:', localStorage.getItem('access_token'));
```

#### Check Socket Connection
```javascript
// In browser console
console.log('Socket connected:', socketService.socket?.connected);
console.log('Socket ID:', socketService.socket?.id);
```

#### Test Socket Events
```javascript
// In browser console
socketService.socket?.emit('ping', {}, (response) => {
  console.log('Ping response:', response);
});
```

### 4. Updated Error Handling

The frontend now includes:

1. **Exception Event Listener**: Catches backend exceptions and shows user-friendly errors
2. **Connection Validation**: Checks socket connection before making calls
3. **Authentication Check**: Validates user data exists
4. **Enhanced Logging**: Better debugging information
5. **Response Error Handling**: Handles error responses in callbacks

### 5. Next Steps

1. **Test with Updated Code**: Try making a video call with the improved error handling
2. **Check Console Logs**: Look for more detailed error information
3. **Backend Logs**: Ask backend team to check server logs for the specific error
4. **Database Check**: Verify the receiverId exists in the backend database
5. **Agora Configuration**: Ensure Agora is properly configured on backend

### 6. Common Solutions

#### If Authentication Error:
- Refresh the page to get a new token
- Re-login to the application
- Check if token has expired

#### If User Not Found:
- Verify the receiverId is correct
- Check if the receiver user exists in the system
- Ensure proper user synchronization between frontend and backend

#### If Agora Error:
- Verify Agora App ID matches between frontend (.env) and backend
- Check Agora account status and quotas
- Ensure backend has proper Agora SDK integration

### 7. Testing Checklist

- [ ] Socket connection established
- [ ] User authenticated with valid token
- [ ] Receiver user exists and is valid
- [ ] Backend logs show detailed error information
- [ ] Agora configuration is correct
- [ ] Database connectivity is working
- [ ] All required environment variables are set

## Contact Backend Team

Provide them with:
1. The exact error message and stack trace
2. User ID and receiver ID involved
3. Timestamp of the error
4. Current Agora App ID being used
5. Any relevant backend logs

The issue is likely on the backend side and requires their investigation to resolve the "Internal server error".