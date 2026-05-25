import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Lazy load route pages
const HomePage = lazy(() => import('./pages/Home/HomePage.jsx'));
const Login = lazy(() => import('./pages/Auth/Login.jsx'));
const Signup = lazy(() => import('./pages/Auth/Signup.jsx'));
const PassengerDashboard = lazy(() => import('./pages/Passenger/PassengerDashboard.jsx'));
const PassengerProfile = lazy(() => import('./pages/Passenger/PassengerProfile.jsx'));
const DriverDashboard = lazy(() => import('./pages/Driver/DriverDashboard.jsx'));
const DriverProfile = lazy(() => import('./pages/Driver/DriverProfile.jsx'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard.jsx'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers.jsx'));
const AdminDrivers = lazy(() => import('./pages/Admin/AdminDrivers.jsx'));
const AdminVerifications = lazy(() => import('./pages/Admin/AdminVerifications.jsx'));
const AdminRevenue = lazy(() => import('./pages/Admin/AdminRevenue.jsx'));
const AdminRides = lazy(() => import('./pages/Admin/AdminRides.jsx'));
const AdminProfile = lazy(() => import('./pages/Admin/AdminProfile.jsx'));

// Lazy load layouts
const PassengerLayout = lazy(() => import('./components/layouts/PassengerLayout.jsx'));
const DriverLayout = lazy(() => import('./components/layouts/DriverLayout.jsx'));
const AdminLayout = lazy(() => import('./components/layouts/AdminLayout.jsx'));

// Premium modern skeleton loader fallback
const PageLoaderFallback = () => (
  <div className="min-h-screen bg-[#0a0d17] flex items-center justify-center text-slate-200">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-slate-400 font-medium">Loading premium interface...</p>
    </div>
  </div>
);

function AdminRoute({ children }) {
  const role = sessionStorage.getItem('role');
  const token = sessionStorage.getItem('token');
  return (token && role === 'admin') ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoaderFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Passenger Nested Routes */}
          <Route path="/passenger" element={<PassengerLayout />}>
            <Route index element={<Navigate to="/passenger/dashboard" replace />} />
            <Route path="dashboard" element={<PassengerDashboard />} />
            <Route path="find-rides" element={<PassengerDashboard />} />
            <Route path="bookings" element={<PassengerDashboard />} />
            <Route path="history" element={<PassengerDashboard />} />
            <Route path="routes" element={<PassengerDashboard />} />
            <Route path="profile" element={<PassengerProfile />} />
          </Route>
          
          {/* Driver Nested Routes */}
          <Route path="/driver" element={<DriverLayout />}>
            <Route index element={<Navigate to="/driver/dashboard" replace />} />
            <Route path="dashboard" element={<DriverDashboard />} />
            <Route path="create-ride" element={<DriverDashboard />} />
            <Route path="active-rides" element={<DriverDashboard />} />
            <Route path="requests" element={<DriverDashboard />} />
            <Route path="earnings" element={<DriverDashboard />} />
            <Route path="history" element={<DriverDashboard />} />
            <Route path="profile" element={<DriverProfile />} />
          </Route>

          {/* Admin Nested Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="drivers" element={<AdminDrivers />} />
            <Route path="verifications" element={<AdminVerifications />} />
            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="rides" element={<AdminRides />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
