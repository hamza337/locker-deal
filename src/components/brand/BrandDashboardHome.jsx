import React, { useState } from 'react';
import { FaSearch, FaBullhorn, FaStamp, FaSyncAlt } from 'react-icons/fa';

const actionCards = [
  {
    icon: <FaSearch className="text-[#9afa00] text-5xl mb-4" />,
    label: 'SEARCH ATHLETE',
  },
  {
    icon: <FaBullhorn className="text-[#9afa00] text-5xl mb-4" />,
    label: 'CAMPAIGNS',
  },
  {
    icon: <FaStamp className="text-[#9afa00] text-5xl mb-4" />,
    label: 'CONTRACTS',
  },
];

const BrandDashboardHome = () => {
  const [tab, setTab] = useState('inbox');
  const [showUnread, setShowUnread] = useState(false);

  return (
    <div className="w-full">
      {/* Action Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 mt-2">
        {actionCards.map(card => (
          <div
            key={card.label}
            className="flex flex-col items-center justify-center border border-[#9afa00] rounded-lg py-12 px-4 bg-transparent hover:shadow-[0_0_24px_6px_#9afa00] transition-shadow cursor-pointer"
          >
            {card.icon}
            <span className="text-white font-bold text-xl md:text-2xl mt-2 tracking-wide">{card.label}</span>
          </div>
        ))}
      </div>
      {/* Feedback Link */}
      <div className="mb-8">
        <a href="#" className="text-[#9afa00] font-bold uppercase text-md hover:underline">Give Feedback on Locker Deak AI</a>
      </div>
      {/* Updates Section */}
      <div className="w-full">
        <h2 className="text-white text-2xl font-bold mb-4">UPDATES</h2>
        <div className="flex items-center justify-between mb-2">
          {/* Tabs */}
          <div className="flex gap-6 items-end">
            <button
              className={`text-lg font-bold ${tab === 'inbox' ? 'text-[#9afa00]' : 'text-white'} pb-1 border-b-4 ${tab === 'inbox' ? 'border-[#9afa00]' : 'border-transparent'}`}
              onClick={() => setTab('inbox')}
            >
              Inbox
            </button>
            <button
              className={`text-lg font-bold ${tab === 'all' ? 'text-[#9afa00]' : 'text-white'} pb-1 border-b-4 ${tab === 'all' ? 'border-[#9afa00]' : 'border-transparent'}`}
              onClick={() => setTab('all')}
            >
              All
            </button>
          </div>
          {/* Refresh Button */}
          <button className="bg-[#232626] p-3 rounded-md flex items-center justify-center hover:bg-[#2a3622] transition">
            <FaSyncAlt className="text-[#9afa00] text-xl" />
          </button>
        </div>
        <hr className="border-gray-600 mb-6" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <button className="bg-[#232626] text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-[#2a3622] transition w-full md:w-auto">Mark all as read</button>
          <label className="flex items-center gap-2 text-white text-lg cursor-pointer">
            <input
              type="checkbox"
              checked={showUnread}
              onChange={e => setShowUnread(e.target.checked)}
              className="form-checkbox h-5 w-5 text-[#9afa00] rounded"
            />
            Show unread notifications only
          </label>
        </div>
        <div className="text-white text-lg mt-2">There are updates right now. You’re all set!</div>
      </div>
    </div>
  );
};

export default BrandDashboardHome; 