import React from 'react';
import { FaSearch } from 'react-icons/fa';

function SavedRoutes({
  savedRoutes,
  setSearchPickup,
  setSearchDropoff,
  setActiveTab
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Saved Commuter Routes</h1>
        <p className="text-xs text-slate-400">Manage shortcuts for your standard daily routes.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedRoutes.map(route => (
          <div key={route.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-display">{route.name}</h3>
              <span className="text-[9px] font-extrabold px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded">
                {route.matches} pools active
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-855 space-y-1.5 text-xs">
              <p className="text-slate-500">From: <span className="font-bold text-white">{route.pickup}</span></p>
              <p className="text-slate-500">To: <span className="font-bold text-white">{route.dropoff}</span></p>
            </div>

            <button
              onClick={() => {
                setSearchPickup(route.pickup);
                setSearchDropoff(route.dropoff);
                setActiveTab('findRides');
              }}
              className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-855 hover:border-slate-800 text-[10px] font-bold text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FaSearch className="text-[9px]" /> Scan Route Pools
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedRoutes;
