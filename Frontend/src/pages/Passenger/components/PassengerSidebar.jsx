import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCarSide, FaCar, FaSearch, FaUsers, FaHistory, FaMapMarkedAlt, FaCog, FaTimes, FaSignOutAlt 
} from 'react-icons/fa';

function PassengerSidebar({ 
  activeTab, 
  setActiveTab, 
  isMobileSidebarOpen, 
  setIsMobileSidebarOpen, 
  upcomingRidesCount, 
  handleSettingsNavigation 
}) {
  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d1020] border-r border-slate-800 shrink-0">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-850">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
            <FaCarSide className="text-base" />
          </div>
          <span className="text-base font-bold tracking-tight text-white font-display">
            FS098 <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">TaxiPool</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {[
            { name: 'dashboard', label: 'Dashboard', icon: <FaCar className="text-sm" /> },
            { name: 'findRides', label: 'Find Rides', icon: <FaSearch className="text-sm" /> },
            { name: 'bookings', label: 'My Bookings', icon: <FaUsers className="text-sm" /> },
            { name: 'history', label: 'Ride History', icon: <FaHistory className="text-sm" /> },
            { name: 'routes', label: 'Saved Routes', icon: <FaMapMarkedAlt className="text-sm" /> },
            { name: 'settings', label: 'Settings', icon: <FaCog className="text-sm" /> }
          ].map(item => (
            <button
              key={item.name}
              onClick={() => {
                if (item.name === 'settings') {
                  handleSettingsNavigation();
                } else {
                  setActiveTab(item.name);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === item.name
                  ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              {item.icon} {item.label}
              {item.name === 'bookings' && upcomingRidesCount > 0 && (
                <span className="ml-auto bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {upcomingRidesCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-850">
          <Link
            to="/login"
            onClick={() => sessionStorage.clear()}
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <FaSignOutAlt /> Log Out
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer Menu Popup */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 md:hidden flex justify-end animate-fadeIn">
          <div className="w-64 bg-[#0d1020] h-full p-6 flex flex-col border-l border-slate-800 shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <FaTimes className="text-xs" />
            </button>

            <div className="flex items-center gap-2.5 mb-8 mt-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950">
                <FaCarSide className="text-base" />
              </div>
              <span className="text-base font-bold text-white font-display">FS098 TaxiPool</span>
            </div>

            <nav className="flex-1 space-y-1.5">
              {[
                { name: 'dashboard', label: 'Dashboard', icon: <FaCar className="text-xs" /> },
                { name: 'findRides', label: 'Find Rides', icon: <FaSearch className="text-xs" /> },
                { name: 'bookings', label: 'My Bookings', icon: <FaUsers className="text-xs" /> },
                { name: 'history', label: 'Ride History', icon: <FaHistory className="text-xs" /> },
                { name: 'routes', label: 'Saved Routes', icon: <FaMapMarkedAlt className="text-xs" /> },
                { name: 'settings', label: 'Settings', icon: <FaCog className="text-xs" /> }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.name === 'settings') {
                      handleSettingsNavigation();
                    } else {
                      setActiveTab(item.name);
                      setIsMobileSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === item.name
                      ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-400'
                      : 'border border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {item.icon} {item.label}
                  {item.name === 'bookings' && upcomingRidesCount > 0 && (
                    <span className="ml-auto bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {upcomingRidesCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-855">
              <Link
                to="/login"
                onClick={() => sessionStorage.clear()}
                className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <FaSignOutAlt /> Log Out
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PassengerSidebar;
