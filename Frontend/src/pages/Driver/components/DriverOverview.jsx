import React from 'react';
import {
  FaRoad, FaWallet, FaUsers, FaCar, FaUserCheck, FaUserTimes
} from 'react-icons/fa';

function DriverOverview({
  stats,
  rideRequests,
  handleAcceptRequest,
  handleRejectRequest,
  activeRides,
  activities,
  setActiveTab,
  userName = "Rahul"
}) {
  return (
    <div className="space-y-8">
      {/* Welcome Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Welcome Back, {userName}!</h1>
          <p className="text-xs text-slate-400">Share your empty vehicle seats to cover fuel costs and relieve Hyderabad traffic.</p>
        </div>
        <button
          onClick={() => setActiveTab('createRide')}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl shadow-md text-xs cursor-pointer uppercase font-display tracking-wider"
        >
          Create New Ride Pool
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats 1: Rides Given */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-emerald-400/10 text-4xl"><FaRoad /></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Rides Shared</p>
          <p className="text-2xl sm:text-3xl font-black text-white font-display mt-3">{stats.ridesGiven} pools</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-sans">✓ Satisfied co-commuters</p>
        </div>

        {/* Stats 2: Monthly Earnings */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-teal-400/10 text-4xl"><FaWallet /></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Monthly Earnings</p>
          <p className="text-2xl sm:text-3xl font-black text-white font-display mt-3">₹{stats.monthlyEarnings}</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-sans">₹{Math.round(stats.monthlyEarnings * 0.15)} earned this week</p>
        </div>

        {/* Stats 3: Passengers Commuted */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-emerald-400/10 text-4xl"><FaUsers /></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Passengers Carried</p>
          <p className="text-2xl sm:text-3xl font-black text-white font-display mt-3">{stats.totalPassengers} poolers</p>
          <p className="text-[10px] text-slate-400 mt-1 font-sans">Avg. 2.8 passengers/pool</p>
        </div>

        {/* Stats 4: Active Pools */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-teal-400/10 text-4xl"><FaCar /></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Active Route Pools</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-display mt-3">{stats.activePools} route</p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-sans animate-pulse">
            ● Scanning for matches
          </p>
        </div>
      </div>

      {/* Main Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column (8 units): Pending Requests and Active Rides */}
        <div className="lg:col-span-8 space-y-8">

          {/* Pending Ride Requests */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Pending Passenger Requests</h3>

            {rideRequests.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-855 rounded-2xl p-6 text-center text-xs text-slate-500">
                No pending join requests found for your active pools.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rideRequests.map(req => (
                  <div key={req.id} className="bg-gradient-to-b from-slate-900/80 to-slate-955 border border-slate-800 rounded-2xl p-5 space-y-4 relative">
                    <span className="absolute top-4 right-4 text-[9px] font-extrabold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full font-display">
                      {req.match}% Match
                    </span>

                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-extrabold text-sm shrink-0">
                        {req.passengerName[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-display">{req.passengerName}</h4>
                        <p className="text-[9px] text-slate-500">{req.passengerCompany}</p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-855 text-xs space-y-1.5">
                      <p className="text-slate-400">Passenger Pickup: <span className="font-bold text-white">{req.pickup}</span></p>
                      <p className="text-slate-400">Passenger Dropoff: <span className="font-bold text-white">{req.dropoff}</span></p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(req.id, req.rideId, req.passengerName)}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-[10px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-emerald-500/5"
                      >
                        <FaUserCheck className="text-[10px]" /> Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id, req.passengerName)}
                        className="flex-1 py-2 bg-slate-955 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-semibold rounded-lg text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <FaUserTimes className="text-[10px]" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Commute Pools */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Your Active Shared Cabs</h3>

            {activeRides.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-855 rounded-2xl p-6 text-center text-xs text-slate-500">
                No active pools at this moment. Create a ride to begin matching passengers.
              </div>
            ) : (
              <div className="space-y-3">
                {activeRides.map(ride => (
                  <div key={ride.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded font-display uppercase">
                        {ride.status}
                      </span>
                      <h4 className="text-sm font-bold text-white font-display mt-2">{ride.pickup} → {ride.dropoff}</h4>
                      <p className="text-[10px] text-slate-400">Date: {ride.date} | Departure: {ride.time}</p>
                      {ride.notes && <p className="text-[9px] text-slate-500 italic mt-1 font-sans">"{ride.notes}"</p>}
                    </div>

                    <div className="flex items-center gap-6 text-xs text-right">
                      <div>
                        <p className="text-[10px] text-slate-500">Passengers</p>
                        <p className="font-bold text-white text-sm">{ride.passengersCount} poolers</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Remaining Seats</p>
                        <p className="font-bold text-emerald-400 text-sm">{ride.seats} seats</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Price / Seat</p>
                        <p className="font-black text-white text-sm">₹{ride.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 units): Quick Activity feed */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest font-display">Recent Activity</h3>

            <div className="flow-root">
              <ul className="-mb-8">
                {activities.map((act, idx) => (
                  <li key={act.id}>
                    <div className="relative pb-8">
                      {idx !== activities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true"></span>
                      ) : null}

                      <div className="relative flex space-x-3 items-start">
                        <div>
                          <span className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${act.type === 'create' ? 'bg-emerald-500/10 text-emerald-400' :
                              act.type === 'request' ? 'bg-teal-500/10 text-teal-400' :
                                act.type === 'accept' ? 'bg-emerald-400 text-slate-950' :
                                  act.type === 'payout' ? 'bg-emerald-500/10 text-emerald-400' :
                                    act.type === 'decline' ? 'bg-red-500/10 text-red-400' :
                                      'bg-slate-900 text-slate-400'
                            }`}>
                            {act.type === 'create' ? 'CR' :
                              act.type === 'request' ? 'RQ' :
                                act.type === 'accept' ? 'AC' :
                                  act.type === 'decline' ? 'RJ' :
                                    act.type === 'payout' ? 'PO' : 'SYS'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-xs text-slate-350 leading-normal font-medium">{act.text}</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">{act.time}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DriverOverview;
