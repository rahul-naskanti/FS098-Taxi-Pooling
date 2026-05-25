import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserMinus, FaUserPlus, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaHistory, FaPiggyBank } from 'react-icons/fa';
import { adminService } from '../../services/adminService';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(''); // '', 'active', 'inactive'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers({
        page,
        limit: 10,
        search,
        status
      });
      if (res.success) {
        setUsers(res.users);
        setTotalPages(res.totalPages);
        setTotalUsers(res.totalUsers);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (userId) => {
    setTogglingUserId(userId);
    try {
      const res = await adminService.toggleUserStatus(userId);
      if (res.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: res.isActive } : u));
        showFeedback(res.message || 'Status updated successfully');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showFeedback('Failed to toggle user status', true);
    } finally {
      setTogglingUserId(null);
    }
  };

  const showFeedback = (msg, isError = false) => {
    setFeedbackMsg({ text: msg, isError });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">Passenger Management</h1>
          <p className="text-xs text-slate-500">Monitor and manage passenger accounts, bookings, and active status.</p>
        </div>
        <div className="bg-[#0d1020] border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
            {totalUsers}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Total Commuters</p>
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

      {/* Search & Filters */}
      <div className="bg-[#0d1020] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070a13] border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 py-3 pl-10 pr-4 rounded-xl transition-all outline-none"
          />
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
          <button type="submit" className="hidden" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <div className="flex bg-[#070a13] border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => { setStatus(''); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                status === '' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => { setStatus('active'); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Only
            </button>
            <button
              onClick={() => { setStatus('inactive'); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                status === 'inactive' ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Deactivated
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0d1020] border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 text-[10px] font-black uppercase tracking-wider bg-slate-950/30">
                <th className="px-6 py-4">Commuter</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Stats & Savings</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-xs">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading passengers from database...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-xs">
                    No passengers match your search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/15">
                          {u.fullName ? u.fullName.split(' ').map(n => n[0]).join('') : 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{u.fullName}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <FaCalendarAlt className="text-[9px]" /> Registered: {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      <p className="text-xs text-slate-300 flex items-center gap-1.5">
                        <FaEnvelope className="text-slate-500 text-[10px]" /> {u.email}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <FaPhone className="text-slate-500 text-[10px]" /> {u.phone || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <p className="text-xs text-white flex items-center gap-1.5">
                        <FaHistory className="text-indigo-400 text-[10px]" /> {u.bookingCount || 0} rides joined
                      </p>
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-medium">
                        <FaPiggyBank className="text-emerald-500 text-[10px]" /> ₹{u.savingsEstimate || 0} saved
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] uppercase tracking-wider font-black px-2.5 py-0.5 border rounded-full ${
                        u.isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        disabled={togglingUserId === u._id}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                          u.isActive 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25' 
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25'
                        }`}
                      >
                        {togglingUserId === u._id ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        ) : u.isActive ? (
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
              Showing page {page} of {totalPages} ({totalUsers} total passengers)
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

export default AdminUsers;
