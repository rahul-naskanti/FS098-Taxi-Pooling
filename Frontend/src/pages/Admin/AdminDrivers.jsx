import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserMinus, FaUserPlus, FaCar, FaEnvelope, FaPhone, FaCalendarAlt, FaHistory, FaWallet, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaIdCard } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';

function AdminDrivers() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(''); // '', 'active', 'inactive'
  const [verificationStatus, setVerificationStatus] = useState(''); // '', 'pending', 'verified', 'rejected'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'earnings', 'rides', 'verified'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [togglingDriverId, setTogglingDriverId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getDrivers({
        page,
        limit: 10,
        search,
        status,
        verificationStatus,
        sortBy
      });
      if (res.success) {
        setDrivers(res.drivers);
        setTotalPages(res.totalPages);
        setTotalDrivers(res.totalDrivers);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, status, verificationStatus, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDrivers();
  };

  const handleToggleStatus = async (driverId) => {
    setTogglingDriverId(driverId);
    try {
      const res = await adminService.toggleUserStatus(driverId);
      if (res.success) {
        setDrivers(drivers.map(d => d._id === driverId ? { ...d, isActive: res.isActive } : d));
        showFeedback(res.message || 'Status updated successfully');
      }
    } catch (err) {
      console.error('Failed to toggle driver status:', err);
      showFeedback('Failed to toggle driver status', true);
    } finally {
      setTogglingDriverId(null);
    }
  };

  const showFeedback = (msg, isError = false) => {
    setFeedbackMsg({ text: msg, isError });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const getVerificationBadge = (vStatus) => {
    switch (vStatus) {
      case 'verified':
        return (
          <span className="text-[9px] uppercase tracking-wider font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full inline-flex items-center gap-1">
            <FaCheckCircle className="text-[10px]" /> Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="text-[9px] uppercase tracking-wider font-black px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full inline-flex items-center gap-1">
            <FaTimesCircle className="text-[10px]" /> Rejected
          </span>
        );
      default:
        return (
          <span className="text-[9px] uppercase tracking-wider font-black px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full inline-flex items-center gap-1">
            <FaExclamationTriangle className="text-[10px]" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">Driver Management</h1>
          <p className="text-xs text-slate-500">Monitor driver profiles, vehicles, verification states, and platform earnings.</p>
        </div>
        <div className="bg-[#0d1020] border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs">
            {totalDrivers}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Total Drivers</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Matching filter criteria</p>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={`p-3.5 border rounded-2xl text-xs font-bold animate-fadeIn ${
          feedbackMsg.isError 
            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {feedbackMsg.text}
        </div>
      )}

      {/* Search, Filter & Sorting Bar */}
      <div className="bg-[#0d1020] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full xl:max-w-md">
          <input
            type="text"
            placeholder="Search by name, vehicle, or license..."
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
              <option value="newest">Registration Date</option>
              <option value="earnings">Net Earnings</option>
              <option value="rides">Rides Created</option>
              <option value="verified">Verification Status</option>
            </select>
          </div>

          {/* Verification Status */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Verify State</span>
            <select
              value={verificationStatus}
              onChange={(e) => { setVerificationStatus(e.target.value); setPage(1); }}
              className="bg-[#070a13] border border-slate-800 text-xs text-slate-350 px-3 py-2 rounded-xl focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Verification States</option>
              <option value="pending">Pending Review</option>
              <option value="verified">Verified Profile</option>
              <option value="rejected">Rejected Profile</option>
            </select>
          </div>

          {/* Active Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Status</span>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="bg-[#070a13] border border-slate-800 text-xs text-slate-350 px-3 py-2 rounded-xl focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-[#0d1020] border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 text-[10px] font-black uppercase tracking-wider bg-slate-950/30">
                <th className="px-6 py-4">Driver Name</th>
                <th className="px-6 py-4">Vehicle & Documents</th>
                <th className="px-6 py-4">Net Earnings & Rides</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-xs">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-7 h-7 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading drivers from database...</p>
                    </div>
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-xs">
                    No drivers match your search filters.
                  </td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-900/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs border border-teal-500/15">
                          {d.fullName ? d.fullName.split(' ').map(n => n[0]).join('') : 'D'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{d.fullName}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <FaCalendarAlt className="text-[9px]" /> Joined: {new Date(d.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-[9px] text-slate-500">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <p className="text-xs text-slate-200 flex items-center gap-1.5 font-medium">
                        <FaCar className="text-slate-500 text-[10px]" /> {d.vehicleName || 'No Vehicle Info'} ({d.vehicleNumber || 'N/A'})
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <FaIdCard className="text-slate-500 text-[10px]" /> Lic: {d.licenseNumber || 'N/A'} (Seats: {d.availableSeats || 0})
                      </p>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <p className="text-xs text-white flex items-center gap-1.5 font-bold">
                        <FaWallet className="text-teal-400 text-[10px]" /> ₹{d.earnings || 0}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <FaHistory className="text-slate-500 text-[10px]" /> {d.ridesCreated || 0} pools ({d.passengersServed || 0} passengers served)
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div>{getVerificationBadge(d.verificationStatus)}</div>
                        {d.verificationStatus === 'pending' && (
                          <Link 
                            to="/admin/verifications" 
                            className="text-[9px] text-indigo-400 hover:text-indigo-300 underline font-bold"
                          >
                            Review Documents
                          </Link>
                        )}
                        {d.verificationStatus === 'rejected' && d.rejectionReason && (
                          <p className="text-[9px] text-red-400 italic max-w-[150px] truncate" title={d.rejectionReason}>
                            Reason: {d.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] uppercase tracking-wider font-black px-2.5 py-0.5 border rounded-full ${
                        d.isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {d.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(d._id)}
                        disabled={togglingDriverId === d._id}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                          d.isActive 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25' 
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25'
                        }`}
                      >
                        {togglingDriverId === d._id ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        ) : d.isActive ? (
                          <>
                            <FaUserMinus className="text-[11px]" /> Deactivate
                          </>
                        ) : (
                          <>
                            <FaUserPlus className="text-[11px]" /> Reactivate
                          </>
                        )}
                      </button>
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
              Showing page {page} of {totalPages} ({totalDrivers} total drivers)
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

export default AdminDrivers;
