import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaTimes, FaCheckCircle, FaCamera, FaCrop } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('brand');
  const [profileImage, setProfileImage] = useState('https://randomuser.me/api/portraits/men/32.jpg');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropData, setCropData] = useState({ x: 0, y: 0, size: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

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
    // Clear user data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = () => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      canvas.width = cropData.size;
      canvas.height = cropData.size;
      
      ctx.drawImage(
        img,
        cropData.x, cropData.y, cropData.size, cropData.size,
        0, 0, cropData.size, cropData.size
      );
      
      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.8);
      setProfileImage(croppedImageUrl);
      setCropModalOpen(false);
      setSelectedImage(null);
    }
  };

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cropX = (cropData.x / (imageRef.current?.naturalWidth || 1)) * rect.width;
    const cropY = (cropData.y / (imageRef.current?.naturalHeight || 1)) * rect.height;
    const cropSize = (cropData.size / (imageRef.current?.naturalWidth || 1)) * rect.width;
    
    if (x >= cropX && x <= cropX + cropSize && y >= cropY && y <= cropY + cropSize) {
      setIsDragging(true);
      setDragStart({ x: x - cropX, y: y - cropY });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imageRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;
    
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    
    const newX = Math.max(0, Math.min(x * scaleX, imageRef.current.naturalWidth - cropData.size));
    const newY = Math.max(0, Math.min(y * scaleY, imageRef.current.naturalHeight - cropData.size));
    
    setCropData(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
            src={profileImage}
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
                <div className="relative">
                  <img src={profileImage} alt="Brand Avatar" className="h-14 w-14 rounded-full object-cover border-2 border-[#9afa00]" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-[#9afa00] text-black rounded-full p-1.5 hover:bg-[#baff32] transition"
                    title="Change Profile Picture"
                  >
                    <FaCamera className="text-xs" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
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
        {/* Crop Modal */}
        {cropModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-2xl bg-[#23281e] rounded-2xl shadow-lg p-6 flex flex-col animate-fadeIn">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-[#9afa00] text-2xl hover:text-white transition z-10"
                onClick={() => { setCropModalOpen(false); setSelectedImage(null); }}
                aria-label="Close"
              >
                <FaTimes />
              </button>
              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <FaCrop className="text-[#9afa00] text-xl" />
                <h2 className="text-white font-bold text-xl">Crop Profile Image</h2>
              </div>
              {/* Image with Crop Area */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative bg-[#181c1a] rounded-lg p-4 max-w-lg w-full">
                  {selectedImage && (
                    <div 
                      className="relative cursor-move select-none"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <img
                        ref={imageRef}
                        src={selectedImage}
                        alt="Selected"
                        className="w-full h-auto max-h-96 object-contain rounded pointer-events-none"
                        onLoad={() => {
                          if (imageRef.current) {
                            const img = imageRef.current;
                            const size = Math.min(img.naturalWidth, img.naturalHeight) * 0.6;
                            setCropData({
                              x: (img.naturalWidth - size) / 2,
                              y: (img.naturalHeight - size) / 2,
                              size: size
                            });
                          }
                        }}
                        draggable={false}
                      />
                      {/* Crop Overlay */}
                       <div
                         className="absolute border-2 border-[#9afa00] cursor-move"
                         style={{
                           left: `${(cropData.x / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                           top: `${(cropData.y / (imageRef.current?.naturalHeight || 1)) * 100}%`,
                           width: `${(cropData.size / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                           height: `${(cropData.size / (imageRef.current?.naturalHeight || 1)) * 100}%`,
                           backgroundColor: 'transparent'
                         }}
                       >
                         {/* Corner indicators */}
                         <div className="absolute -top-1 -left-1 w-3 h-3 border-2 border-[#9afa00] bg-[#9afa00]" />
                         <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-[#9afa00] bg-[#9afa00]" />
                         <div className="absolute -bottom-1 -left-1 w-3 h-3 border-2 border-[#9afa00] bg-[#9afa00]" />
                         <div className="absolute -bottom-1 -right-1 w-3 h-3 border-2 border-[#9afa00] bg-[#9afa00]" />
                         {/* Center text */}
                         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs bg-black bg-opacity-70 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                           Drag to adjust
                         </div>
                       </div>
                    </div>
                  )}
                </div>
                {/* Preview */}
                <div className="flex items-center gap-4">
                  <span className="text-white text-sm">Preview:</span>
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#9afa00] bg-[#232626]">
                    {selectedImage && (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${selectedImage})`,
                          backgroundPosition: `${-cropData.x * (64 / cropData.size)}px ${-cropData.y * (64 / cropData.size)}px`,
                          backgroundSize: `${(imageRef.current?.naturalWidth || 1) * (64 / cropData.size)}px ${(imageRef.current?.naturalHeight || 1) * (64 / cropData.size)}px`
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* Modal Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  className="flex-1 bg-[#232626] text-white font-bold py-2 rounded-md uppercase border border-[#9afa00] hover:bg-[#181c1a] transition"
                  onClick={() => { setCropModalOpen(false); setSelectedImage(null); }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-[#9afa00] text-black font-bold py-2 rounded-md uppercase hover:bg-[#baff32] transition"
                  onClick={handleCropSave}
                >
                  Save Image
                </button>
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;