import React from 'react';
import { FaUserCheck, FaUserTimes } from 'react-icons/fa';

function RideRequests({
  rideRequests,
  handleAcceptRequest,
  handleRejectRequest
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Ride Match Requests</h1>
        <p className="text-xs text-slate-400">Review pending commuter join requests on your active pool routes.</p>
      </div>

      {rideRequests.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-10 text-center text-xs text-slate-500">
          No pending match requests found at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rideRequests.map(req => (
            <div key={req.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 relative">
              <span className="absolute top-4 right-4 text-[9px] font-extrabold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full font-display">
                {req.match}% Match
              </span>

              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {req.passengerName.split(' ')[0][0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-display">{req.passengerName}</h4>
                  <p className="text-[9px] text-slate-500">{req.passengerCompany}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-855 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Request Route</span>
                  <span className="font-bold text-white">{req.pickup} → {req.dropoff}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAcceptRequest(req.id, req.rideId, req.passengerName)}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                >
                  <FaUserCheck /> Accept Request
                </button>
                <button
                  onClick={() => handleRejectRequest(req.id, req.passengerName)}
                  className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-semibold rounded-xl text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <FaUserTimes /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RideRequests;
