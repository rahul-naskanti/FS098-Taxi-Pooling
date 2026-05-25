import React, { useState, useEffect } from 'react';
import { FaWallet, FaCheckCircle, FaUsers, FaTag, FaChartBar, FaCrown, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import { adminService } from '../../services/adminService';

function AdminRevenue() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await adminService.getRevenueAnalytics();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching revenue analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    totalRevenue = 0,
    totalCompletedRides = 0,
    topDrivers = [],
    driverRevenues = [],
    weeklyRevenueAgg = [],
    profitability = { averagePricePerSeat: 0, averagePassengersPerRide: 0 }
  } = data || {};

  // Find max value in weekly aggregation to draw custom bars
  const maxWeeklyRevenue = Math.max(...weeklyRevenueAgg.map(d => d.revenue), 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white font-display">Revenue & Commission Analytics</h1>
        <p className="text-xs text-slate-500">Track platform commission shares, net driver payouts, and booking revenues.</p>
      </div>

      {/* Revenue Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-b from-[#0e1322] to-[#0a0d17] border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Commission</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight mt-1">₹{totalRevenue}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">10% commission on completed rides</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-emerald-400 shrink-0">
            <FaWallet />
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#0e1322] to-[#0a0d17] border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Completed Commutes</p>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">{totalCompletedRides}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Total successful pools</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-teal-400 shrink-0">
            <FaCheckCircle />
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#0e1322] to-[#0a0d17] border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Average Price / Seat</p>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">₹{profitability.averagePricePerSeat}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Seat pricing average</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-blue-400 shrink-0">
            <FaTag />
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#0e1322] to-[#0a0d17] border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Commuter Density</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-400 tracking-tight mt-1">{profitability.averagePassengersPerRide}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Passengers / completed pool</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-indigo-400 shrink-0">
            <FaUsers />
          </div>
        </div>
      </div>

      {/* SVG Daily/Weekly Trend Chart */}
      <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white font-display">Daily Revenue Log</h3>
          <p className="text-[10px] text-slate-500">MERN dynamic aggregate matching of previous 30 days platform income</p>
        </div>

        {weeklyRevenueAgg.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
            No completed rides revenue found in last 30 days.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-44 flex items-end justify-between gap-1 border-b border-slate-800 pb-2 relative">
              {weeklyRevenueAgg.map((day, idx) => {
                const heightPct = (day.revenue / maxWeeklyRevenue) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end justify-center h-32 relative">
                      <div
                        style={{ height: `${Math.max(heightPct, 5)}%` }}
                        className="w-full max-w-[20px] bg-gradient-to-t from-emerald-500/80 to-emerald-400 hover:to-emerald-300 rounded-t-md transition-all cursor-pointer relative"
                        title={`Date: ${day._id} | Commission: ₹${Math.round(day.revenue)}`}
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-850 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                          ₹{Math.round(day.revenue)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[7px] sm:text-[9px] text-slate-500 font-bold whitespace-nowrap rotate-45 sm:rotate-0 mt-1">
                      {new Date(day._id).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Top Performing Drivers & Revenue Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top drivers list */}
        <div className="lg:col-span-5 bg-[#0d1020] border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-850 pb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">Top Drivers by Contribution</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Top earners bringing platform commission</p>
            </div>
            <FaCrown className="text-amber-400 text-lg" />
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {topDrivers.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">No earnings contributions logged.</p>
            ) : (
              topDrivers.map((driver, index) => (
                <div key={driver.driverId} className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-2xl hover:border-slate-850 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{driver.driverName}</p>
                      <p className="text-[9px] text-slate-500">{driver.ridesCompletedCount} completed rides</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400 leading-none">₹{Math.round(driver.platformCommission)}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Platform Cut</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Commission Table */}
        <div className="lg:col-span-7 bg-[#0d1020] border border-slate-800 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">All Driver Payout Ledger</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Ledger showing gross passenger collections, payouts & margins</p>
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 text-[9px] font-black uppercase tracking-wider bg-slate-950/30">
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3 text-right">Gross Booking</th>
                  <th className="px-4 py-3 text-right">Commission (10%)</th>
                  <th className="px-4 py-3 text-right">Driver Payout (90%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {driverRevenues.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500 text-xs">
                      No payout logs available.
                    </td>
                  </tr>
                ) : (
                  driverRevenues.map((driver) => (
                    <tr key={driver.driverId} className="hover:bg-slate-900/30 transition-all">
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-white">{driver.driverName}</p>
                        <p className="text-[9px] text-slate-500">{driver.ridesCompletedCount} rides</p>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300 text-xs font-medium">
                        ₹{Math.round(driver.grossEarnings)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-400 text-xs font-bold">
                        ₹{Math.round(driver.platformCommission)}
                      </td>
                      <td className="px-4 py-3 text-right text-indigo-400 text-xs font-bold">
                        ₹{Math.round(driver.netEarnings)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

export default AdminRevenue;
