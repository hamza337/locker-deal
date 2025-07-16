import React, { useState } from 'react';
import { FaTiktok, FaFacebookF, FaInstagram, FaLock, FaTrophy, FaBriefcase, FaTimes } from 'react-icons/fa';

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
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('bronze');
  const [payAnnually, setPayAnnually] = useState(false);

  const plans = [
    {
      key: 'bronze',
      label: 'BRONZE',
      price: '$500 per month',
      icon: <FaTrophy className="text-[#9afa00] text-4xl" />,
      features: [
        '15% Transaction fee.',
        'Access to all athletes',
        'Direct Campaigns',
      ],
      details: 'Annual Commitment',
      moreDetails: ['15% Transaction fee.', 'Access to all athletes', 'Direct Campaigns'],
    },
    {
      key: 'silver',
      label: 'SILVER',
      price: '$500 per month',
      icon: <FaTrophy className="text-gray-300 text-4xl" />,
      features: [
        '10% Transaction fee.',
        'Tier 1 Support',
        'Direct Campaigns',
        'Open Campaigns',
        'Access to all athletes',
        'Product Campaigns',
      ],
      details: 'Annual Commitment',
      moreDetails: ['10% Transaction fee.', 'Tier 1 Support', 'Direct Campaigns', 'Open Campaigns', 'Access to all athletes', 'Product Campaigns'],
    },
    {
      key: 'icon',
      label: 'STAND ALONE',
      price: '$500 per month',
      icon: <FaBriefcase className="text-[#9afa00] text-4xl" />,
      features: [
        'Leverage icon source platform to target, recruit & hire elite athletes to your team!',
        'No Setup Fee',
        'Access to all athletes',
        'No Transaction Fee',
      ],
      details: 'Annual Commitment',
      moreDetails: ['Leverage icon source platform to target, recruit & hire elite athletes to your team!', 'No Setup Fee', 'Access to all athletes', 'No Transaction Fee'],
    },
  ];

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
                <button 
                  className="w-full bg-[#9afa00] text-black font-bold py-2 rounded-md uppercase text-xs md:text-md hover:bg-[#baff32] transition"
                  onClick={() => setShowModal(true)}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Modal Popup */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm px-2 md:px-0">
            <div className="relative w-full max-w-lg md:max-w-2xl bg-[#1B2317] rounded-2xl shadow-lg p-6 md:p-10 flex flex-col items-center animate-fadeIn">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-[#9afa00] text-2xl hover:text-white transition"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
              {/* Title */}
              <h2 className="text-white text-lg md:text-2xl font-bold mb-2 text-center uppercase tracking-wide">Choose a Subscription Plan to Get Started</h2>
              {/* Plan Tabs */}
              <div className="flex w-full justify-center gap-2 md:gap-6 mb-6 mt-2">
                {plans.map(plan => (
                  <button
                    key={plan.key}
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[110px] md:min-w-[180px] ${selectedPlan === plan.key ? 'border-[#9afa00] bg-[#181c1a]' : 'border-transparent bg-black bg-opacity-60'} hover:border-[#9afa00]`}
                  >
                    {plan.icon}
                    <span className={`mt-2 font-bold text-base md:text-lg ${selectedPlan === plan.key ? 'text-[#9afa00]' : 'text-white'}`}>{plan.label}</span>
                    <span className="text-xs md:text-sm text-gray-300 mt-1">{plan.price}</span>
                  </button>
                ))}
              </div>
              {/* Plan Details */}
              <div className="w-full rounded-xl p-4 md:p-6 flex flex-col items-center mb-4">
                <span className="text-[#9afa00] font-bold text-sm md:text-base mb-2">Annual Commitment <span className="text-[#9afa00] underline cursor-pointer ml-2">More Details</span></span>
                <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 w-full justify-center items-center mb-2 mt-2">
                  {plans.find(p => p.key === selectedPlan).moreDetails.map((feature, i) => (
                    <span key={i} className="flex items-center gap-2 text-white text-xs md:text-sm"><span className="text-[#9afa00]">✔</span> {feature}</span>
                  ))}
                </div>
                {/* Example: extra toggle for icon plan */}
                {selectedPlan === 'icon' && (
                  <div className="flex items-center gap-3 mt-2 w-full">
                    <button
                      type="button"
                      aria-pressed={payAnnually}
                      onClick={() => setPayAnnually(v => !v)}
                      className={`w-12 h-8 flex items-center rounded-full transition-colors duration-200 focus:outline-none ${payAnnually ? 'bg-[#9afa00]' : 'bg-[#181c1a]'}`}
                    >
                      <span
                        className={`inline-block w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${payAnnually ? 'translate-x-4' : 'translate-x-1'}`}
                      />
                    </button>
                    <span className="text-white text-base md:text-lg font-normal">Pay annually and get 2 months free</span>
                  </div>
                )}
                {selectedPlan === 'silver' && (
                  <div className="w-full flex flex-col gap-2 mt-2">
                    <div className="flex items-start gap-2 bg-black bg-opacity-60 rounded-lg p-3">
                      <input type="checkbox" id="icon-standalone" className="accent-[#9afa00] w-4 h-4 mt-1" />
                      <label htmlFor="icon-standalone" className="text-white text-xs md:text-sm flex flex-col">
                        <span className="font-bold text-white text-sm md:text-base">ICON JOBS STANDS ALONE <span className="text-gray-300 font-normal">$500 per month</span></span>
                        <span className="text-gray-300 text-xs md:text-sm">Leverage icon source platform to target, recruit & hire elite athletes to your team!</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              {/* Modal Actions */}
              <div className="flex w-full gap-4 mt-2">
                <button
                  className="flex-1 bg-[#232626] text-white font-bold py-2 rounded-md uppercase text-xs md:text-base border border-[#9afa00] hover:bg-[#181c1a] transition"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button
                  className="flex-1 bg-[#9afa00] text-black font-bold py-2 rounded-md uppercase text-xs md:text-base hover:bg-[#baff32] transition"
                >
                  Continue
                </button>
              </div>
              <div className="w-full text-center mt-4">
                <span className="text-gray-300 text-xs md:text-sm">Not sure which plan suits you? <span className="text-[#9afa00] underline cursor-pointer">Contact our team</span></span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrandAthlete; 