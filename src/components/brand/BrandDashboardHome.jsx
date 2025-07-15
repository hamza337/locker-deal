import React, { useState } from 'react';
import { FaSearch, FaBullhorn, FaStamp, FaSyncAlt } from 'react-icons/fa';

const actionCards = [
  {
    icon: <FaSearch className="text-[#9afa00] text-4xl md:text-5xl mb-4" />,
    label: 'SEARCH ATHLETE',
  },
  {
    icon: <FaBullhorn className="text-[#9afa00] text-4xl md:text-5xl mb-4" />,
    label: 'CAMPAIGNS',
  },
  {
    icon: <FaStamp className="text-[#9afa00] text-4xl md:text-5xl mb-4" />,
    label: 'CONTRACTS',
  },
];

const BrandDashboardHome = () => {
  const [tab, setTab] = useState('inbox');
  const [showUnread, setShowUnread] = useState(false);

  return (
    <div className="w-full px-2 md:px-4">
      {/* Action Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 mt-2">
        {actionCards.map(card => (
          <div
            key={card.label}
            className="flex flex-col items-center justify-center border border-[#9afa00] rounded-lg py-8 md:py-12 px-4 bg-transparent hover:shadow-[0_0_24px_6px_#9afa00] transition-shadow cursor-pointer min-w-0"
          >
            {card.icon}
            <span className="text-white font-bold text-lg md:text-2xl mt-2 tracking-wide text-center break-words w-full">{card.label}</span>
          </div>
        ))}
      </div>
      {/* Feedback Link */}
      <div className="mb-4 md:mb-8">
        <a href="#" className="text-[#9afa00] font-bold uppercase text-sm md:text-md hover:underline">Give Feedback on Locker Deak AI</a>
      </div>
      {/* Updates Section */}
      <div className="w-full">
        <h2 className="text-white text-xl md:text-2xl font-bold mb-4">UPDATES</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-2">
          {/* Tabs */}
          <div className="flex gap-4 md:gap-6 items-end mb-2 md:mb-0">
            <button
              className={`text-base md:text-lg font-bold ${tab === 'inbox' ? 'text-[#9afa00]' : 'text-white'} pb-1 border-b-4 ${tab === 'inbox' ? 'border-[#9afa00]' : 'border-transparent'}`}
              onClick={() => setTab('inbox')}
            >
              Inbox
            </button>
            <button
              className={`text-base md:text-lg font-bold ${tab === 'all' ? 'text-[#9afa00]' : 'text-white'} pb-1 border-b-4 ${tab === 'all' ? 'border-[#9afa00]' : 'border-transparent'}`}
              onClick={() => setTab('all')}
            >
              All
            </button>
          </div>
          {/* Refresh Button */}
          <button className="bg-[#232626] p-2 md:p-3 rounded-md flex items-center justify-center hover:bg-[#2a3622] transition w-fit self-end md:self-auto">
            <FaSyncAlt className="text-[#9afa00] text-lg md:text-xl" />
          </button>
        </div>
        <hr className="border-gray-600 mb-4 md:mb-6" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-6">
          <button className="bg-[#232626] text-white px-6 md:px-8 py-2 md:py-3 rounded-md font-bold text-base md:text-lg hover:bg-[#2a3622] transition w-full md:w-auto">Mark all as read</button>
          <label className="flex items-center gap-2 text-white text-base md:text-lg cursor-pointer w-full md:w-auto">
            <input
              type="checkbox"
              checked={showUnread}
              onChange={e => setShowUnread(e.target.checked)}
              className="form-checkbox h-5 w-5 text-[#9afa00] rounded"
            />
            Show unread notifications only
          </label>
        </div>
        <div className="text-white text-base md:text-lg mt-2">There are updates right now. You’re all set!</div>
      </div>
    </div>
  );
};

export default BrandDashboardHome; 