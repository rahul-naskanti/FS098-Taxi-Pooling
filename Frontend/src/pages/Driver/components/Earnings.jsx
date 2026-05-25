import React from 'react';

function Earnings({ stats, weeklyEarnings, maxEarnings }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Earnings Operations</h1>
        <p className="text-xs text-slate-400">Track and withdraw fare balances collected from passenger splits.</p>
      </div>

      {/* Earnings overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total Balance</p>
          <p className="text-3xl font-black text-white font-display mt-3">₹{stats.monthlyEarnings}</p>
          <button className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer">
            Withdraw Balance
          </button>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Weekly Earnings</p>
            <p className="text-3xl font-black text-emerald-400 font-display mt-3">₹{Math.round(stats.monthlyEarnings * 0.15)}</p>
          </div>
          <p className="text-[9px] text-slate-400 font-sans mt-3">Up 8% compared to last week</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Rides Finished</p>
            <p className="text-3xl font-black text-white font-display mt-3">{stats.ridesGiven} pools</p>
          </div>
          <p className="text-[9px] text-slate-400 font-sans mt-3">Average fuel offset: ₹125/ride</p>
        </div>
      </div>

      {/* Earnings chart */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white font-display">Weekly Fuel-Offset Breakdown</h3>
          <p className="text-[10px] text-slate-500">Gross payouts credited daily in current week</p>
        </div>

        <div className="relative pt-4">
          <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none opacity-5">
            <div className="w-full h-px bg-white"></div>
            <div className="w-full h-px bg-white"></div>
            <div className="w-full h-px bg-white"></div>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className="h-44 flex items-end justify-between px-2 sm:px-6 relative z-10">
            {weeklyEarnings.map((d, index) => {
              const percent = (d.amount / maxEarnings) * 100;
              return (
                <div key={index} className="flex flex-col items-center gap-2 w-full">
                  {d.amount > 0 ? (
                    <div 
                      style={{ height: `${percent}%` }}
                      className={`w-6 sm:w-8 rounded-t-lg flex items-end justify-center pb-2 text-[8px] font-black font-display transition-all duration-500 ${
                        d.amount >= 500 ? 'bg-gradient-to-t from-emerald-600 to-teal-400 text-slate-950' : 'bg-slate-800 text-slate-400'
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
    </div>
  );
}

export default Earnings;
