import React, { useState, useEffect } from 'react';
import { FaPlusCircle } from 'react-icons/fa';

function CreateRide({
  pickup,
  setPickup,
  dropoff,
  setDropoff,
  date,
  setDate,
  time,
  setTime,
  seats,
  setSeats,
  vehicle,
  setVehicle,
  price,
  setPrice,
  notes,
  setNotes,
  formStatus,
  handleCreateRide
}) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const tempErrors = {};
    
    if (pickup && !pickup.trim()) {
      tempErrors.pickup = 'Pickup location is required';
    }
    
    if (dropoff && !dropoff.trim()) {
      tempErrors.dropoff = 'Drop location is required';
    }

    if (date) {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        tempErrors.date = 'Date cannot be in the past';
      }
    }

    if (seats) {
      const seatCount = parseInt(seats, 10);
      if (isNaN(seatCount) || seatCount < 1 || seatCount > 8) {
        tempErrors.seats = 'Seats must be between 1 and 8';
      }
    }

    if (price) {
      const priceVal = parseInt(price, 10);
      if (isNaN(priceVal) || priceVal < 10 || priceVal > 300) {
        tempErrors.price = 'Price per seat must be between ₹10 and ₹300';
      }
    }

    setErrors(tempErrors);
  }, [pickup, dropoff, date, seats, price]);

  const isFormInvalid = () => {
    if (!pickup.trim() || !dropoff.trim() || !date || !time || !seats || !price) {
      return true;
    }
    return Object.keys(errors).length > 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Create Ride Pool</h1>
        <p className="text-xs text-slate-400">Establish a route and share matching empty seats on your daily commute path.</p>
      </div>

      <div className="bg-gradient-to-b from-slate-900 to-[#0e1425] border border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl relative shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-3xl"></div>

        {formStatus && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl animate-fadeIn mb-6">
            {formStatus}
          </div>
        )}

        <form onSubmit={handleCreateRide} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pickup Location</label>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="e.g. Ameerpet"
                required
                className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none transition-colors ${
                  errors.pickup ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                }`}
              />
              {errors.pickup && <p className="text-red-400 text-[10px] mt-1">{errors.pickup}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drop Location</label>
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="e.g. Hitech City"
                required
                className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none transition-colors ${
                  errors.dropoff ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                }`}
              />
              {errors.dropoff && <p className="text-red-400 text-[10px] mt-1">{errors.dropoff}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Departure Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none transition-colors ${
                  errors.date ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                }`}
              />
              {errors.date && <p className="text-red-400 text-[10px] mt-1">{errors.date}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Departure Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available Seats</label>
              <input
                type="number"
                min="1"
                max="8"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                required
                className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none transition-colors ${
                  errors.seats ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                }`}
              />
              {errors.seats && <p className="text-red-400 text-[10px] mt-1">{errors.seats}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle Class</label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Hatchback">Hatchback</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Auto">Auto</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price per Seat (₹)</label>
              <input
                type="number"
                min="10"
                max="300"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none transition-colors ${
                  errors.price ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                }`}
              />
              {errors.price && <p className="text-red-400 text-[10px] mt-1">{errors.price}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Route Instructions / Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please wait near Google Building gate 2"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 h-20 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isFormInvalid()}
              className={`py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 font-display uppercase tracking-wide ${
                isFormInvalid() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <FaPlusCircle /> Register Ride Pool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRide;
