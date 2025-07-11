import React from 'react';
import { FaEllipsisV } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-3 bg-transparent">
      {/* Left: Logo and Brand */}
        <img src="/appLogo.png" alt="Locker Deal Logo" className="h-12" />
      {/* Right: User Info */}
      <div className="flex items-center gap-4">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="User Avatar"
          className="h-16 w-16 rounded-full object-cover border-2 border-white"
        />
        <div className="flex flex-col items-start justify-center">
          <span className="text-white font-bold text-lg leading-tight">PRO SPORTS VENTURES</span>
          <span className="text-white text-md leading-tight">Pawasaurora012@gmail.com</span>
        </div>
        <FaEllipsisV className="text-white text-2xl ml-2 cursor-pointer" />
      </div>
    </nav>
  );
};

export default Navbar;