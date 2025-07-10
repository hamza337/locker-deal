import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

const Otp = () => {
  // For auto focus, refs for each input
  const inputs = Array.from({ length: 6 }, () => useRef(null));

  // Handler for moving focus
  const handleChange = (e, idx) => {
    if (e.target.value.length === 1 && idx < 5) {
      inputs[idx + 1].current.focus();
    } else if (e.target.value.length === 0 && idx > 0) {
      inputs[idx - 1].current.focus();
    }
  };

  return (
    <div className="min-h-screen w-screen bg-cover bg-center flex flex-col items-center justify-center relative px-4 py-8" style={{ backgroundImage: 'url(/bgApp.png)' }}>
      {/* Top right link */}
      <Link
        to="/login"
        className="absolute top-12 right-18 text-[#9afa00] font-bold text-lg z-10"
      >
        Already have an account?
      </Link>
      {/* Centered Logo */}
      <img src="/appLogo.png" alt="Locker Deal Logo" className="h-16 mt-4 mb-8 mx-auto" />
      {/* Heading */}
      <h2 className="text-white text-3xl md:text-4xl font-bold text-center mb-4 tracking-wide">VERIFY EMAIL</h2>
      <p className="text-white text-md text-center mb-10">Enter the 6 digit code that was sent to your mail</p>
      {/* OTP Inputs */}
      <div className="flex justify-center gap-4 mb-10">
        {inputs.map((ref, idx) => (
          <input
            key={idx}
            ref={ref}
            type="text"
            maxLength={1}
            className="w-14 h-14 md:w-16 md:h-16 text-2xl md:text-3xl text-center bg-transparent border border-gray-400 rounded-md text-white focus:outline-none focus:border-[#9afa00] transition-all"
            onChange={e => handleChange(e, idx)}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        ))}
      </div>
      {/* Verify Button */}
      <button
        className="w-full max-w-xl bg-[#9afa00] hover:shadow-[0_0_24px_6px_#9afa00] text-black font-bold py-3 rounded-md text-lg tracking-wider shadow-md cursor-pointer transition-shadow duration-300 mb-6"
      >
        VERIFY EMAIL
      </button>
      {/* Resend Code */}
      <div className="text-center mt-2">
        <span className="text-white text-md">Don't receive any code? </span>
        <button className="text-[#9afa00] font-bold ml-1 hover:underline">RESEND CODE</button>
      </div>
    </div>
  );
};

export default Otp;