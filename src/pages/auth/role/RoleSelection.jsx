import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFootballBall, FaTags } from 'react-icons/fa';

const roles = [
  {
    key: 'athlete',
    icon: <FaFootballBall className="text-[#9afa00] text-3xl mb-2" />,
    title: 'ATHLETE',
    desc: 'For athletes wanting to sign endorsement deals.'
  },
  {
    key: 'brand',
    icon: <FaTags className="text-[#9afa00] text-3xl mb-2" />,
    title: 'BRAND',
    desc: 'For brands and agencies representing brand clients.'
  }
];

const RoleSelection = () => {
  const [selected, setSelected] = useState('athlete');
  const navigate = useNavigate();

  const handleNext = () => {
    if (selected === 'athlete') {
      navigate('/signup/athlete');
    } else {
      navigate('/signup/brand');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-cover bg-center flex flex-col justify-center items-center relative px-4" style={{ backgroundImage: 'url(/bgApp.png)' }}>
      {/* Top right link */}
      <Link to="/login" className="absolute top-16 right-26 text-[#9afa00] font-bold text-lg z-10">Already have an account?</Link>
      {/* Logo */}
      <img src="/appLogo.png" alt="Locker Deal Logo" className="h-16 mb-12 mx-auto" />
      {/* Heading */}
      <h2 className="text-white text-3xl md:text-4xl font-bold text-center mb-4 tracking-wide">SIGN UP</h2>
      <p className="text-white text-md text-center mb-14">Select your role which describes you best.</p>
      {/* Role cards */}
      <div className="flex flex-col md:flex-row gap-12 justify-center items-center mb-14 w-full max-w-2xl">
        {roles.map(role => (
          <div
            key={role.key}
            onClick={() => setSelected(role.key)}
            className={`flex flex-col items-center bg-black bg-opacity-70 rounded-xl py-12 px-4 w-full md:w-72 cursor-pointer border-2 transition-all duration-200 ${selected === role.key ? 'border-[#9afa00] shadow-[0_0_24px_6px_#9afa00]' : 'border-transparent hover:border-[#9afa00]/60'}`}
          >
            {role.icon}
            <div className="text-[#9afa00] font-bold text-lg mb-1">{role.title}</div>
            <div className="text-white text-sm text-center">{role.desc}</div>
          </div>
        ))}
      </div>
      {/* Next Button */}
      <button
        className="w-full max-w-2xl bg-[#3a4d1a] hover:bg-[#9afa00] hover:text-black text-white font-bold py-3 rounded-md text-lg tracking-wider transition-colors duration-200"
        onClick={handleNext}
      >
        NEXT
      </button>
    </div>
  );
};

export default RoleSelection;