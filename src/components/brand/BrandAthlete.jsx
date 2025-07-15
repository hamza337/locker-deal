import React, { useState } from 'react';
import { FaTiktok, FaFacebookF, FaInstagram, FaLock } from 'react-icons/fa';

const athletes = [
  {
    name: 'ALICE JANE',
    type: 'Other',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete1.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Athlete Runner',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete2.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Boxer',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete3.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Other',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete4.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Runner',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete5.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Cyclist',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete6.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Archer',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete7.jpg',
  },
  {
    name: 'ALICE JANE',
    type: 'Boxer',
    typeClass: 'text-[#9afa00]',
    location: 'Tucson, Arizona',
    img: '/athlete8.jpg',
  },
];

const BrandAthlete = () => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 md:gap-8 h-auto md:h-[calc(100vh-120px)] px-2 md:px-4">
      {/* Sidebar Filters (collapsible on mobile) */}
      <div className="md:w-64 w-full md:sticky md:top-24 flex-shrink-0 bg-transparent z-10 mb-4 md:mb-0">
        {/* Mobile: Filter toggle button */}
        <button
          className="md:hidden w-full bg-[#232626] text-[#9afa00] font-bold py-2 rounded-md mb-2 flex items-center justify-center gap-2"
          onClick={() => setShowFilters(v => !v)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        {/* Filters panel */}
        <div className={`transition-all duration-300 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="p-4 md:p-0">
            <input
              type="text"
              placeholder="Search by name"
              className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm"
            />
            <div className="mb-4 md:mb-6">
              <h3 className="text-[#9afa00] font-bold text-base md:text-lg mb-2 uppercase">Profile Filters</h3>
              <div className="flex flex-col gap-2 text-white">
                <label className="flex items-center gap-2 text-sm md:text-base"><input type="checkbox" className="accent-[#9afa00]" /> College</label>
                <label className="flex items-center gap-2 text-sm md:text-base"><input type="checkbox" className="accent-[#9afa00]" /> Professionals</label>
                <label className="flex items-center gap-2 text-sm md:text-base"><input type="checkbox" className="accent-[#9afa00]" /> High School</label>
              </div>
            </div>
            <div className="mb-6 md:mb-8">
              <h3 className="text-[#9afa00] font-bold text-base md:text-lg mb-2 uppercase">Type</h3>
              <div className="flex flex-col gap-2 text-white">
                <label className="flex items-center gap-2 text-sm md:text-base"><input type="checkbox" className="accent-[#9afa00]" /> Athlete</label>
                <label className="flex items-center gap-2 text-sm md:text-base"><input type="checkbox" className="accent-[#9afa00]" /> Footballer</label>
                <label className="flex items-center gap-2 text-sm md:text-base"><input type="checkbox" className="accent-[#9afa00]" /> Boxer</label>
                <label className="flex items-center gap-2 text-sm md:text-base"><input type="checkbox" className="accent-[#9afa00]" /> Runner</label>
                <label className="flex items-center gap-2 text-sm md:text-base"><input type="checkbox" className="accent-[#9afa00]" /> Swimmer</label>
                <label className="flex items-center gap-2 text-sm md:text-base"><input type="checkbox" className="accent-[#9afa00]" /> Boxer</label>
              </div>
            </div>
            <div className="bg-[#232626] rounded-lg p-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <FaLock className="text-[#9afa00] text-xl" />
                <span className="text-[#9afa00] font-bold uppercase text-sm md:text-md">Featured Locked</span>
              </div>
              <button className="mt-2 bg-[#9afa00] text-black font-bold px-4 md:px-6 py-2 rounded-md uppercase text-xs md:text-sm hover:bg-[#baff32] transition">Learn More</button>
            </div>
          </div>
        </div>
      </div>
      {/* Athlete Cards Grid */}
      <main className="flex-1 overflow-y-auto pr-0 md:pr-1">
        <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6 uppercase tracking-wide">Athletes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 pb-8">
          {athletes.map((athlete, idx) => (
            <div key={idx} className="bg-[#232626] rounded-xl p-3 md:p-4 flex flex-col items-center shadow-md border border-transparent hover:border-[#9afa00] transition min-w-0">
              <div className="w-full h-40 md:h-48 rounded-lg overflow-hidden mb-3 md:mb-4 bg-black flex items-center justify-center">
                <img src={athlete.img} alt={athlete.name} className="object-cover w-full h-full" />
              </div>
              <div className="w-full text-left">
                <div className="text-white font-bold text-base md:text-lg leading-tight">{athlete.name}</div>
                <div className={`font-bold text-sm md:text-md ${athlete.typeClass}`}>{athlete.type}</div>
                <div className="flex items-center gap-2 text-gray-300 text-xs md:text-sm mt-1 mb-2">
                  <svg className="w-4 h-4 text-[#9afa00]" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 9 7 9s7-3.75 7-9c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 10 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
                  {athlete.location}
                </div>
                <div className="flex gap-2 md:gap-3 mb-3 md:mb-4">
                  <a href="#" className="bg-[#181c1a] p-2 rounded-full"><FaTiktok className="text-[#9afa00] text-lg" /></a>
                  <a href="#" className="bg-[#181c1a] p-2 rounded-full"><FaFacebookF className="text-[#9afa00] text-lg" /></a>
                  <a href="#" className="bg-[#181c1a] p-2 rounded-full"><FaInstagram className="text-[#9afa00] text-lg" /></a>
                </div>
                <button className="w-full bg-[#9afa00] text-black font-bold py-2 rounded-md uppercase text-xs md:text-md hover:bg-[#baff32] transition">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BrandAthlete; 