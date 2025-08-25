import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaMicrophone, FaEllipsisV, FaBars, FaTimes, FaPaperclip, FaRobot, FaFileSignature, FaCalendarAlt, FaFilePdf, FaImage, FaPaperPlane, FaDownload } from 'react-icons/fa';

const chats = [
  {
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    name: 'Darack Bobama',
    message: 'Enter your message des...',
    time: '12:25',
    badge: 2,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    name: 'Darack Bobama',
    message: 'Enter your message des...',
    time: '12:25',
    badge: 1,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    name: 'Darack Bobama',
    message: 'Enter your message des...',
    time: '12:25',
    badge: 2,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    name: 'Darack Bobama',
    message: 'Enter your message des...',
    time: '12:25',
    badge: 0,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    name: 'Darack Bobama',
    message: 'Enter your message des...',
    time: '12:25',
    badge: 2,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    name: 'Darack Bobama',
    message: 'Enter your message des...',
    time: '12:25',
    badge: 0,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    name: 'Darack Bobama',
    message: 'Enter your message des...',
    time: '12:25',
    badge: 0,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
    name: 'Darack Bobama',
    message: 'Enter your message des...',
    time: '12:25',
    badge: 0,
  },
];

const initialMessages = [
  { id: 1, fromMe: false, text: 'Hello?', time: '12:15', type: 'text' },
  { id: 2, fromMe: false, text: 'Fine. WBU?', time: '12:15', type: 'text' },
  { id: 3, fromMe: false, text: 'Good.', time: '12:15', type: 'text' },
  { id: 4, fromMe: true, text: 'Hello! How are you?', time: '12:16', type: 'text' },
  { id: 5, fromMe: true, text: 'I am also fine.', time: '12:16', type: 'text' },
  { id: 6, fromMe: true, text: 'I am also fine.', time: '12:16', type: 'text' },
  { id: 7, fromMe: false, text: 'Here are some documents for review', time: '12:17', type: 'text' },
  { id: 8, fromMe: false, fileName: 'Contract_Agreement.pdf', fileSize: '2.4 MB', time: '12:17', type: 'document' },
  { id: 9, fromMe: false, fileName: 'NDA_Document.pdf', fileSize: '1.8 MB', time: '12:17', type: 'document' },
];

const chatDocuments = [
  { id: 1, name: 'Contract_Agreement.pdf', size: '2.4 MB', url: '/dummy-contract.pdf', needsSignature: true },
  { id: 2, name: 'NDA_Document.pdf', size: '1.8 MB', url: '/dummy-contract.pdf', needsSignature: true },
  { id: 3, name: 'Project_Proposal.pdf', size: '3.1 MB', url: '/dummy-contract.pdf', needsSignature: false },
];

