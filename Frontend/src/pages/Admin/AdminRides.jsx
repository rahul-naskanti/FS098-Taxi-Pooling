import React, { useState, useEffect } from 'react';
import { FaSearch, FaCar, FaRoad, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaWallet, FaCheckCircle, FaTimesCircle, FaMapSigns } from 'react-icons/fa';
import { adminService } from '../../services/adminService';

function AdminRides() {
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(''); // '', 'active', 'completed', 'cancelled'
  const [filter, setFilter] = useState(''); // '', 'full'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'revenue', 'passengers'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRides, setTotalRides] = useState(0);

  const fetchRides = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getRides({
        page,
        limit: 10,
        search,
        status,
        filter,
        sortBy
      });
      if (res.success) {
        setRides(res.rides);
        setTotalPages(res.totalPages);
        setTotalRides(res.totalRides);
      }
    } catch (err) {
      console.error('Error fetching rides logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [page, status, filter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRides();
  };

  const getStatusBadge = (rStatus) => {
    switch (rStatus) {
      case 'completed':
        return (
          <span className="text-[9px] uppercase tracking-wider font-black px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full inline-flex items-center gap-1">
            <FaCheckCircle className="text-[10px]" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[9px] uppercase tracking-wider font-black px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full inline-flex items-center gap-1">
            <FaTimesCircle className="text-[10px]" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[9px] uppercase tracking-wider font-black px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full inline-flex items-center gap-1">
            <FaRoad className="text-[10px]" /> Active
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">Ride Pools Ledger</h1>
          <p className="text-xs text-slate-500">View and audit all taxi pooling runs, routes, matches, and transactions.</p>
        </div>
        <div className="bg-[#0d1020] border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#141b35] text-indigo-400 flex items-center justify-center font-bold text-xs">
            {totalRides}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Total Ride Runs</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Matching filter criteria</p>
          </div>
        </div>
      </div>

      {/* Search, Filters, and Sorting panel */}
      <div className="bg-[#0d1020] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full xl:max-w-md">
          <input
            type="text"
            placeholder="Search by pickup or drop-off location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070a13] border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 py-3 pl-10 pr-4 rounded-xl transition-all outline-none"
          />
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
          <button type="submit" className="hidden" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="bg-[#070a13] border border-slate-800 text-xs text-slate-350 px-3 py-2 rounded-xl focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="newest">Creation Date</option>
              <option value="revenue">Gross Booking Value</option>
              <option value="passengers">Passengers Count</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Status</span>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="bg-[#070a13] border border-slate-800 text-xs text-slate-350 px-3 py-2 rounded-xl focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Ride Statuses</option>
              <option value="active">Active Pools</option>
              <option value="completed">Completed Pools</option>
              <option value="cancelled">Cancelled Runs</option>
            </select>
          </div>

          {/* Occupancy filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Capacity</span>
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="bg-[#070a13] border border-slate-800 text-xs text-slate-350 px-3 py-2 rounded-xl focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Occupancies</option>
              <option value="full">Full Pools Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-[#0d1020] border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 text-[10px] font-black uppercase tracking-wider bg-slate-950/30">
                <th className="px-6 py-4">Driver & Vehicle</th>
                <th className="px-6 py-4">Commute Route</th>
                <th className="px-6 py-4">Departure Time</th>
                <th className="px-6 py-4">Joined / Seats</th>
                <th className="px-6 py-4">Revenue Calculations</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-xs">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading ride records from database...</p>
                    </div>
                  </td>
                </tr>
              ) : rides.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-xs">
                    No rides recorded matching filters.
                  </td>
                </tr>
              ) : (
                rides.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-900/30 transition-all text-slate-300">
                    <td className="px-6 py-4">
                      {r.driver ? (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white leading-tight">{r.driver.fullName}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <FaCar className="text-[9px]" /> {r.driver.vehicleName || 'Vehicle'} ({r.driver.vehicleNumber || 'N/A'})
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-550 italic">Deleted Driver Account</p>
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-1 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-indigo-400 shrink-0 text-[10px]" />
                        <span className="text-xs font-bold text-white truncate" title={r.pickupLocation}>{r.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapSigns className="text-slate-500 shrink-0 text-[10px]" />
                        <span className="text-[10px] text-slate-450 truncate" title={r.dropLocation}>{r.dropLocation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                        <FaCalendarAlt className="text-slate-500 text-[10px]" /> {r.departureDate ? new Date(r.departureDate).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-[10px] text-slate-450 flex items-center gap-1.5">
                        <FaClock className="text-slate-500 text-[10px]" /> {r.departureTime || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <FaUsers className="text-indigo-400 text-[11px]" />
                        <span className="text-xs font-bold text-white">
                          {r.passengersCount || 0} Joined
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {r.availableSeats || 0} seats left (Type: {r.vehicleType || 'sedan'})
                      </p>
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      <p className="text-xs text-slate-200 font-medium">
                        ₹{r.pricePerSeat} / Seat
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Gross: <span className="text-white font-medium">₹{r.grossRevenue || 0}</span> | Comm (10%): <span className="text-emerald-400 font-bold">₹{r.platformCommission || 0}</span>
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {getStatusBadge(r.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-850 flex items-center justify-between bg-slate-950/20">
            <span className="text-[10px] font-medium text-slate-500">
              Showing page {page} of {totalPages} ({totalRides} total ride runs)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 disabled:opacity-50 text-[10px] font-bold rounded-lg transition-all text-slate-400 hover:text-white cursor-pointer"
              >
                Previous
              </button>
              <div className="flex gap-1 items-center">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                      page === i + 1 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-850'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 disabled:opacity-50 text-[10px] font-bold rounded-lg transition-all text-slate-400 hover:text-white cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRides;
