import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaBell, FaCog, FaSignOutAlt, FaBars, FaCarSide } from 'react-icons/fa';

function PassengerHeader({
  profileDropdownOpen,
  setProfileDropdownOpen,
  handleSettingsNavigation,
  setIsMobileSidebarOpen,
  userName = "John Doe",
  userCompany = "Google Inc."
}) {
  return (
    <>
      {/* Mobile Top Header bar */}
      <header className="md:hidden h-16 bg-[#0d1020] border-b border-slate-800 flex items-center justify-between px-4 z-40 relative">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
            <FaCarSide className="text-sm" />
          </div>
          <span className="text-sm font-bold text-white font-display">
            FS098 <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">TaxiPool</span>
          </span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
        >
          <FaBars className="text-sm" />
        </button>
      </header>

      {/* Main Top Header bar */}
      <header className="h-20 bg-[#0a0d17] border-b border-slate-855 px-6 sm:px-8 flex items-center justify-between z-10 shrink-0">
        <div className="hidden sm:block">
          <h2 className="text-base font-bold text-white font-display">Find Pools</h2>
          <p className="text-[11px] text-slate-500">My Bookings & Savings Console</p>
        </div>

        <div className="flex items-center gap-4 ml-auto sm:ml-0">
          {/* Visual Indicator only, labeled Emergency with a muted style */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 border border-slate-800/80 text-slate-400 text-[10px] font-bold rounded-lg select-none">
            <FaShieldAlt className="text-slate-500 text-xs" /> Emergency
          </div>

          <button className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors relative cursor-pointer">
            <FaBell className="text-xs" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-emerald-400 rounded-full"></span>
          </button>

          {/* Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900 hover:bg-slate-855 border border-slate-800 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-extrabold text-sm shrink-0">
                {userName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{userName}</p>
                <p className="text-[9px] text-slate-500 font-sans leading-none">{userCompany}</p>
              </div>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-2xl p-2 shadow-2xl z-20 space-y-1 animate-fadeIn">
                <button
                  onClick={() => {
                    handleSettingsNavigation();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                >
                  <FaCog /> Profile & Settings
                </button>
                <Link
                  to="/login"
                  onClick={() => sessionStorage.clear()}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <FaSignOutAlt /> Log Out
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default PassengerHeader;
