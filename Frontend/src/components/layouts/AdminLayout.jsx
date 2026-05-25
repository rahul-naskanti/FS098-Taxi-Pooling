import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  FaCarSide, FaUsers, FaCar, FaRoad, FaShieldAlt, FaSignOutAlt, 
  FaWallet, FaCog, FaCheckCircle, FaBars, FaTimes, FaUserShield 
} from 'react-icons/fa';
import { userService } from '../../services/userService';

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const token = sessionStorage.getItem('token');
      const role = sessionStorage.getItem('role');

      if (!token) {
        sessionStorage.clear();
        navigate('/login', { replace: true });
        return;
      }

      if (role !== 'admin') {
        // Enforce role guard: redirect other roles
        navigate(role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard', { replace: true });
        return;
      }

      try {
        const data = await userService.getCurrentUser();
        if (data.success && data.user) {
          setUser(data.user);
          if (data.user.role !== 'admin') {
            sessionStorage.setItem('role', data.user.role);
            navigate(data.user.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard', { replace: true });
          }
        } else {
          throw new Error('User data verification failed');
        }
      } catch (err) {
        console.error('Admin session validation failed:', err);
        sessionStorage.clear();
        navigate('/login', { replace: true });
      } finally {
        setIsLoadingUser(false);
      }
    };
    validateSession();
  }, [navigate, location.pathname]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#0a0d17] flex items-center justify-center text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/drivers')) return 'drivers';
    if (path.includes('/admin/verifications')) return 'verifications';
    if (path.includes('/admin/revenue')) return 'revenue';
    if (path.includes('/admin/rides')) return 'rides';
    if (path.includes('/admin/profile')) return 'profile';
    return 'dashboard';
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  const activeTab = getActiveTab();

  const navigationItems = [
    { name: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: <FaShieldAlt className="text-sm" /> },
    { name: 'users', label: 'Users list', path: '/admin/users', icon: <FaUsers className="text-sm" /> },
    { name: 'drivers', label: 'Drivers list', path: '/admin/drivers', icon: <FaCar className="text-sm" /> },
    { name: 'verifications', label: 'Verifications', path: '/admin/verifications', icon: <FaCheckCircle className="text-sm" /> },
    { name: 'revenue', label: 'Revenue Analytics', path: '/admin/revenue', icon: <FaWallet className="text-sm" /> },
    { name: 'rides', label: 'Rides log', path: '/admin/rides', icon: <FaRoad className="text-sm" /> },
    { name: 'profile', label: 'Admin Profile', path: '/admin/profile', icon: <FaCog className="text-sm" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d17] text-slate-200 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d1020] border-r border-slate-800 shrink-0">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-850">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
            <FaCarSide className="text-base" />
          </div>
          <span className="text-base font-bold tracking-tight text-white font-display">
            FS098 <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">TaxiPool</span>
          </span>
        </div>

        <div className="p-4 border-b border-slate-850 flex items-center gap-3 bg-slate-900/30 m-3 rounded-xl border border-slate-800/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-black text-xs">
            AD
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">{user ? user.fullName : 'Admin'}</p>
            <p className="text-[9px] text-slate-500 leading-none">System Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-3 space-y-1.5">
          {navigationItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border border-transparent ${
                activeTab === item.name
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border-indigo-500/30 text-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-850">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </aside>

      {/* Mobile responsive layout header */}
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

      {/* Mobile Sidebar drawer */}
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
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-slate-950">
                <FaUserShield className="text-base" />
              </div>
              <span className="text-base font-bold text-white font-display">System Console</span>
            </div>

            <nav className="flex-1 space-y-1.5">
              {navigationItems.map(item => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border border-transparent ${
                    activeTab === item.name
                      ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 text-indigo-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-850">
              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
              >
                <FaSignOutAlt /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Desktop top header bar */}
        <header className="h-20 bg-[#0a0d17] border-b border-slate-850 px-6 sm:px-8 flex items-center justify-between z-10 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white font-display">
              {navigationItems.find(item => item.name === activeTab)?.label || 'System Administration'}
            </h2>
            <p className="text-[11px] text-slate-500">MERN stack live status monitoring panel</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/20 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg select-none">
              <FaUserShield className="text-indigo-500 text-xs" /> System Secure
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900 hover:bg-slate-855 border border-slate-800 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-extrabold text-sm shrink-0">
                  {user ? user.fullName.split(' ').map(n => n[0]).join('') : 'AD'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight">{user ? user.fullName : 'Admin'}</p>
                  <p className="text-[9px] text-slate-500 leading-none">{user ? user.email : 'admin@taxipool.com'}</p>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-955 border border-slate-800 rounded-2xl p-2 shadow-2xl z-20 space-y-1 animate-fadeIn">
                  <Link
                    to="/admin/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-350 hover:bg-slate-900 flex items-center gap-2"
                  >
                    <FaCog /> Profile & Settings
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"
                  >
                    <FaSignOutAlt /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          <Outlet context={{ user, setUser }} />
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;
