import React from 'react';
import { FaSearch, FaMicrophone, FaEllipsisV } from 'react-icons/fa';

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

const messages = [
  { fromMe: false, text: 'Hello?', time: '12:15' },
  { fromMe: false, text: 'Fine. WBU?', time: '12:15' },
  { fromMe: false, text: 'Good.', time: '12:15' },
  { fromMe: true, text: 'Hello! How are you?', time: '12:16' },
  { fromMe: true, text: 'I am also fine.', time: '12:16' },
  { fromMe: true, text: 'I am also fine.', time: '12:16' },
];

const Inbox = () => {
  return (
    <div className="w-full min-h-[100vh-128px] flex items-center justify-center bg-transparent px-0 md:px-6">
      <div className="w-full max-w-8xl h-[85vh] bg-[rgba(0,0,0,0.3)] rounded-2xl flex overflow-hidden shadow-lg">
        {/* Sidebar */}
        <div className="w-1/3 min-w-[260px] max-w-xs bg-[#1d2a16] flex flex-col p-6 gap-4">
          <h2 className="text-[#9afa00] text-xl font-bold mb-2">MY CHATS</h2>
          <input
            type="text"
            placeholder="Search here"
            className="w-full rounded-md bg-[#2a3622] text-white px-4 py-2 mb-4 focus:outline-none placeholder-gray-400"
          />
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {chats.map((chat, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-2 rounded-lg mb-1 hover:bg-[#232626] cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-white font-bold text-sm leading-tight">{chat.name}</div>
                    <div className="text-gray-300 text-xs leading-tight">{chat.message}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 min-w-[36px]">
                  <span className="text-gray-300 text-xs">{chat.time}</span>
                  {chat.badge > 0 && (
                    <span className="bg-[#9afa00] text-black font-bold rounded-full px-2 py-0.5 text-xs">{chat.badge}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-transparent">
          {/* Chat Header */}
          <div className="flex items-center justify-between bg-[#232626] px-6 py-4">
            <div className="flex items-center gap-3">
              <img src="https://randomuser.me/api/portraits/men/9.jpg" alt="User" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="text-white font-bold text-base">X Æ A-13b</div>
                <div className="text-gray-400 text-xs">Last seen 7h ago</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-[#2a3622] p-2 rounded-full"><FaSearch className="text-[#9afa00] text-lg" /></button>
              <button className="bg-[#2a3622] p-2 rounded-full"><FaEllipsisV className="text-white text-lg" /></button>
            </div>
          </div>
          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2 bg-transparent">
            <div className="text-center text-gray-400 text-xs mb-4">24 April</div>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs md:max-w-md text-sm md:text-base ${msg.fromMe ? 'bg-[#2a3622] text-white' : 'bg-[#232626] text-white'} flex items-end gap-2`}
                >
                  <span>{msg.text}</span>
                  <span className="text-gray-400 text-xs ml-2">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Chat Input */}
          <div className="px-6 py-4 bg-transparent border-t border-[#232626] flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message here"
              className="flex-1 bg-transparent border border-white rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
            />
            <button className="bg-[#9afa00] p-3 rounded-full flex items-center justify-center">
              <FaMicrophone className="text-black text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;