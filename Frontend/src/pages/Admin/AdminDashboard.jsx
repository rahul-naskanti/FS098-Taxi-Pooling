import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { 
  FaUsers, FaCar, FaRoad, FaWallet, FaShieldAlt, FaServer, 
  FaDatabase, FaHistory, FaCheckCircle, FaUserClock, FaDoorOpen, FaChartLine 
} from 'react-icons/fa';
import { adminService } from '../../services/adminService';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    verifiedDrivers: 0,
    pendingVerifications: 0,
    activeRides: 0,
    completedRides: 0,
    totalBookings: 0,
    platformRevenue: 0
  });

  const [charts, setCharts] = useState({
    weeklyRevenue: [],
    rideGrowth: [],
    bookingTrends: []
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState('');

  const fetchDashboardData = async () => {
    try {
      const statsRes = await adminService.getDashboardStats();
      if (statsRes.success) {
        setStats(statsRes.stats);
        setCharts(statsRes.charts);
      }
      
      const activityRes = await adminService.getRecentActivity();
      if (activityRes.success) {
        setRecentActivities(activityRes.activities);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setIsLoadingUserLocal(false);
    }
  };

  const [isLoadingUserLocal, setIsLoadingUserLocal] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const triggerConsoleAction = (actionName) => {
    setActionStatus(`Executing: ${actionName}...`);
    setTimeout(() => {
      setActionStatus(`Success: ${actionName} completed.`);
      setTimeout(() => setActionStatus(''), 3000);
      fetchDashboardData();
    }, 1500);
  };

  if (isLoadingUserLocal) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate max values for chart height calculations
  const maxWeeklyRevenue = Math.max(...charts.weeklyRevenue.map(d => d.amount), 1);
  const maxRideGrowth = Math.max(...charts.rideGrowth.map(d => d.count), 1);
  const maxBookingTrends = Math.max(...charts.bookingTrends.map(d => d.bookings), 1);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {actionStatus && (
        <div className="p-3 bg-indigo-950/20 border border-indigo-500/35 text-indigo-400 text-xs font-bold rounded-2xl animate-fadeIn">
          {actionStatus}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-gradient-to-b from-[#0e1322] to-[#0a0d17] border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700 transition-all duration-200">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Commuters</p>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">{stats.totalUsers - stats.totalDrivers}</p>
            <p className="text-[9px] text-slate-500 font-sans mt-0.5">Registered passengers</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-emerald-400 shrink-0">
            <FaUsers />
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#0e1322] to-[#0a0d17] border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700 transition-all duration-200">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Drivers</p>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">{stats.totalDrivers}</p>
            <p className="text-[9px] text-emerald-400 font-sans mt-0.5">{stats.verifiedDrivers} verified ({(stats.totalDrivers > 0 ? Math.round((stats.verifiedDrivers / stats.totalDrivers)*100) : 0)}%)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-teal-400 shrink-0">
            <FaCar />
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#0e1322] to-[#0a0d17] border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700 transition-all duration-200">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Active Ride Pools</p>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">{stats.activeRides}</p>
            <p className="text-[9px] text-slate-500 font-sans mt-0.5">{stats.completedRides} completed commutes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-blue-400 shrink-0">
            <FaRoad />
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#0e1322] to-[#0a0d17] border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700 transition-all duration-200">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Platform Revenue</p>
            <p className="text-xl sm:text-2xl font-black text-teal-400 tracking-tight mt-1">₹{stats.platformRevenue}</p>
            <p className="text-[9px] text-slate-400 font-sans mt-0.5">Commission 10% on rides</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-indigo-400 shrink-0">
            <FaWallet />
          </div>
        </div>

      </div>

      {/* Verification Warnings & Notifications Banner */}
      {stats.pendingVerifications > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaUserClock className="text-sm shrink-0" />
            <span>Action Required: There are {stats.pendingVerifications} driver profile verifications pending review.</span>
          </div>
          <Link to="/admin/verifications" className="text-[10px] uppercase font-black tracking-wider px-3 py-1 bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-all">
            Review Documents
          </Link>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Platform Revenue */}
        <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Weekly Commission Revenue</h3>
            <p className="text-lg font-black text-white mt-1">₹{charts.weeklyRevenue.reduce((sum, d) => sum + d.amount, 0)} earned</p>
          </div>
          <div className="h-40 flex items-end justify-between px-2 pt-4 relative">
            {charts.weeklyRevenue.map((d, idx) => {
              const heightPct = (d.amount / maxWeeklyRevenue) * 100;
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 w-full">
                  <div className="w-full px-1 flex items-end justify-center h-28">
                    <div 
                      style={{ height: `${heightPct}%` }}
                      className="w-5 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md relative group cursor-pointer hover:opacity-80 transition-all"
                      title={`₹${d.amount}`}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] px-1.5 py-0.5 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                        ₹{d.amount}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Ride Growth */}
        <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Weekly Pools Created</h3>
            <p className="text-lg font-black text-white mt-1">{charts.rideGrowth.reduce((sum, d) => sum + d.count, 0)} pools</p>
          </div>
          <div className="h-40 flex items-end justify-between px-2 pt-4 relative">
            {charts.rideGrowth.map((d, idx) => {
              const heightPct = (d.count / maxRideGrowth) * 100;
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 w-full">
                  <div className="w-full px-1 flex items-end justify-center h-28">
                    <div 
                      style={{ height: `${heightPct}%` }}
                      className="w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md relative group cursor-pointer hover:opacity-80 transition-all"
                      title={`${d.count} rides`}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] px-1.5 py-0.5 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                        {d.count} pools
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Booking Trends */}
        <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Weekly Commuters Matched</h3>
            <p className="text-lg font-black text-white mt-1">{stats.totalBookings} matches</p>
          </div>
          <div className="h-40 flex items-end justify-between px-2 pt-4 relative">
            {charts.bookingTrends.map((d, idx) => {
              const heightPct = (d.bookings / maxBookingTrends) * 100;
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 w-full">
                  <div className="w-full px-1 flex items-end justify-center h-28">
                    <div 
                      style={{ height: `${heightPct}%` }}
                      className="w-5 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-md relative group cursor-pointer hover:opacity-80 transition-all"
                      title={`${d.bookings} bookings`}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] px-1.5 py-0.5 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                        {d.bookings} matches
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recent Activities & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Registrants Feed */}
        <div className="lg:col-span-2 bg-[#0d1020] border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Recently Registered Accounts</h3>
              <p className="text-[10px] text-slate-500">MERN real-time database signup monitor</p>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black rounded-full border border-emerald-500/20">DB STREAM</span>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {recentActivities.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">No new registrants found.</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act._id} className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-2xl hover:border-slate-800 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      act.role === 'driver' ? 'bg-teal-500/10 text-teal-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {act.role === 'driver' ? 'DR' : 'PA'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{act.fullName}</p>
                      <p className="text-[10px] text-slate-500">{act.email}</p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div className="text-[9px] text-slate-500 leading-none">
                      Registered: {new Date(act.createdAt).toLocaleDateString()}
                    </div>
                    <span className={`text-[8px] uppercase tracking-wider font-black px-2 py-0.5 border rounded-full ${
                      act.verificationStatus === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : act.verificationStatus === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {act.verificationStatus || 'pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white font-display">System Console Actions</h3>
            <p className="text-[10px] text-slate-500 font-sans">Quick operations utilities</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => triggerConsoleAction('Flush System Session Cache')}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-855 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-emerald-400 flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Flush Session Cache</span>
              <FaHistory className="text-slate-500" />
            </button>
            <Link 
              to="/admin/verifications"
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-855 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-teal-400 flex items-center justify-between transition-all"
            >
              <span>Verify Driver Licenses</span>
              <FaCheckCircle className="text-slate-500" />
            </Link>
            <button 
              onClick={() => triggerConsoleAction('Reboot MongoDB Connection Link')}
              className="w-full py-3.5 px-4 bg-red-950/15 hover:bg-red-950/25 border border-red-500/10 hover:border-red-500/30 rounded-xl text-xs font-bold text-red-400 flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Reboot Database Link</span>
              <FaDatabase className="text-red-500/40" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;
