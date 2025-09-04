import React, { useState, useEffect } from 'react';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

const SocketTest = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    socketId: null,
    reconnectAttempts: 0
  });
  const [testMessage, setTestMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Subscribe to connection changes
    const unsubscribeConnection = socketService.onConnectionChange((connected) => {
      setConnectionStatus(socketService.getConnectionStatus());
    });

    // Subscribe to messages
    const unsubscribeMessages = socketService.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    // Initial status
    setConnectionStatus(socketService.getConnectionStatus());

    return () => {
      unsubscribeConnection();
      unsubscribeMessages();
    };
  }, []);

  const handleConnect = () => {
    socketService.connect();
  };

  const handleDisconnect = () => {
    socketService.disconnect();
    setConnectionStatus(socketService.getConnectionStatus());
  };

  const handleTestConnection = () => {
    socketService.testConnection();
  };

  const handleSendTestMessage = () => {
    if (!testMessage.trim() || !receiverId.trim()) {
      toast.error('Please enter both message and receiver ID');
      return;
    }
    
    socketService.sendMessage(receiverId, testMessage);
    setTestMessage('');
  };

  const handleReconnect = () => {
    socketService.reconnect();
  };

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-700 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[#9afa00] mb-6">Socket Connection Test</h2>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 bg-[#232626] rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Connection Status</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-white">
              {connectionStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {connectionStatus.socketId && (
            <p className="text-gray-400 text-sm">
              Socket ID: {connectionStatus.socketId}
            </p>
          )}
          {connectionStatus.reconnectAttempts > 0 && (
            <p className="text-yellow-400 text-sm">
              Reconnect attempts: {connectionStatus.reconnectAttempts}
            </p>
          )}
        </div>
      </div>

      {/* Connection Controls */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleConnect}
            disabled={connectionStatus.connected}
            className="bg-[#9afa00] text-black px-4 py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7dd800] transition"
          >
            Connect
          </button>
          <button
            onClick={handleDisconnect}
            disabled={!connectionStatus.connected}
            className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition"
          >
            Disconnect
          </button>
          <button
            onClick={handleTestConnection}
            disabled={!connectionStatus.connected}
            className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition"
          >
            Test Connection
          </button>
          <button
            onClick={handleReconnect}
            className="bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold hover:bg-yellow-600 transition"
          >
            Reconnect
          </button>
        </div>
      </div>

      {/* Message Testing */}
      <div className="mb-6 p-4 bg-[#232626] rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Test Messaging</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Receiver User ID"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00]"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Test message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendTestMessage()}
              className="flex-1 bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00]"
            />
            <button
              onClick={handleSendTestMessage}
              disabled={!connectionStatus.connected}
              className="bg-[#9afa00] text-black px-4 py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7dd800] transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Received Messages */}
      {messages.length > 0 && (
        <div className="p-4 bg-[#232626] rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Received Messages</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className="bg-[#181c1a] p-2 rounded text-sm">
                <div className="text-[#9afa00] font-semibold">
                  From: {message.sender.id}
                </div>
                <div className="text-white">{message.content}</div>
                <div className="text-gray-400 text-xs">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocketTest;