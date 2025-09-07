import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaTimes } from 'react-icons/fa';
import videoCallService from '../../services/videoCallService';
import toast from 'react-hot-toast';

const VideoCall = ({ 
  isOpen, 
  onClose, 
  callType, // 'incoming', 'outgoing', 'active'
  callerName,
  callerId,
  onAccept,
  onReject,
  channelName
}) => {
  const [callState, setCallState] = useState(callType); // 'incoming', 'outgoing', 'active', 'ended'
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const callStartTime = useRef(null);
  const durationInterval = useRef(null);

  // Initialize video call service and set up event listeners
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribeUserEvents = videoCallService.onUserEvent((eventType, user, mediaType) => {
      console.log('📹 Video call user event:', eventType, user?.uid, mediaType);
      
      switch (eventType) {
        case 'user-joined':
          setRemoteUsers(prev => {
            const exists = prev.find(u => u.uid === user.uid);
            if (!exists) {
              return [...prev, user];
            }
            return prev;
          });
          break;
          
        case 'user-left':
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
          break;
          
        case 'user-published':
          if (mediaType === 'video') {
            // Play remote video
            const remoteVideoTrack = user.videoTrack;
            if (remoteVideoTrack && remoteVideoRefs.current[user.uid]) {
              remoteVideoTrack.play(remoteVideoRefs.current[user.uid]);
            }
          }
          if (mediaType === 'audio') {
            // Play remote audio
            const remoteAudioTrack = user.audioTrack;
            if (remoteAudioTrack) {
              remoteAudioTrack.play();
            }
          }
          break;
          
        case 'user-unpublished':
          if (mediaType === 'video' && remoteVideoRefs.current[user.uid]) {
            // Stop playing remote video
            const videoElement = remoteVideoRefs.current[user.uid];
            if (videoElement) {
              videoElement.srcObject = null;
            }
          }
          break;
      }
    });

    return () => {
      unsubscribeUserEvents();
    };
  }, [isOpen]);

  // Handle local video display
  useEffect(() => {
    if (callState === 'active' && localVideoRef.current) {
      const localVideoTrack = videoCallService.getLocalVideoTrack();
      if (localVideoTrack) {
        localVideoTrack.play(localVideoRef.current);
      }
    }
  }, [callState]);

  // Call duration timer
  useEffect(() => {
    if (callState === 'active' && !callStartTime.current) {
      callStartTime.current = Date.now();
      durationInterval.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }, 1000);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    };
  }, [callState]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle accepting incoming call
  const handleAcceptCall = async () => {
    try {
      setCallState('connecting');
      const success = await videoCallService.joinCall(channelName);
      if (success) {
        setCallState('active');
        if (onAccept) onAccept();
        toast.success('Call connected!');
      } else {
        setCallState('ended');
        toast.error('Failed to connect call');
      }
    } catch (error) {
      console.error('❌ Failed to accept call:', error);
      setCallState('ended');
      toast.error('Failed to accept call');
    }
  };

  // Handle rejecting incoming call
  const handleRejectCall = () => {
    setCallState('ended');
    if (onReject) onReject();
    toast.success('Call rejected');
    setTimeout(() => onClose(), 1000);
  };

  // Handle hanging up call
  const handleHangUp = async () => {
    try {
      await videoCallService.leaveCall();
      setCallState('ended');
      toast.success('Call ended');
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error('❌ Failed to hang up call:', error);
      setCallState('ended');
      setTimeout(() => onClose(), 1000);
    }
  };

  // Handle mute toggle
  const handleToggleMute = async () => {
    const muted = await videoCallService.toggleMute();
    setIsMuted(muted);
  };

  // Handle video toggle
  const handleToggleVideo = async () => {
    const videoEnabled = await videoCallService.toggleVideo();
    setIsVideoEnabled(videoEnabled);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-[#1a1d1a] rounded-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden border border-[#9afa00]/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#9afa00]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#9afa00] rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">
                {callerName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{callerName || 'Unknown User'}</h3>
              <p className="text-gray-400 text-sm">
                {callState === 'incoming' && 'Incoming call...'}
                {callState === 'outgoing' && 'Calling...'}
                {callState === 'connecting' && 'Connecting...'}
                {callState === 'active' && formatDuration(callDuration)}
                {callState === 'ended' && 'Call ended'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-400 text-lg" />
          </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          {callState === 'active' ? (
            <>
              {/* Remote Video(s) */}
              <div className="w-full h-full flex items-center justify-center">
                {remoteUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4">
                    {remoteUsers.map((user) => (
                      <div key={user.uid} className="relative bg-gray-800 rounded-lg overflow-hidden">
                        <video
                          ref={(el) => {
                            if (el) remoteVideoRefs.current[user.uid] = el;
                          }}
                          className="w-full h-full object-cover"
                          autoPlay
                          playsInline
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                          User {user.uid}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-[#9afa00] rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-black font-bold text-3xl">
                          {callerName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <p className="text-gray-400">Waiting for {callerName} to join...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-[#9afa00]/30">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 px-1 py-0.5 rounded text-white text-xs">
                  You
                </div>
              </div>
            </>
          ) : (
            /* Call Status Screen */
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-32 h-32 bg-[#9afa00] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-black font-bold text-4xl">
                    {callerName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="text-white text-2xl font-semibold mb-2">{callerName || 'Unknown User'}</h2>
                <p className="text-gray-400 text-lg">
                  {callState === 'incoming' && 'Incoming video call'}
                  {callState === 'outgoing' && 'Calling...'}
                  {callState === 'connecting' && 'Connecting...'}
                  {callState === 'ended' && 'Call ended'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-[#9afa00]/20">
          <div className="flex items-center justify-center gap-4">
            {callState === 'incoming' ? (
              /* Incoming Call Controls */
              <>
                <button
                  onClick={handleRejectCall}
                  className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <FaPhoneSlash className="text-white text-xl" />
                </button>
                <button
                  onClick={handleAcceptCall}
                  className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <FaPhone className="text-white text-xl" />
                </button>
              </>
            ) : callState === 'active' ? (
              /* Active Call Controls */
              <>
                <button
                  onClick={handleToggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {isMuted ? (
                    <FaMicrophoneSlash className="text-white text-lg" />
                  ) : (
                    <FaMicrophone className="text-white text-lg" />
                  )}
                </button>
                
                <button
                  onClick={handleToggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    !isVideoEnabled 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {isVideoEnabled ? (
                    <FaVideo className="text-white text-lg" />
                  ) : (
                    <FaVideoSlash className="text-white text-lg" />
                  )}
                </button>
                
                <button
                  onClick={handleHangUp}
                  className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <FaPhoneSlash className="text-white text-xl" />
                </button>
              </>
            ) : callState === 'outgoing' ? (
              /* Outgoing Call Controls */
              <button
                onClick={handleHangUp}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <FaPhoneSlash className="text-white text-xl" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;