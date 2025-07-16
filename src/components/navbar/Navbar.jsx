import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('brand');

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 bg-transparent">
      {/* Left: Logo */}
      <img src="/appLogo.png" alt="Locker Deal Logo" className="h-10 md:h-12" />
      {/* Right: User Info (hidden on mobile) and menu */}
      <div className="flex items-center gap-4 relative">
        {/* Profile info and avatar only on md+ */}
        <div className="hidden md:flex items-center gap-4">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="User Avatar"
            className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover border-2 border-white"
          />
          <div className="flex flex-col items-start justify-center">
            <span className="text-white font-bold text-base md:text-lg leading-tight">PRO SPORTS VENTURES</span>
            <span className="text-white text-xs md:text-md leading-tight">Pawasaurora012@gmail.com</span>
          </div>
        </div>
        {/* Three dots always visible */}
        <div className="relative" ref={menuRef}>
          <FaEllipsisV className="text-white text-2xl ml-2 cursor-pointer" onClick={() => setMenuOpen(v => !v)} />
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#232626] rounded-lg shadow-lg py-2 z-50 border border-[#9afa00] animate-fadeIn">
              <button
                className="w-full text-left px-4 py-2 text-white hover:bg-[#181c1a] transition text-sm"
                onClick={() => { setMenuOpen(false); setProfileModalOpen(true); }}
              >
                View Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-[#9afa00] hover:bg-[#181c1a] transition text-sm font-bold"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
        {/* Profile Modal */}
        {profileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm px-2 md:px-0">
            <div className="relative w-full max-w-2xl bg-[#23281e] rounded-2xl shadow-lg p-0 flex flex-col animate-fadeIn max-h-[90vh]">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-[#9afa00] text-2xl hover:text-white transition z-10"
                onClick={() => setProfileModalOpen(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
              {/* Header */}
              <div className="w-full flex flex-row items-center gap-4 bg-[#23281e] rounded-t-2xl px-6 pt-6 pb-4 border-b border-[#2e3627]">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Brand Avatar" className="h-14 w-14 rounded-full object-cover border-2 border-[#9afa00]" />
                <div className="flex flex-col flex-1">
                  <span className="text-white font-bold text-lg md:text-xl">PRO SPORTS VENTURES</span>
                  <span className="text-[#baff32] text-base md:text-lg">Media & Entertainment</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-[#9afa00] text-xl" />
                  <span className="text-[#9afa00] font-bold text-sm md:text-base">Successfully Verified</span>
                </div>
              </div>
              {/* Tabs */}
              <div className="flex flex-row w-full border-b border-[#2e3627] bg-[#23281e] px-6">
                <button
                  className={`py-4 px-4 font-bold uppercase text-base md:text-lg transition-all border-b-4 ${activeTab === 'brand' ? 'text-[#9afa00] border-[#9afa00]' : 'text-white border-transparent hover:text-[#9afa00]'}`}
                  onClick={() => setActiveTab('brand')}
                >
                  Brand Identity
                </button>
                <button
                  className={`py-4 px-4 font-bold uppercase text-base md:text-lg transition-all border-b-4 ${activeTab === 'account' ? 'text-[#9afa00] border-[#9afa00]' : 'text-white border-transparent hover:text-[#9afa00]'}`}
                  onClick={() => setActiveTab('account')}
                >
                  Account Setting
                </button>
              </div>
              {/* Tab Content */}
              <div className="flex-1 flex flex-col min-h-[300px]">
                <div className="flex-1 overflow-y-auto px-6 pt-4 pb-2 max-h-[60vh]">
                  {activeTab === 'brand' && (
                    <form className="flex flex-col gap-6">
                      {/* Brand Representatives */}
                      <div>
                        <span className="text-[#9afa00] font-bold text-lg flex items-center gap-2">BRAND REPRESENTATIVES <FaCheckCircle className="text-[#9afa00] text-base" /></span>
                        <div className="text-white mt-2 text-sm md:text-base">Name: PRO SPORTS VENTURES</div>
                        <div className="text-white text-sm md:text-base">Job Title: Empty</div>
                      </div>
                      {/* Brand Identity */}
                      <div>
                        <span className="text-[#9afa00] font-bold text-lg">BRAND IDENTITY</span>
                        <div className="mt-2 flex flex-col gap-4">
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Brand Name</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="PRO SPORTS VENTURES" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Brand Website URL</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="PRO SPORTS VENTURES" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Brand Category</label>
                            <select className="w-full bg-[#181c1a] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm">
                              <option>Media & Entertainment</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Company Size (Employees)</label>
                            <select className="w-full bg-[#181c1a] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm">
                              <option>Media & Entertainment</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      {/* Social Links */}
                      <div>
                        <span className="text-[#9afa00] font-bold text-lg">SOCIAL LINKS</span>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Instagram</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Tiktok</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Twitter</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Facebook</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Youtube</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">LinkedIn</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="@prosportsventures" />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="text-white text-sm md:text-base mb-1 block">Brand Description</label>
                          <textarea className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm min-h-[60px]" placeholder="Type your Brand Description here" />
                        </div>
                      </div>
                    </form>
                  )}
                  {activeTab === 'account' && (
                    <form className="flex flex-col gap-6">
                      {/* Public Display Info */}
                      <div>
                        <span className="text-[#9afa00] font-bold text-lg">PUBLIC DISPLAY INFORMATION</span>
                        <div className="mt-2 flex flex-col gap-4">
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">First Name</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="PRO SPORTS VENTURES" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Last Name</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="PRO SPORTS VENTURES" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Job Title</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" placeholder="Enter Job Title" />
                          </div>
                        </div>
                      </div>
                      {/* Account & Security */}
                      <div>
                        <span className="text-[#9afa00] font-bold text-lg">ACCOUNT & SECURITY</span>
                        <div className="mt-2 flex flex-col gap-4">
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Email</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="prosportsventures@gmail.com" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Phone Number</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" defaultValue="987574320976" />
                          </div>
                          <div>
                            <label className="text-white text-sm md:text-base mb-1 block">Extension</label>
                            <input className="w-full bg-[#181c1a] text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm" placeholder="Ext." />
                          </div>
                        </div>
                      </div>
                      {/* MFA */}
                      <div className="bg-[#232626] rounded-lg p-4 mt-2">
                        <span className="text-[#9afa00] font-bold text-lg block mb-2">MULTI FACTOR AUTHENTICATION</span>
                        <p className="text-white text-xs md:text-sm mb-2">You can enable MFA to add an extra layer of security to your account. When you log in, you will be required to enter a code sent to your phone or email address.</p>
                        <div className="flex items-center gap-2 mb-2">
                          <input type="checkbox" id="enable-mfa" className="accent-[#9afa00] w-4 h-4" />
                          <label htmlFor="enable-mfa" className="text-white text-xs md:text-sm">Enable MFA</label>
                        </div>
                        <div>
                          <label className="text-white text-xs md:text-sm mb-1 block">MPA Device</label>
                          <select className="w-full bg-[#181c1a] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9afa00] text-sm">
                            <option>Email</option>
                          </select>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
                {/* Modal Actions - static */}
                <div className="flex w-full gap-4 px-6 pb-6 bg-[#23281e] sticky bottom-0 z-10 pt-2">
                  <button
                    className="flex-1 bg-[#232626] text-white font-bold py-2 rounded-md uppercase text-xs md:text-base border border-[#9afa00] hover:bg-[#181c1a] transition"
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 bg-[#9afa00] text-black font-bold py-2 rounded-md uppercase text-xs md:text-base hover:bg-[#baff32] transition"
                    type="submit"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;