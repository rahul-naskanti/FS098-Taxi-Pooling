import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import DriverSidebar from '../../pages/Driver/components/DriverSidebar.jsx';
import DriverHeader from '../../pages/Driver/components/DriverHeader.jsx';
import { userService } from '../../services/userService';

function DriverLayout() {
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

      if (role !== 'driver') {
        // Strict guard: Redirect passengers or admin away from driver dashboard
        navigate(role === 'passenger' ? '/passenger/dashboard' : '/admin', { replace: true });
        return;
      }

      try {
        const data = await userService.getCurrentUser();
        if (data.success && data.user) {
          setUser(data.user);
          // Sync role changes if any
          if (data.user.role !== 'driver') {
            sessionStorage.setItem('role', data.user.role);
            navigate(data.user.role === 'passenger' ? '/passenger/dashboard' : '/admin', { replace: true });
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
          <p className="text-xs text-slate-400 font-medium">Verifying captain session...</p>
        </div>
      </div>
    );
  }

  // Map path name to highlight active sidebar button
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/driver/profile')) return 'settings';
    if (path.includes('/driver/create-ride')) return 'createRide';
    if (path.includes('/driver/active-rides')) return 'activeRides';
    if (path.includes('/driver/requests')) return 'requests';
    if (path.includes('/driver/earnings')) return 'earnings';
    if (path.includes('/driver/history')) return 'history';
    return 'dashboard';
  };

  const handleSettingsNavigation = () => {
    navigate('/driver/profile');
  };

  const setActiveTab = (tabName) => {
    if (tabName === 'dashboard') navigate('/driver/dashboard');
    else if (tabName === 'createRide') navigate('/driver/create-ride');
    else if (tabName === 'activeRides') navigate('/driver/active-rides');
    else if (tabName === 'requests') navigate('/driver/requests');
    else if (tabName === 'earnings') navigate('/driver/earnings');
    else if (tabName === 'history') navigate('/driver/history');
  };

  return (
    <div className="min-h-screen bg-[#0a0d17] text-slate-200 flex flex-col md:flex-row">
      <DriverSidebar
        activeTab={getActiveTab()}
        setActiveTab={setActiveTab}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        activeRidesCount={0}
        rideRequestsCount={0}
        handleSettingsNavigation={handleSettingsNavigation}
      />
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <DriverHeader
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          handleSettingsNavigation={handleSettingsNavigation}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          userName={user ? user.fullName : 'Driver'}
          userCompany={user && user.vehicleName ? `${user.vehicleName} (${user.vehicleNumber})` : 'Verified Driver'}
        />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          <Outlet context={{ user, setUser }} />
        </main>
      </div>
    </div>
  );
}

export default DriverLayout;
