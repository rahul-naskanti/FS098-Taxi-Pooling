import React from 'react';
import { FaStar } from 'react-icons/fa';

function RideHistory({ historyList }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Ride History</h1>
        <p className="text-xs text-slate-400">Review your past commutes and carbon offset logs.</p>
      </div>

      <div className="bg-[#0d1020] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-900/30 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="py-4 px-6">Driver</th>
                <th className="py-4 px-6">Route</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Fare Paid</th>
                <th className="py-4 px-6">Your Rating</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/80 text-xs">
              {historyList.map(item => (
                <tr key={item.id} className="hover:bg-slate-900/25 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">{item.driver}</td>
                  <td className="py-4 px-6 text-slate-350">{item.route}</td>
                  <td className="py-4 px-6 text-slate-455">{item.date}</td>
                  <td className="py-4 px-6 font-bold text-emerald-400">₹{item.fare}</td>
                  <td className="py-4 px-6">
                    <div className="flex text-amber-400 text-[10px] gap-0.5">
                      {[...Array(item.rating)].map((_, i) => <FaStar key={i} />)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
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
