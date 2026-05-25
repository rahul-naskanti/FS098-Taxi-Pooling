import React from 'react';

function ActiveRides({ activeRides, handleCancelRide }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Active Ride Pools</h1>
        <p className="text-xs text-slate-400">Verify and monitor your matching commutes and passengers.</p>
      </div>

      {activeRides.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-855 rounded-2xl p-10 text-center text-xs text-slate-500">
          You have no active rides running. Create one to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeRides.map(ride => (
            <div key={ride.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative">
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-emerald-400 rounded-r"></div>

              <div className="space-y-2 pl-3">
                <span className="text-[9px] font-extrabold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-display uppercase">
                  {ride.status}
                </span>
                <h3 className="text-base font-bold text-white font-display pt-2">{ride.pickup} → {ride.dropoff}</h3>
                <p className="text-xs text-slate-400">Departure: <strong className="text-emerald-400">{ride.time}</strong> | Date: {ride.date}</p>
                {ride.notes && <p className="text-[10px] text-slate-500 italic">"{ride.notes}"</p>}
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0 self-end md:self-center">
                <div className="flex items-center gap-8 text-xs">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-slate-500">Matched Passengers</p>
                    <p className="font-bold text-white text-sm mt-0.5">{ride.passengersCount} commuters</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-slate-500">Remaining Seats</p>
                    <p className="font-bold text-emerald-400 text-sm mt-0.5">{ride.seats} available</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-slate-500">Price / Seat</p>
                    <p className="font-black text-white text-sm mt-0.5">₹{ride.price}</p>
                  </div>
                </div>

                {ride.status === 'Active - Matching' && handleCancelRide && (
                  <button
                    onClick={() => handleCancelRide(ride.id)}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 py-1.5 px-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel Pool
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActiveRides;
