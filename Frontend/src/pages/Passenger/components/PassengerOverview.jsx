import React from 'react';
import {
  FaCar, FaWallet, FaLeaf, FaUsers, FaTimesCircle, FaChevronRight
} from 'react-icons/fa';

function PassengerOverview({
  stats,
  weeklySavingsData,
  maxSavings,
  upcomingRides,
  handleCancelBooking,
  activities,
  setActiveTab,
  userName = "John Doe"
}) {
  return (
    <div className="space-y-8">
      {/* Welcome Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Welcome Back, {userName}!</h1>
          <p className="text-xs text-slate-400">Save money and reduce carbon emission on your daily Hyderabad commutes.</p>
        </div>
        <button
          onClick={() => setActiveTab('findRides')}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl shadow-md text-xs cursor-pointer flex items-center gap-1 font-display uppercase tracking-wide"
        >
          Find Ride Pool <FaChevronRight className="text-[10px]" />
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats 1: Total Commutes */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-emerald-400/10 text-4xl"><FaCar /></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total Commutes</p>
          <p className="text-2xl sm:text-3xl font-black text-white font-display mt-3">{stats.totalRides} trips</p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-sans">
            ✓ All routes verified
          </p>
        </div>

        {/* Stats 2: Money Saved */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-teal-400/10 text-4xl"><FaWallet /></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Money Saved</p>
          <p className="text-2xl sm:text-3xl font-black text-white font-display mt-3">₹{stats.moneySaved}</p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-sans">
            vs solo taxi fare
          </p>
        </div>

        {/* Stats 3: CO2 Reduced */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-emerald-400/10 text-4xl"><FaLeaf /></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">CO₂ Reduced</p>
          <p className="text-2xl sm:text-3xl font-black text-teal-400 font-display mt-3">{stats.co2Reduced} kg</p>
          <p className="text-[10px] text-slate-400 mt-1 font-sans">
            Equivalent to 3.4 trees planted
          </p>
        </div>

        {/* Stats 4: Active Pools */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-teal-400/10 text-4xl"><FaUsers /></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Active Pools</p>
          <p className="text-2xl sm:text-3xl font-black text-white font-display mt-3">{stats.activePools} request</p>
          <p className="text-[10px] text-teal-400 flex items-center gap-1 mt-1 font-sans animate-pulse">
            ● Ready for match
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">

          {/* Savings Analysis Chart */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-display">Commuter Savings Analysis</h3>
                <p className="text-[10px] text-slate-500">Weekly comparison: TaxiPool vs Single Taxi Rates</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                Saved 62% average
              </span>
            </div>

            <div className="relative pt-4">
              <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none opacity-5">
                <div className="w-full h-px bg-white"></div>
                <div className="w-full h-px bg-white"></div>
                <div className="w-full h-px bg-white"></div>
                <div className="w-full h-px bg-white"></div>
              </div>

              <div className="h-44 flex items-end justify-between px-2 sm:px-6 relative z-10">
                {weeklySavingsData.map((d, index) => {
                  const percent = (d.amount / maxSavings) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center gap-2 w-full">
                      {d.amount > 0 ? (
                        <div
                          style={{ height: `${percent}%` }}
                          className={`w-6 sm:w-8 rounded-t-lg flex items-end justify-center pb-2 text-[8px] font-black font-display transition-all duration-500 ${d.amount >= 90 ? 'bg-gradient-to-t from-emerald-600 to-teal-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                        >
                          ₹{d.amount}
                        </div>
                      ) : (
                        <div className="w-6 sm:w-8 bg-slate-800 rounded-t-lg h-1 transition-all duration-500"></div>
                      )}
                      <span className="text-[9px] font-bold text-slate-500">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming booked Commutes */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Upcoming Commute Pools</h3>

            {upcomingRides.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 text-center text-xs text-slate-500">
                No upcoming carpools found. Match a route to start traveling.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingRides.map(booking => (
                  <div key={booking.id} className="bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 relative">
                    <div className="absolute left-0 top-6 bottom-6 w-1 bg-emerald-400 rounded-r"></div>

                    <div className="flex items-start justify-between pl-3">
                      <div>
                        <h4 className="text-xs font-extrabold text-white font-display">Driver: {booking.driverName}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{booking.driverCompany}</p>
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                        {booking.status}
                      </span>
                    </div>

                    <div className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5 pl-3">
                      <p className="text-slate-400">Route: <span className="font-bold text-white">{booking.pickup} → {booking.dropoff}</span></p>
                      <p className="text-slate-400">Vehicle: <span className="text-slate-300">{booking.vehicle}</span></p>
                      <p className="text-slate-400">Departure: <span className="font-bold text-emerald-400">{booking.time}</span></p>
                    </div>

                    <div className="flex items-center justify-between pt-2 pl-3">
                      <span className="text-xs font-black text-white font-display">Fare: ₹{booking.price}</span>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 py-1 px-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg cursor-pointer"
                      >
                        <FaTimesCircle /> Cancel Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activities */}
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
                          <span className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${act.type === 'match' ? 'bg-emerald-500/10 text-emerald-400' :
                              act.type === 'completed' ? 'bg-teal-500/10 text-teal-400' :
                                act.type === 'joined' ? 'bg-emerald-400 text-slate-950' :
                                  act.type === 'cancel' ? 'bg-red-500/10 text-red-400' :
                                    'bg-slate-900 text-slate-400'
                            }`}>
                            {act.type === 'match' ? 'MP' :
                              act.type === 'completed' ? 'RC' :
                                act.type === 'joined' ? 'JR' :
                                  act.type === 'cancel' ? 'XX' : 'SYS'}
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

export default PassengerOverview;
