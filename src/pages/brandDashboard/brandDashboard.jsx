import React, { useState } from 'react';
import BrandDashboardHome from '../../components/brand/BrandDashboardHome';
import BrandAthlete from '../../components/brand/BrandAthlete';
import BrandCompaigns from '../../components/brand/BrandCompaigns';
import BrandContracts from '../../components/brand/BrandContracts';

const TABS = [
  { label: 'Dashboard', key: 'dashboard' },
  { label: 'Athlete', key: 'athlete' },
  { label: 'Campaigns', key: 'campaigns' },
  { label: 'Contracts', key: 'contracts' },
];

const TAB_COMPONENTS = {
  dashboard: <BrandDashboardHome />,
  athlete: <BrandAthlete />,
  campaigns: <BrandCompaigns />,
  contracts: <BrandContracts />,
};

const BrandDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="w-full min-h-screen bg-transparent px-0 md:px-6 py-6">
      {/* Tabs */}
      <div className="flex gap-4 md:gap-6 bg-[rgba(0,0,0,0.3)] px-2 md:px-8 py-4 rounded-b-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`uppercase font-bold text-white text-base md:text-lg px-2 pb-2 border-b-4 transition-all duration-200 min-w-max ${activeTab === tab.key ? 'text-[#9afa00] border-[#9afa00]' : 'border-transparent hover:text-[#9afa00]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="w-full mt-6">
        {TAB_COMPONENTS[activeTab]}
      </div>
    </div>
  );
};

export default BrandDashboard;