import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCarSide, FaMapMarkerAlt, FaLocationArrow, FaCalendarAlt, FaClock, FaTimes, FaUserFriends, FaChevronDown, FaTag, FaCheckCircle, FaSearch } from 'react-icons/fa';

function HeroSection() {
  const [city, setCity] = useState('Bhopal, IN');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [timeMode, setTimeMode] = useState('now'); // 'now' or 'reserve'
  const [reserveDate, setReserveDate] = useState('');
  const [reserveTime, setReserveTime] = useState('');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  
  const [showPrices, setShowPrices] = useState(false);
  const [selectedRide, setSelectedRide] = useState('hatchback');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  
  const availableCities = [
    'Bhopal, IN',
    'Hyderabad, IN',
    'Bangalore, IN',
    'Delhi NCR, IN',
    'Mumbai, IN'
  ];

  const handleUseCurrentLocation = () => {
    setPickup('My Current Location (Bhopal)');
  };

  const handleSeePrices = (e) => {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim()) {
      alert('Please enter both pickup and dropoff locations to estimate prices.');
      return;
    }
    setShowPrices(true);
    setBookingSuccess(false);
  };

  const handleBookRide = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setBookingSuccess(true);
    }, 2500);
  };

  // Generate dynamic distance and rates based on input string lengths to simulate live route math
  const getRouteMetrics = () => {
    const combinedLength = pickup.length + dropoff.length;
    const distance = Math.max(5, (combinedLength % 25) + 3.5); // in km
    const duration = Math.round(distance * 2.2); // in minutes
    return {
      distance: distance.toFixed(1),
      duration,
      rates: {
        solo: Math.round(distance * 18),
        hatchback: Math.round(distance * 6.5),
        sedan: Math.round(distance * 8.5),
        auto: Math.round(distance * 4.5)
      }
    };
  };

  const metrics = getRouteMetrics();

  return (
    <section id="home" className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-[#0b0f19]">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-1/4 right-1/10 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '12s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Uber-Style Booking Form Widget */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* City display and Selector trigger */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
              <FaMapMarkerAlt className="text-emerald-400" />
              <span>{city}</span>
              <button 
                onClick={() => setIsCityModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 font-extrabold underline decoration-emerald-400/40 hover:decoration-emerald-300 cursor-pointer ml-1"
              >
                Change city
              </button>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight font-display">
                Request a ride for <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  now or later
                </span>
              </h1>
              
              {/* Promotion banner */}
              <div className="flex items-start gap-3 bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-2xl max-w-md">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <FaTag className="text-xs" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Up to 50% off your first 5 TaxiPool rides. T&Cs apply.*</p>
                  <p className="text-slate-500 mt-0.5">*Valid within 15 days of signup.</p>
                </div>
              </div>
            </div>

            {/* Main Interactive Form Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-3xl"></div>
              
              <form onSubmit={handleSeePrices} className="space-y-5">
                
                {/* Time selector dropdown trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                    className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <FaClock className="text-emerald-400 text-xs" />
                    <span>{timeMode === 'now' ? 'Pickup now' : 'Reserve for later'}</span>
                    <FaChevronDown className={`text-[10px] text-slate-400 transition-transform ${isTimeDropdownOpen ? 'rotate-185' : ''}`} />
                  </button>

                  {/* Time Mode Dropdown panel */}
                  {isTimeDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-20 space-y-1 animate-fadeIn">
                      <button
                        type="button"
                        onClick={() => {
                          setTimeMode('now');
                          setIsTimeDropdownOpen(false);
                          setShowPrices(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          timeMode === 'now' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2"><FaClock /> Pickup now</span>
                        {timeMode === 'now' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTimeMode('reserve');
                          setIsTimeDropdownOpen(false);
                          setShowPrices(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          timeMode === 'reserve' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2"><FaCalendarAlt /> Reserve for later</span>
                        {timeMode === 'reserve' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                      </button>
                    </div>
                  )}
                </div>

                {/* Reserve Schedule Inputs */}
                {timeMode === 'reserve' && (
                  <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                      <input
                        type="date"
                        value={reserveDate}
                        onChange={(e) => setReserveDate(e.target.value)}
                        required={timeMode === 'reserve'}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time</label>
                      <input
                        type="time"
                        value={reserveTime}
                        onChange={(e) => setReserveTime(e.target.value)}
                        required={timeMode === 'reserve'}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                )}

                {/* Route Inputs Group */}
                <div className="relative space-y-3">
                  {/* Decorative connecting line between dots */}
                  <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-800 -z-10"></div>
                  
                  {/* Pickup location */}
                  <div className="relative flex items-center">
                    <span className="absolute left-4 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    </span>
                    <input
                      type="text"
                      value={pickup}
                      onChange={(e) => {
                        setPickup(e.target.value);
                        setShowPrices(false);
                      }}
                      placeholder="Enter pickup location"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      title="Use Current Location"
                      className="absolute right-4 p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                    >
                      <FaLocationArrow className="text-xs" />
                    </button>
                  </div>

                  {/* Dropoff location */}
                  <div className="relative flex items-center">
                    <span className="absolute left-4 w-4 h-4 rounded-lg bg-teal-500/20 border border-teal-400 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-sm bg-teal-400"></span>
                    </span>
                    <input
                      type="text"
                      value={dropoff}
                      onChange={(e) => {
                        setDropoff(e.target.value);
                        setShowPrices(false);
                      }}
                      placeholder="Where to?"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Primary Button */}
                {!showPrices && (
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-display"
                  >
                    <FaSearch className="text-[10px]" /> See prices
                  </button>
                )}
              </form>

              {/* Dynamic Prices Drawer Panel */}
              {showPrices && (
                <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-5 animate-slideDown">
                  
                  {/* Route Summary */}
                  <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <div className="text-slate-400">
                      <span className="font-bold text-white">{metrics.distance} km</span> commute
                    </div>
                    <div className="text-slate-400">
                      Duration: <span className="font-bold text-white">~{metrics.duration} mins</span>
                    </div>
                  </div>

                  {/* Ride Options List */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    
                    {/* Option 1: Hatchback Pool (Recommended) */}
                    <div
                      onClick={() => setSelectedRide('hatchback')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedRide === 'hatchback'
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow shadow-emerald-500/5'
                          : 'bg-slate-950/60 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                          <FaCarSide className="text-lg" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">Hatchback Pool</h4>
                            <span className="text-[8px] font-extrabold px-1.5 py-0.2 bg-emerald-500 text-slate-950 rounded-full font-display">Best Value</span>
                          </div>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <FaUserFriends /> 3 seats available
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-emerald-400 font-display">₹{metrics.rates.hatchback}</p>
                        <p className="text-[8px] text-slate-500">shared pool price</p>
                      </div>
                    </div>

                    {/* Option 2: Sedan Pool */}
                    <div
                      onClick={() => setSelectedRide('sedan')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedRide === 'sedan'
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow shadow-emerald-500/5'
                          : 'bg-slate-950/60 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                          <FaCarSide className="text-lg" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Sedan Pool</h4>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <FaUserFriends /> 4 seats available
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-white font-display">₹{metrics.rates.sedan}</p>
                        <p className="text-[8px] text-slate-500">shared pool price</p>
                      </div>
                    </div>

                    {/* Option 3: Auto Pool */}
                    <div
                      onClick={() => setSelectedRide('auto')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedRide === 'auto'
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow shadow-emerald-500/5'
                          : 'bg-slate-950/60 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-slate-400 flex items-center justify-center shrink-0">
                          <FaCarSide className="text-base" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-300">Auto Pool</h4>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <FaUserFriends /> 2 seats available
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-300 font-display">₹{metrics.rates.auto}</p>
                        <p className="text-[8px] text-slate-500">shared pool price</p>
                      </div>
                    </div>

                    {/* Option 4: Solo Cab (Reference Price) */}
                    <div
                      className="p-3.5 rounded-2xl border bg-slate-950/20 border-slate-900/40 flex items-center justify-between opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 text-slate-600 flex items-center justify-center shrink-0">
                          <FaCarSide className="text-base text-slate-650" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500">Solo Cab (Non-pooled)</h4>
                          <p className="text-[10px] text-slate-650 mt-0.5">Personal travel rate</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-550 line-through">₹{metrics.rates.solo}</p>
                        <p className="text-[8px] text-slate-600">standard solo fare</p>
                      </div>
                    </div>

                  </div>

                  {/* Matching Loading overlay or Success Dialog */}
                  {isMatching ? (
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex flex-col items-center justify-center py-6 space-y-3">
                      <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                      <p className="text-xs font-bold text-white tracking-wide">Searching for co-riders on your path...</p>
                      <p className="text-[10px] text-slate-500">Matching route overlap and splitting fuel cost</p>
                    </div>
                  ) : bookingSuccess ? (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl space-y-2 animate-scaleUp">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <FaCheckCircle className="text-sm" />
                        <h4 className="text-xs font-bold font-display uppercase tracking-wider">Ride Successfully Matched!</h4>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-normal">
                        Awesome! We matched you with Rahul driving on a {selectedRide} pool route from <strong>{pickup}</strong> to <strong>{dropoff}</strong>.
                      </p>
                      <div className="pt-2 flex gap-2">
                        <Link 
                          to="/signup" 
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          Complete Sign Up to Join Pool
                        </Link>
                        <button
                          onClick={() => setShowPrices(false)}
                          className="px-3 py-1.5 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-lg text-[10px] cursor-pointer"
                        >
                          Book Another
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBookRide}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-98 transition-all cursor-pointer font-display text-xs uppercase tracking-wider"
                    >
                      Confirm and Match Pool
                    </button>
                  )}

                </div>
              )}

            </div>

          </div>

          {/* Right Column: Premium App Graphic with Generated Sunset Illustration */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

              {/* Header bar of graphic panel */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Route Visualizer</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded">Live Map</span>
              </div>

              {/* Sunset illustration display */}
              <div className="relative rounded-2xl overflow-hidden shadow-inner border border-slate-850 aspect-square">
                <img
                  src="/hero_illustration.png"
                  alt="Taxi Pooling Commuter Sunset Illustration"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />
                
                {/* Floating overlay matching detail for high fidelity */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-[10px] text-emerald-400 font-black">
                      TP
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white">Active Commuters Pool</p>
                      <p className="text-[8px] text-slate-500">Split fuel, save atmosphere</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-extrabold px-2 py-0.5 bg-emerald-400 text-slate-950 rounded-full font-display">94% Match</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* City Switcher Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-scaleUp">
            <button
              onClick={() => setIsCityModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 cursor-pointer"
            >
              <FaTimes className="text-xs" />
            </button>

            <h3 className="text-base font-bold text-white mb-4 font-display">Select Commuting Region</h3>
            
            <div className="space-y-1.5">
              {availableCities.map((cityName) => (
                <button
                  key={cityName}
                  onClick={() => {
                    setCity(cityName);
                    setIsCityModalOpen(false);
                    setShowPrices(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    city === cityName
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'border border-transparent text-slate-350 hover:bg-slate-950'
                  }`}
                >
                  <span>{cityName}</span>
                  {city === cityName && <FaCheckCircle className="text-emerald-400 text-xs" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tailwind helper animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </section>
  );
}

export default HeroSection;
