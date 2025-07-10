import React from 'react';
import Navbar from './navbar/Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen w-screen bg-[#0c0e0d]">
      <Navbar />
      <div className="pt-4">{children}</div>
    </div>
  );
};

export default Layout;
