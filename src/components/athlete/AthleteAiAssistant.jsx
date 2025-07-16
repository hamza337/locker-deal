import React, { useState } from 'react';
import { FaUserCircle, FaBars, FaTimes, FaPaperPlane } from 'react-icons/fa';

const chatList = [
  { id: 1, title: 'How to improve my speed?', avatar: '', last: 'You: Try interval training!', time: 'Today' },
  { id: 2, title: 'Brand deal tips', avatar: '', last: 'AI: Here are 5 tips...', time: 'Yesterday' },
  { id: 3, title: 'Nutrition advice', avatar: '', last: 'You: What to eat before a match?', time: '2d ago' },
];

const messages = [
  { fromMe: false, text: 'Hi! How can I help you today?', time: '09:00' },
  { fromMe: true, text: 'How can I improve my sprint speed?', time: '09:01' },
  { fromMe: false, text: 'Try interval training and focus on form. Would you like a sample workout?', time: '09:02' },
  { fromMe: true, text: 'Yes, please!', time: '09:03' },
];

const AthleteAiAssistant = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');

  return (
    <div className="w-full flex flex-col md:flex-row h-[80vh] md:h-[75vh] bg-transparent rounded-xl overflow-hidden shadow-lg min-w-0">
      {/* Chat List Sidebar */}
      <div className={`fixed inset-0 z-40 bg-black bg-opacity-70 transition-opacity md:static md:bg-transparent md:z-0 ${sidebarOpen ? 'flex' : 'hidden'} md:flex`}>
        <div className="w-4/5 max-w-xs min-w-[200px] bg-[#181c1a] flex flex-col p-4 gap-4 h-full md:rounded-none rounded-r-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#9afa00] text-lg font-bold">AI CHATS</h2>
            <button className="md:hidden text-white text-2xl" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chatList.map(chat => (
              <div key={chat.id} className="flex items-center gap-3 py-3 px-2 rounded-lg mb-1 hover:bg-[#232626] cursor-pointer transition">
                <div className="bg-[#232626] rounded-full w-10 h-10 flex items-center justify-center">
                  <FaUserCircle className="text-[#9afa00] text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm truncate">{chat.title}</div>
                  <div className="text-gray-400 text-xs truncate">{chat.last}</div>
                </div>
                <span className="text-gray-500 text-xs ml-2 whitespace-nowrap">{chat.time}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Overlay click to close */}
        <div className="flex-1 md:hidden" onClick={() => setSidebarOpen(false)} />
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#101312] min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between bg-[#232626] px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar open button on mobile */}
            <button className="md:hidden text-white text-2xl mr-2" onClick={() => setSidebarOpen(true)}><FaBars /></button>
            <div className="bg-[#232626] rounded-full w-10 h-10 flex items-center justify-center">
              <FaUserCircle className="text-[#9afa00] text-2xl" />
            </div>
            <div className="min-w-0">
              <div className="text-white font-bold text-base truncate">AI Assistant</div>
              <div className="text-gray-400 text-xs">Online</div>
            </div>
          </div>
        </div>
        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2 bg-transparent min-w-0">
          <div className="text-center text-gray-400 text-xs mb-4">Today</div>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80vw] md:max-w-lg text-sm md:text-base ${msg.fromMe ? 'bg-[#2a3622] text-white' : 'bg-[#232626] text-white'} flex items-end gap-2`}
              >
                <span>{msg.text}</span>
                <span className="text-gray-400 text-xs ml-2">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Chat Input */}
        <form className="px-3 py-3 bg-transparent border-t border-[#232626] flex items-center gap-2" onSubmit={e => { e.preventDefault(); setInput(''); }}>
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-transparent border border-white rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none text-sm md:text-base"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="bg-[#9afa00] p-3 rounded-full flex items-center justify-center">
            <FaPaperPlane className="text-black text-lg" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AthleteAiAssistant; 