import React, { useState, useEffect } from 'react';
import { FaCalculator, FaGasPump, FaLeaf, FaWallet } from 'react-icons/fa';

function CostCalculatorSection() {
  const [distance, setDistance] = useState(25); // km daily
  const [mode, setMode] = useState('cab'); // cab, car, bike
  const [savings, setSavings] = useState({ monthly: 0, yearly: 0, co2: 0 });

  // Rates in ₹ per km
  const rates = {
    cab: 22,    // solo cab
    car: 14,    // personal car
    bike: 4     // two wheeler
  };

  // Taxi pooling estimated split cost (shared by 3 passengers on average)
  const poolRate = 7; 

  useEffect(() => {
    const workingDays = 22; // average working days in a month
    const dailySoloCost = distance * 2 * rates[mode]; // round trip
    const dailyPoolCost = distance * 2 * poolRate;
    
    let monthlySaving = (dailySoloCost - dailyPoolCost) * workingDays;
    
    // Bike might be slightly cheaper but pooling is safer/comfortable, 
    // let's ensure savings aren't negative for representation, or represent convenience value
    if (monthlySaving < 0) {
      monthlySaving = 0;
    }

    const yearlySaving = monthlySaving * 12;
    // CO2 offset estimate: ~0.12kg per km saved (cabs/cars off road)
    const monthlyCo2 = mode !== 'bike' ? Math.round(distance * 2 * 0.12 * workingDays) : 0;

    setSavings({
      monthly: Math.round(monthlySaving),
      yearly: Math.round(yearlySaving),
      co2: monthlyCo2
    });
  }, [distance, mode]);

  return (
    <section className="py-24 bg-[#0a0d17] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Savings Estimator
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Calculate Your Taxi Pooling Savings
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            See how much cash you keep in your wallet and how much carbon footprint you prevent by matching rides.
          </p>
        </div>

        {/* Calculator Widget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Controls Card */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between">
            <div className="space-y-8">
              
              {/* Transport Mode Switcher */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Current Travel Mode
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
                    onClick={() => setMode('cab')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      mode === 'cab'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Solo Cab
                  </button>
                  <button
                    onClick={() => setMode('car')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      mode === 'car'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Solo Car
                  </button>
                  <button
                    onClick={() => setMode('bike')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      mode === 'bike'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Two Wheeler
                  </button>
                </div>
              </div>

              {/* Distance Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Daily Round-Trip Distance
                  </label>
                  <span className="text-emerald-400 font-extrabold text-sm font-display">
                    {distance * 2} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={distance}
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>10 km round-trip</span>
                  <span>200 km round-trip</span>
                </div>
              </div>

            </div>

            {/* Micro Details note */}
            <p className="text-[11px] text-slate-500 mt-8 pt-4 border-t border-slate-850">
              *Calculations are based on 22 commuting days per month, assuming a typical 3-rider pool split. Actual rates vary dynamically based on traffic.
            </p>
          </div>

          {/* Results Card */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 to-[#121c2f] border border-slate-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl"></div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-400">
                <FaCalculator className="text-lg" />
                <span className="text-xs font-bold uppercase tracking-wider">Estimated Savings</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Monthly Savings</p>
                <p className="text-4xl sm:text-5xl font-black text-white font-display">
                  ₹{savings.monthly.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs uppercase tracking-wide">
                    <FaWallet className="text-emerald-500/80" /> Yearly Saved
                  </div>
                  <p className="text-lg font-bold text-white font-display">
                    ₹{savings.yearly.toLocaleString('en-IN')}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs uppercase tracking-wide">
                    <FaLeaf className="text-teal-500/80" /> CO₂ Offset
                  </div>
                  <p className="text-lg font-bold text-teal-400 font-display">
                    {savings.co2} kg / mo
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-slate-950/60 rounded-2xl p-4 border border-slate-850 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <FaGasPump className="text-sm" />
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                {mode === 'bike' 
                  ? "Even compared to a bike, pooling protects you from heat, rain, and pollution while maintaining a low travel budget!"
                  : "You're keeping vehicle emissions low! Pooling matches empty seats to slash traffic bottlenecks and fuel burns."
                }
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default CostCalculatorSection;
