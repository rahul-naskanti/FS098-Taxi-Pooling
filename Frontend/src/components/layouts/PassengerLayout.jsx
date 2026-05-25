import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import PassengerSidebar from '../../pages/Passenger/components/PassengerSidebar.jsx';
import PassengerHeader from '../../pages/Passenger/components/PassengerHeader.jsx';
import { userService } from '../../services/userService';
import { isTokenExpired } from '../../utils/auth';

function PassengerLayout() {
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

      if (!token || isTokenExpired(token)) {
        sessionStorage.clear();
        navigate('/login', { replace: true });
        return;
      }

      if (role !== 'passenger') {
        // Strict guard: Redirect other roles to their dashboards
        navigate(role === 'driver' ? '/driver/dashboard' : '/admin', { replace: true });
        return;
      }

      try {
        const data = await userService.getCurrentUser();
        if (data.success && data.user) {
          setUser(data.user);
          // Sync role changes if any
          if (data.user.role !== 'passenger') {
            sessionStorage.setItem('role', data.user.role);
            navigate(data.user.role === 'driver' ? '/driver/dashboard' : '/admin', { replace: true });
          }
        } else {
          throw new Error('User data verification failed');
        }
      } catch (err) {
        console.error('Session validation failed:', err);
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
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Verifying passenger session...</p>
        </div>
      </div>
    );
  }

  // Map path name to highlight active sidebar button
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/passenger/profile')) return 'settings';
    if (path.includes('/passenger/find-rides')) return 'findRides';
    if (path.includes('/passenger/bookings')) return 'bookings';
    if (path.includes('/passenger/history')) return 'history';
    if (path.includes('/passenger/routes')) return 'routes';
    return 'dashboard';
  };

  const handleSettingsNavigation = () => {
    navigate('/passenger/profile');
  };

  const setActiveTab = (tabName) => {
    if (tabName === 'dashboard') navigate('/passenger/dashboard');
    else if (tabName === 'findRides') navigate('/passenger/find-rides');
    else if (tabName === 'bookings') navigate('/passenger/bookings');
    else if (tabName === 'history') navigate('/passenger/history');
    else if (tabName === 'routes') navigate('/passenger/routes');
  };

  return (
    <div className="min-h-screen bg-[#0a0d17] text-slate-200 flex flex-col md:flex-row">
      <PassengerSidebar
        activeTab={getActiveTab()}
        setActiveTab={setActiveTab}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        upcomingRidesCount={0}
        handleSettingsNavigation={handleSettingsNavigation}
      />
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <PassengerHeader
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          handleSettingsNavigation={handleSettingsNavigation}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          userName={user ? user.fullName : 'Passenger'}
          userCompany={user && user.company ? user.company : 'Not specified'}
        />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          <Outlet context={{ user, setUser }} />
        </main>
      </div>
    </div>
  );
}

export default PassengerLayout;
