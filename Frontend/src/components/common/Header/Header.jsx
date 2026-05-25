import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCarSide } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
              <FaCarSide className="text-xl" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              FS098 <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">TaxiPool</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors duration-200">Home</Link>
            <a href="/#features" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors duration-200">Features</a>
            <a href="/#how-it-works" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors duration-200">About</a>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {token && role ? (
              <>
                <Link to={`/${role}`} className="px-5 py-2.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all duration-200 cursor-pointer">
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    sessionStorage.clear();
                    window.location.reload();
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors duration-200 cursor-pointer bg-transparent border-0"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 cursor-pointer">
                  Login
                </Link>
                <Link to="/signup" className="px-5 py-2.5 text-sm font-medium text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all duration-200 cursor-pointer">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800/50 bg-[#0b0f19] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            Home
          </Link>
          <a
            href="/#features"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            About
          </a>
          <div className="pt-4 flex flex-col gap-3">
            {token && role ? (
              <>
                <Link
                  to={`/${role}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-medium text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-xl font-semibold cursor-pointer block"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    sessionStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium text-red-400 border border-red-500/25 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer block"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-medium text-slate-300 hover:text-white border border-slate-800 rounded-xl transition-colors cursor-pointer block"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-medium text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-xl font-semibold cursor-pointer block"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Header;
