import React from 'react';
import Navbar from './navbar/Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#0c0e0d]">
      <div className="sticky top-0 z-50 bg-[#0c0e0d]">
        <Navbar />
      </div>
      <div className="pt-4">{children}</div>
    </div>
  );
};

export default Layout;
