import React from 'react';
import { FaMapMarkedAlt, FaStar, FaCheckCircle } from 'react-icons/fa';

function FindRides({
  searchPickup,
  setSearchPickup,
  searchDropoff,
  setSearchDropoff,
  filteredRides,
  handleJoinRide
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Find Commuter Rides</h1>
        <p className="text-xs text-slate-400">Search and request corporate shared pools traveling in your direction.</p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <FaMapMarkedAlt className="text-xs" />
          </span>
          <input
            type="text"
            value={searchPickup}
            onChange={(e) => setSearchPickup(e.target.value)}
            placeholder="Search Pickup (e.g. Ameerpet)"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="md:col-span-5 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <FaMapMarkedAlt className="text-xs" />
          </span>
          <input
            type="text"
            value={searchDropoff}
            onChange={(e) => setSearchDropoff(e.target.value)}
            placeholder="Search Destination (e.g. Hitech City)"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="md:col-span-2">
          <button 
            onClick={() => {
              setSearchPickup('');
              setSearchDropoff('');
            }}
            className="w-full py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl text-xs active:scale-98 transition-all cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRides.length === 0 ? (
          <div className="col-span-2 bg-slate-900/20 border border-slate-850 rounded-2xl p-10 text-center text-xs text-slate-500">
            No matching rides found for current route. Try clearing search filters.
          </div>
        ) : (
          filteredRides.map(ride => (
            <div key={ride.id} className="bg-slate-900/40 border border-slate-800 hover:border-emerald-500/20 rounded-2xl p-6 space-y-4 shadow transition-all relative">
              <span className="absolute top-4 right-4 text-[9px] font-extrabold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full font-display">
                {ride.match}% Match
              </span>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {ride.driverName.split(' ')[0][0]}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-bold text-white font-display">{ride.driverName}</h3>
                    <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-sans">{ride.driverCompany}</span>
                  </div>
                  <div className="flex items-center text-[9px] text-amber-400 gap-0.5 mt-0.5">
                    <FaStar /> <span>{ride.driverRating}</span>
                    <span className="text-slate-500 ml-1">● Verified Driver</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-855 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Pickup</span>
                  <span className="font-bold text-white">{ride.pickup}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Dropoff</span>
                  <span className="font-bold text-white">{ride.dropoff}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-855 pt-2 mt-1">
                  <span className="text-slate-500">Start Time</span>
                  <span className="font-bold text-emerald-400">{ride.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Vehicle</span>
                  <span className="text-slate-300 font-medium">{ride.vehicle}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs font-black text-emerald-400 font-display">₹{ride.price} / seat</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">{ride.seats} seats remaining</p>
                </div>
                
                {ride.joined ? (
                  <span className="text-[10px] font-black px-3.5 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center gap-1.5">
                    <FaCheckCircle /> Requested
                  </span>
                ) : (
                  <button
                    onClick={() => handleJoinRide(ride.id)}
                    disabled={ride.seats === 0}
                    className={`px-4 py-2 text-[10px] font-bold rounded-xl active:scale-98 transition-all cursor-pointer ${
                      ride.seats === 0
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-transparent'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                    }`}
                  >
                    {ride.seats === 0 ? 'Full' : 'Join Ride'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FindRides;
