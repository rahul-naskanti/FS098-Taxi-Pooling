import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';

function MyBookings({ upcomingRides, handleCancelBooking }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">My Bookings</h1>
        <p className="text-xs text-slate-400">Manage your active carpool rides and match queues.</p>
      </div>

      {upcomingRides.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-10 text-center text-xs text-slate-500">
          You don't have any booked rides at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingRides.map(booking => (
            <div key={booking.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 relative">
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-emerald-400 rounded-r"></div>

              <div className="flex justify-between items-start pl-3">
                <div>
                  <h3 className="text-xs font-extrabold text-white font-display">Driver: {booking.driverName}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">{booking.driverCompany}</p>
                </div>
                <span className="text-[9px] font-extrabold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  {booking.status}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-855 space-y-2 text-xs pl-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Route</span>
                  <span className="font-bold text-white">{booking.pickup} → {booking.dropoff}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Departure</span>
                  <span className="font-bold text-emerald-400">{booking.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle</span>
                  <span className="text-slate-300 font-medium">{booking.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ride Fee</span>
                  <span className="font-bold text-white">₹{booking.price}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2 pl-3">
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 py-2 px-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl cursor-pointer"
                >
                  <FaTimesCircle /> Cancel Ride Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
