import AgoraRTC from 'agora-rtc-sdk-ng';
import toast from 'react-hot-toast';

class VideoCallService {
  constructor() {
    this.client = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteUsers = {};
    this.isJoined = false;
    this.isMuted = false;
    this.isVideoEnabled = true;
    this.appId = import.meta.env.VITE_AGORA_APP_ID; // You'll need to add this to .env
    this.callListeners = [];
    this.userListeners = [];
  }

  // Initialize Agora client
  async initializeClient() {
    try {
      if (!this.appId) {
        throw new Error('Agora App ID not found in environment variables');
      }

      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      
      // Set up event listeners
      this.client.on('user-published', this.handleUserPublished.bind(this));
      this.client.on('user-unpublished', this.handleUserUnpublished.bind(this));
      this.client.on('user-joined', this.handleUserJoined.bind(this));
      this.client.on('user-left', this.handleUserLeft.bind(this));
      
      console.log('✅ Agora client initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Agora client:', error);
      toast.error('Failed to initialize video call service');
      return false;
    }
  }

  // Sanitize channel name for Agora requirements
  // sanitizeChannelName(channelName) {
  //   // Remove invalid characters and keep only allowed ones
  //   let sanitized = channelName.replace(/[^a-zA-Z0-9!#$%&()+\-:;<=>?@\[\]^_{|}~, ]/g, '');
    
  //   // If still too long, create a hash-based shorter version
  //   if (sanitized.length > 64) {
  //     // Take first 32 chars and create a simple hash of the full string
  //     const hash = channelName.split('').reduce((a, b) => {
  //       a = ((a << 5) - a) + b.charCodeAt(0);
  //       return a & a;
  //     }, 0);
  //     sanitized = channelName.substring(0, 32) + '_' + Math.abs(hash).toString(36);
  //   }
    
  //   // Ensure it's still within 64 bytes
  //   return sanitized.substring(0, 64);
  // }

  // Join a video call channel
  async joinCall(channelName, token = null, uid = null) {
    try {
      if (!this.client) {
        const initialized = await this.initializeClient();
        if (!initialized) return false;
      }

      console.log('🔧 Joining channel:', channelName);
      console.log('🔧 Using token:', token ? 'Token provided' : 'No token');
      console.log('🔧 App ID:', this.appId);

      // Use original channel name since token is generated for it
      // Note: If channel name is too long, the backend should handle sanitization
      const assignedUid = await this.client.join(this.appId, channelName, token, uid);
      console.log('✅ Joined channel:', channelName, 'with UID:', assignedUid);
      
      // Create and publish local tracks
      await this.createLocalTracks();
      await this.publishLocalTracks();
      
      this.isJoined = true;
      toast.success('Joined video call successfully!');
      return assignedUid;
    } catch (error) {
      console.error('❌ Failed to join call:', error);
      toast.error('Failed to join video call');
      return false;
    }
  }

  // Leave the video call
  async leaveCall() {
    try {
      // Unpublish and close local tracks
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      if (this.localVideoTrack) {
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }

      // Leave the channel
      if (this.client && this.isJoined) {
        await this.client.leave();
        this.isJoined = false;
      }

      // Clear remote users
      this.remoteUsers = {};
      
      console.log('✅ Left video call successfully');
      toast.success('Left video call');
      return true;
    } catch (error) {
      console.error('❌ Failed to leave call:', error);
      toast.error('Failed to leave video call');
      return false;
    }
  }

  // Create local audio and video tracks
  async createLocalTracks() {
    try {
      [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      console.log('✅ Local tracks created successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to create local tracks:', error);
      toast.error('Failed to access camera/microphone');
      return false;
    }
  }

  // Publish local tracks to the channel
  async publishLocalTracks() {
    try {
      if (this.client && this.localAudioTrack && this.localVideoTrack) {
        await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
        console.log('✅ Local tracks published successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to publish local tracks:', error);
      toast.error('Failed to publish video/audio');
      return false;
    }
  }

  // Toggle microphone mute/unmute
  async toggleMute() {
    try {
      if (this.localAudioTrack) {
        await this.localAudioTrack.setEnabled(!this.isMuted);
        this.isMuted = !this.isMuted;
        console.log(this.isMuted ? '🔇 Microphone muted' : '🎤 Microphone unmuted');
        toast.success(this.isMuted ? 'Microphone muted' : 'Microphone unmuted');
        return this.isMuted;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to toggle mute:', error);
      toast.error('Failed to toggle microphone');
      return false;
    }
  }

  // Toggle video on/off
  async toggleVideo() {
    try {
      if (this.localVideoTrack) {
        await this.localVideoTrack.setEnabled(!this.isVideoEnabled);
        this.isVideoEnabled = !this.isVideoEnabled;
        console.log(this.isVideoEnabled ? '📹 Video enabled' : '📹 Video disabled');
        toast.success(this.isVideoEnabled ? 'Video enabled' : 'Video disabled');
        return this.isVideoEnabled;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to toggle video:', error);
      toast.error('Failed to toggle video');
      return false;
    }
  }

  // Event handlers
  handleUserPublished(user, mediaType) {
    console.log('👤 User published:', user.uid, mediaType);
    this.remoteUsers[user.uid] = user;
    
    // Subscribe to the remote user
    this.client.subscribe(user, mediaType).then(() => {
      console.log('✅ Subscribed to user:', user.uid, mediaType);
      // Notify listeners
      this.userListeners.forEach(callback => callback('user-published', user, mediaType));
    }).catch(error => {
      console.error('❌ Failed to subscribe to user:', error);
    });
  }

  handleUserUnpublished(user, mediaType) {
    console.log('👤 User unpublished:', user.uid, mediaType);
    // Notify listeners
    this.userListeners.forEach(callback => callback('user-unpublished', user, mediaType));
  }

  handleUserJoined(user) {
    console.log('👤 User joined:', user.uid);
    this.remoteUsers[user.uid] = user;
    // Notify listeners
    this.userListeners.forEach(callback => callback('user-joined', user));
  }

  handleUserLeft(user) {
    console.log('👤 User left:', user.uid);
    delete this.remoteUsers[user.uid];
    // Notify listeners
    this.userListeners.forEach(callback => callback('user-left', user));
  }

  // Subscribe to call events
  onCallEvent(callback) {
    this.callListeners.push(callback);
    return () => {
      const index = this.callListeners.indexOf(callback);
      if (index > -1) {
        this.callListeners.splice(index, 1);
      }
    };
  }

  // Subscribe to user events
  onUserEvent(callback) {
    this.userListeners.push(callback);
    return () => {
      const index = this.userListeners.indexOf(callback);
      if (index > -1) {
        this.userListeners.splice(index, 1);
      }
    };
  }

  // Get local video track for rendering
  getLocalVideoTrack() {
    return this.localVideoTrack;
  }

  // Get remote user by UID
  getRemoteUser(uid) {
    return this.remoteUsers[uid];
  }

  // Get all remote users
  getAllRemoteUsers() {
    return Object.values(this.remoteUsers);
  }

  // Check if currently in a call
  isInCall() {
    return this.isJoined;
  }

  // Get current mute status
  getMuteStatus() {
    return this.isMuted;
  }

  // Get current video status
  getVideoStatus() {
    return this.isVideoEnabled;
  }
}

// Create and export a singleton instance
const videoCallService = new VideoCallService();
export default videoCallService;