const Inbox = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showDocuments, setShowDocuments] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [signatureStep, setSignatureStep] = useState('select'); // 'select', 'preview', 'sign', 'review', 'complete'
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState('');
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
  const [showSignatureOnDocument, setShowSignatureOnDocument] = useState(false);
  const canvasRef = useRef(null);
  const documentRef = useRef(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message function
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        fromMe: true,
        text: newMessage,
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const message = {
        id: Date.now(),
        fromMe: true,
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        type: file.type.includes('image') ? 'image' : 'document'
      };
      setMessages(prev => [...prev, message]);
    }
    event.target.value = '';
  };

  // Handle document signing
  const handleSignDocument = (document) => {
    setSelectedDocument(document);
    setShowSignatureModal(true);
    setShowDocuments(false);
    setSignatureStep('preview');
  };

  const getCanvasCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    if (e.touches && e.touches[0]) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(e, canvas);
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(e, canvas);
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    setSignature(signatureData);
    setSignatureStep('review');
  };

  const applySignatureToDocument = () => {
    setShowSignatureOnDocument(true);
    setSignatureStep('complete');
  };

  const resetSignatureModal = () => {
    setShowSignatureModal(false);
    setSelectedDocument(null);
    setSignatureStep('select');
    setSignature('');
    setShowSignatureOnDocument(false);
    if (canvasRef.current) {
      clearSignature();
    }
  };

  const handleSignaturePositioning = (e) => {
    if (documentRef.current && signature) {
      const rect = documentRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setSignaturePosition({ x, y });
    }
  };

  // Handle key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full h-full flex bg-transparent px-0 md:px-6 py-6 overflow-hidden">
      <div className="w-full max-w-6xl h-[80vh] bg-[rgba(0,0,0,0.3)] rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-lg min-w-0 mx-auto gap-0">
        {/* Sidebar (mobile overlay, md+ side) */}
        <div
          className={`fixed inset-0 z-40 bg-black bg-opacity-70 transition-opacity md:static md:bg-transparent md:z-0 ${sidebarOpen ? 'flex' : 'hidden'} md:flex`}
        >
          <div className="w-4/5 max-w-xs xl:max-w-sm min-w-[280px] bg-gradient-to-b from-[#1a2f14] to-[#0f1a0c] flex flex-col p-4 md:p-6 gap-4 h-full rounded-l-2xl md:rounded-l-2xl md:rounded-r-none rounded-r-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[#9afa00] text-lg md:text-xl font-bold">MY CHATS</h2>
              <button className="md:hidden text-white text-2xl" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
            </div>
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full rounded-lg bg-[#2a3622] text-white pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 placeholder-gray-400 text-sm border border-[#9afa00]/20 transition-all"
              />
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {chats.map((chat, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 px-3 rounded-xl mb-2 hover:bg-gradient-to-r hover:from-[#9afa00]/10 hover:to-[#9afa00]/5 cursor-pointer transition-all duration-200 border border-transparent hover:border-[#9afa00]/30 group mx-1">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      <img src={chat.avatar} alt={chat.name} className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 border-[#9afa00]/20 group-hover:border-[#9afa00]/50 transition-all" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#9afa00] rounded-full border-2 border-[#1a2f14]"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-semibold text-sm leading-tight truncate">{chat.name}</div>
                      <div className="text-gray-400 text-xs leading-tight truncate mt-1">{chat.message}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                    <span className="text-gray-400 text-xs font-medium">{chat.time}</span>
                    {chat.badge > 0 && (
                      <span className="bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-bold rounded-full px-2 py-0.5 text-xs shadow-lg min-w-[20px] text-center">{chat.badge}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Overlay click to close */}
          <div className="flex-1 md:hidden" onClick={() => setSidebarOpen(false)} />
        </div>
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-transparent min-w-0 h-full overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#232626] to-[#1a1f1a] px-4 md:px-6 py-4 md:py-5 sticky top-0 z-10 border-b border-[#9afa00]/20 shadow-lg rounded-tr-2xl">
            <div className="flex items-center gap-4 min-w-0">
              {/* Sidebar open button on mobile */}
              <button className="md:hidden text-white text-2xl hover:text-[#9afa00] transition-colors" onClick={() => setSidebarOpen(true)}><FaBars /></button>
              <div className="relative">
                <img src="https://randomuser.me/api/portraits/men/9.jpg" alt="User" className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover border-2 border-[#9afa00]/30" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#9afa00] rounded-full border-2 border-[#232626] animate-pulse"></div>
              </div>
              <div className="min-w-0">
                <div className="text-white font-bold text-base md:text-lg truncate">X Æ A-13b</div>
                <div className="text-[#9afa00] text-xs md:text-sm font-medium">Online now</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-gradient-to-r from-[#2a3622] to-[#1f2b1a] p-3 rounded-full hover:from-[#9afa00]/20 hover:to-[#9afa00]/10 transition-all duration-200 border border-[#9afa00]/20">
                <FaSearch className="text-[#9afa00] text-lg" />
              </button>
              <button className="bg-gradient-to-r from-[#2a3622] to-[#1f2b1a] p-3 rounded-full hover:from-[#9afa00]/20 hover:to-[#9afa00]/10 transition-all duration-200 border border-[#9afa00]/20">
                <FaEllipsisV className="text-white text-lg" />
              </button>
            </div>
          </div>
          {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 flex flex-col gap-1 bg-gradient-to-b from-transparent to-[#0a0f08]/30 min-w-0 h-0">
               <div className="text-center mb-4">
                 <span className="bg-[#232626] text-gray-300 text-xs px-4 py-2 rounded-full border border-[#9afa00]/20">24 April</span>
               </div>
               {messages.map((msg) => (
                 <div
                   key={msg.id}
                   className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'} mb-1`}
                 >
                   <div
                     className={`rounded-2xl px-3 md:px-4 py-2 md:py-3 max-w-[70%] md:max-w-[60%] text-sm md:text-base shadow-lg ${
                       msg.fromMe 
                         ? 'bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-medium' 
                         : 'bg-gradient-to-r from-[#232626] to-[#1a1f1a] text-white border border-[#9afa00]/20'
                     } transition-all hover:shadow-xl break-words`}
                   >
                     {msg.type === 'text' && (
                       <div className="flex items-end gap-2">
                         <span className="flex-1 leading-relaxed">{msg.text}</span>
                         <span className={`text-xs font-medium ${msg.fromMe ? 'text-black/70' : 'text-gray-400'} whitespace-nowrap flex-shrink-0`}>{msg.time}</span>
                       </div>
                     )}
                     {msg.type === 'document' && (
                       <div className="flex items-center gap-3">
                         <FaFilePdf className={`text-xl ${msg.fromMe ? 'text-red-600' : 'text-red-400'}`} />
                         <div className="flex-1">
                           <div className={`font-semibold ${msg.fromMe ? 'text-black' : 'text-white'}`}>{msg.fileName}</div>
                           <div className={`text-xs ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`}>{msg.fileSize}</div>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                           <button className={`p-1 rounded ${msg.fromMe ? 'hover:bg-black/10' : 'hover:bg-white/10'} transition-colors`}>
                             <FaDownload className={`text-sm ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`} />
                           </button>
                           <span className={`text-xs font-medium ${msg.fromMe ? 'text-black/70' : 'text-gray-400'} whitespace-nowrap`}>{msg.time}</span>
                         </div>
                       </div>
                     )}
                     {msg.type === 'image' && (
                       <div className="flex items-center gap-3">
                         <FaImage className={`text-xl ${msg.fromMe ? 'text-blue-600' : 'text-blue-400'}`} />
                         <div className="flex-1">
                           <div className={`font-semibold ${msg.fromMe ? 'text-black' : 'text-white'}`}>{msg.fileName}</div>
                           <div className={`text-xs ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`}>{msg.fileSize}</div>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                           <button className={`p-1 rounded ${msg.fromMe ? 'hover:bg-black/10' : 'hover:bg-white/10'} transition-colors`}>
                             <FaDownload className={`text-sm ${msg.fromMe ? 'text-black/70' : 'text-gray-400'}`} />
                           </button>
                           <span className={`text-xs font-medium ${msg.fromMe ? 'text-black/70' : 'text-gray-400'} whitespace-nowrap`}>{msg.time}</span>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               ))}
               <div ref={messagesEndRef} />
             </div>
          {/* Chat Input */}
           <div className="px-4 md:px-6 py-4 md:py-5 bg-gradient-to-r from-[#232626] to-[#1a1f1a] border-t border-[#9afa00]/20 flex items-center gap-3 relative flex-shrink-0 rounded-br-2xl">
            <div className="relative" ref={dropdownRef}>
               <button 
                 onClick={() => setShowDropdown(!showDropdown)}
                 className="bg-gradient-to-r from-[#2a3622] to-[#1f2b1a] p-3 rounded-full hover:from-[#9afa00]/20 hover:to-[#9afa00]/10 transition-all duration-200 border border-[#9afa00]/20"
               >
                 <FaEllipsisV className="text-[#9afa00] text-lg" />
               </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute bottom-full left-0 mb-2 bg-gradient-to-b from-[#232626] to-[#1a1f1a] rounded-xl shadow-2xl border border-[#9afa00]/30 py-2 min-w-[200px] z-50">
                  <button 
                    onClick={() => {setShowDropdown(false); /* GPT functionality - static for now */}}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#9afa00]/10 transition-all text-left"
                  >
                    <FaRobot className="text-[#9afa00]" />
                    <span>GPT</span>
                  </button>
                  <button 
                    onClick={() => {setShowDropdown(false); setShowSignatureModal(true);}}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#9afa00]/10 transition-all text-left"
                  >
                    <FaFileSignature className="text-[#9afa00]" />
                    <span>Sign a document</span>
                  </button>
                  <button 
                    onClick={() => {setShowDropdown(false); /* Meeting scheduling - static for now */}}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#9afa00]/10 transition-all text-left"
                  >
                    <FaCalendarAlt className="text-[#9afa00]" />
                    <span>Schedule a meeting</span>
                  </button>
                  <button 
                    onClick={() => {setShowDropdown(false); fileInputRef.current?.click();}}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#9afa00]/10 transition-all text-left"
                  >
                    <FaPaperclip className="text-[#9afa00]" />
                    <span>Attachments</span>
                  </button>
                </div>
              )}
            </div>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent border border-[#9afa00]/30 rounded-xl px-4 md:px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9afa00]/50 focus:border-[#9afa00] text-sm md:text-base transition-all"
            />
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileUpload}
            />
            
            <button 
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-[#9afa00] to-[#7dd800] p-3 rounded-full flex items-center justify-center hover:from-[#7dd800] hover:to-[#6bc700] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane className="text-black text-lg" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#232626] to-[#1a1f1a] rounded-2xl border border-[#9afa00]/30 w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#9afa00]/20">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white">Document Signature</h2>
                <div className="flex items-center gap-2">
                   <div className={`w-3 h-3 rounded-full ${
                     signatureStep === 'preview' ? 'bg-[#9afa00]' : 
                     ['sign', 'review', 'complete'].includes(signatureStep) ? 'bg-[#9afa00]' : 'bg-gray-600'
                   }`}></div>
                   <div className="w-6 h-0.5 bg-gray-600"></div>
                   <div className={`w-3 h-3 rounded-full ${
                     signatureStep === 'sign' ? 'bg-[#9afa00]' : 
                     ['review', 'complete'].includes(signatureStep) ? 'bg-[#9afa00]' : 'bg-gray-600'
                   }`}></div>
                   <div className="w-6 h-0.5 bg-gray-600"></div>
                   <div className={`w-3 h-3 rounded-full ${
                     signatureStep === 'review' ? 'bg-[#9afa00]' : 
                     signatureStep === 'complete' ? 'bg-[#9afa00]' : 'bg-gray-600'
                   }`}></div>
                   <div className="w-6 h-0.5 bg-gray-600"></div>
                   <div className={`w-3 h-3 rounded-full ${
                     signatureStep === 'complete' ? 'bg-[#9afa00]' : 'bg-gray-600'
                   }`}></div>
                 </div>
              </div>
              <button 
                onClick={resetSignatureModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Step 1: Document Selection */}
              {signatureStep === 'select' && (
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-semibold mb-4">Select a document to sign:</h3>
                  <div className="space-y-2">
                    {chatDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleSignDocument(doc)}
                        className="w-full flex items-center gap-4 p-4 bg-[#2a3622]/20 hover:bg-[#2a3622]/40 rounded-xl border border-[#9afa00]/20 transition-all text-left"
                      >
                        <FaFilePdf className="text-red-400 text-xl" />
                        <div className="flex-1">
                          <div className="text-white font-semibold">{doc.name}</div>
                          <div className="text-gray-400 text-sm">{doc.size}</div>
                        </div>
                        {doc.needsSignature && (
                          <div className="bg-[#9afa00]/20 text-[#9afa00] text-xs px-2 py-1 rounded-full">
                            Needs Signature
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Document Preview */}
              {signatureStep === 'preview' && selectedDocument && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-[#2a3622]/30 rounded-xl border border-[#9afa00]/20">
                    <FaFilePdf className="text-red-400 text-2xl" />
                    <div>
                      <div className="text-white font-semibold">{selectedDocument.name}</div>
                      <div className="text-gray-400 text-sm">{selectedDocument.size}</div>
                    </div>
                  </div>
                  
                  <div className="bg-[#2a3622]/20 rounded-xl p-6 border border-[#9afa00]/20 min-h-[500px]">
                     <div className="text-center mb-6">
                       <h3 className="text-white text-xl font-semibold mb-2">Document Preview</h3>
                       <p className="text-gray-400">Review the document before signing</p>
                     </div>
                     
                     {/* Mock Document Content */}
                     <div ref={documentRef} className="bg-white rounded-lg p-8 text-black min-h-[400px] shadow-lg relative">
                       <div className="text-center mb-6">
                         <h2 className="text-2xl font-bold mb-2">SERVICE AGREEMENT</h2>
                         <p className="text-gray-600">Contract No: {selectedDocument.name.split('.')[0]}</p>
                       </div>
                       
                       <div className="space-y-4 text-sm leading-relaxed">
                         <p><strong>PARTIES:</strong> This agreement is between LockerDeal Inc. ("Company") and the Client ("Client").</p>
                         
                         <p><strong>SERVICES:</strong> Company agrees to provide digital signature and document management services as outlined in the attached specifications.</p>
                         
                         <p><strong>TERMS:</strong> This agreement shall commence on the date of signature and remain in effect for a period of twelve (12) months, unless terminated earlier in accordance with the terms herein.</p>
                         
                         <p><strong>PAYMENT:</strong> Client agrees to pay the fees as specified in Schedule A, attached hereto and incorporated by reference.</p>
                         
                         <div className="mt-8 pt-4 border-t border-gray-300">
                           <div className="flex justify-between items-center">
                             <div className="relative">
                               <p className="font-semibold">Client Signature:</p>
                               <div className="w-64 h-16 border-b-2 border-gray-400 mt-2 flex items-end relative">
                                 {showSignatureOnDocument && signature ? (
                                   <img 
                                     src={signature} 
                                     alt="Client signature" 
                                     className="absolute bottom-0 left-0 h-12 w-auto max-w-full object-contain"
                                   />
                                 ) : (
                                   <span className="text-red-500 font-semibold">⚠ SIGNATURE REQUIRED</span>
                                 )}
                               </div>
                             </div>
                             <div className="text-right">
                               <p className="font-semibold">Date:</p>
                               <p className="mt-2">{new Date().toLocaleDateString()}</p>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSignatureStep('select')}
                      className="flex-1 bg-[#232626] text-white font-semibold py-3 px-6 rounded-xl border border-[#9afa00]/20 hover:bg-[#9afa00]/10 transition-all"
                    >
                      Back to Documents
                    </button>
                    <button 
                      onClick={() => setSignatureStep('sign')}
                      className="flex-1 bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
                    >
                      Proceed to Sign
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Signature Canvas */}
              {signatureStep === 'sign' && selectedDocument && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-white text-xl font-semibold mb-2">Sign the Document</h3>
                    <p className="text-gray-400">Draw your signature in the box below</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border border-[#9afa00]/20">
                    <div className="text-center mb-4">
                      <p className="text-black font-semibold">Signature Area</p>
                      <p className="text-gray-600 text-sm">Use your mouse or touch to draw your signature</p>
                    </div>
                    
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair block mx-auto"
                      style={{ 
                        width: '100%', 
                        maxWidth: '600px', 
                        height: '200px',
                        touchAction: 'none'
                      }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    
                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={clearSignature}
                        className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-all"
                      >
                        Clear Signature
                      </button>
                      <button 
                        onClick={saveSignature}
                        className="flex-1 bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
                      >
                        Apply Signature
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSignatureStep('preview')}
                      className="flex-1 bg-[#232626] text-white font-semibold py-3 px-6 rounded-xl border border-[#9afa00]/20 hover:bg-[#9afa00]/10 transition-all"
                    >
                      Back to Preview
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {signatureStep === 'review' && selectedDocument && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-white text-xl font-semibold mb-2">Review Document</h3>
                    <p className="text-gray-400">Please review the document with your signature applied</p>
                  </div>
                  
                  <div className="bg-[#2a3622]/20 rounded-xl p-6 border border-[#9afa00]/20 min-h-[500px]">
                    {/* Mock Document Content with Signature */}
                    <div className="bg-white rounded-lg p-8 text-black min-h-[400px] shadow-lg relative">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">SERVICE AGREEMENT</h2>
                        <p className="text-gray-600">Contract No: {selectedDocument.name.split('.')[0]}</p>
                      </div>
                      
                      <div className="space-y-4 text-sm leading-relaxed">
                        <p><strong>PARTIES:</strong> This agreement is between LockerDeal Inc. ("Company") and the Client ("Client").</p>
                        
                        <p><strong>SERVICES:</strong> Company agrees to provide digital signature and document management services as outlined in the attached specifications.</p>
                        
                        <p><strong>TERMS:</strong> This agreement shall commence on the date of signature and remain in effect for a period of twelve (12) months, unless terminated earlier in accordance with the terms herein.</p>
                        
                        <p><strong>PAYMENT:</strong> Client agrees to pay the fees as specified in Schedule A, attached hereto and incorporated by reference.</p>
                        
                        <div className="mt-8 pt-4 border-t border-gray-300">
                          <div className="flex justify-between items-center">
                            <div className="relative">
                              <p className="font-semibold">Client Signature:</p>
                              <div className="w-64 h-16 border-b-2 border-gray-400 mt-2 flex items-end relative">
                                {signature ? (
                                  <img 
                                    src={signature} 
                                    alt="Client signature" 
                                    className="absolute bottom-0 left-0 h-12 w-auto max-w-full object-contain"
                                  />
                                ) : (
                                  <span className="text-red-500 font-semibold">⚠ SIGNATURE REQUIRED</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">Date:</p>
                              <p className="mt-2">{new Date().toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSignatureStep('sign')}
                      className="flex-1 bg-[#232626] text-white font-semibold py-3 px-6 rounded-xl border border-[#9afa00]/20 hover:bg-[#9afa00]/10 transition-all"
                    >
                      Edit Signature
                    </button>
                    <button 
                      onClick={applySignatureToDocument}
                      className="flex-1 bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
                    >
                      Approve & Complete
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Completion */}
              {signatureStep === 'complete' && selectedDocument && (
                <div className="space-y-6 text-center">
                  <div className="bg-[#2a3622]/30 rounded-xl p-8 border border-[#9afa00]/20">
                    <div className="w-20 h-20 bg-[#9afa00] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    <h3 className="text-white text-2xl font-bold mb-2">Document Signed Successfully!</h3>
                    <p className="text-gray-400 mb-6">Your signature has been applied to {selectedDocument.name}</p>
                    
                    {signature && (
                      <div className="bg-white rounded-lg p-4 mb-6">
                        <p className="text-black font-semibold mb-2">Your Signature:</p>
                        <img src={signature} alt="Your signature" className="mx-auto border border-gray-300 rounded" />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <button className="w-full bg-gradient-to-r from-[#9afa00] to-[#7dd800] text-black font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all">
                        Download Signed Document
                      </button>
                      <button className="w-full bg-[#232626] text-white font-semibold py-3 px-6 rounded-xl border border-[#9afa00]/20 hover:bg-[#9afa00]/10 transition-all">
                        Email Signed Document
                      </button>
                      <button 
                        onClick={resetSignatureModal}
                        className="w-full bg-transparent text-[#9afa00] font-semibold py-3 px-6 rounded-xl border border-[#9afa00]/20 hover:bg-[#9afa00]/10 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;