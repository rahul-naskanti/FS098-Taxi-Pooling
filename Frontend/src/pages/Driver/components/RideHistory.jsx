import React from 'react';

function RideHistory({ historyList }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Completed Commutes</h1>
        <p className="text-xs text-slate-400">Review past ride stats, passengers, and split fares paid.</p>
      </div>

      <div className="bg-[#0d1020] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-855 bg-slate-900/30 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="py-4 px-6">Route</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Passengers Carried</th>
                <th className="py-4 px-6">Fare Earned</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-855/80 text-xs">
              {historyList.map(item => (
                <tr key={item.id} className="hover:bg-slate-900/25 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">{item.route}</td>
                  <td className="py-4 px-6 text-slate-350">{item.date}</td>
                  <td className="py-4 px-6 text-slate-450">{item.passengers} poolers</td>
                  <td className="py-4 px-6 font-bold text-emerald-400">₹{item.earned}</td>
                  <td className="py-4 px-6">
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-display uppercase">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RideHistory;
