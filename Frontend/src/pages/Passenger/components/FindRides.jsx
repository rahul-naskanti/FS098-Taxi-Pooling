import React, { useState, useEffect, useRef } from 'react';
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaExchangeAlt, 
  FaStar, FaCheckCircle, FaHeart, FaRegHeart, FaShareAlt, 
  FaBell, FaWind, FaBolt, FaVenus, FaEye, FaRegFileAlt, FaShieldAlt
} from 'react-icons/fa';
import { rideService } from '../../../services/rideService';

const HYDERABAD_HUBS = [
  'Ameerpet', 'Kukatpally', 'Madhapur', 'Hitech City', 
  'Gachibowli', 'Secunderabad', 'Kondapur', 'Jubilee Hills', 
  'Banjara Hills', 'Begumpet'
];

function FindRides({ handleJoinRide, onBookingSuccess }) {
  // Search input state
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState(1);

  // Autocomplete states
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [showPickupList, setShowPickupList] = useState(false);
  const [showDropList, setShowDropList] = useState(false);

  // Suggestions container references for click-outside close
  const pickupRef = useRef();
  const dropRef = useRef();

  // Results & saved states
  const [rides, setRides] = useState([]);
  const [savedRideIds, setSavedRideIds] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);

  // Sidebar Filter States
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedTimes, setSelectedTimes] = useState([]); // morning, afternoon, evening, night
  const [selectedVehicles, setSelectedVehicles] = useState([]); // SUV, Sedan, Hatchback
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [instantOnly, setInstantOnly] = useState(false);
  const [femaleFriendlyOnly, setFemaleFriendlyOnly] = useState(false);
  const [acFilter, setAcFilter] = useState('all'); // all, ac, non-ac

  // Modals state
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookingRide, setBookingRide] = useState(null);
  const [bookedCount, setBookedCount] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Close autocomplete on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target)) {
        setShowPickupList(false);
      }
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDropList(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch initial states
  useEffect(() => {
    const initData = async () => {
      try {
        const [savedRes, recentRes, searchRes] = await Promise.all([
          rideService.getSavedRides(),
          rideService.getRecentSearches(),
          rideService.searchRides({ passengers: 1 })
        ]);
        
        if (savedRes.success) {
          setSavedRideIds(savedRes.savedRides.map(r => r._id));
        }
        if (recentRes.success) {
          setRecentSearches(recentRes.recentSearches);
        }
        if (searchRes.success) {
          setRides(searchRes.rides);
        }
      } catch (err) {
        console.error('Failed to initialize search lists:', err);
      }
    };
    initData();
  }, []);

  // Autocomplete change handlers
  const handlePickupChange = (val) => {
    setPickup(val);
    if (!val.trim()) {
      setPickupSuggestions([]);
    } else {
      const filtered = HYDERABAD_HUBS.filter(h => 
        h.toLowerCase().includes(val.toLowerCase()) && h.toLowerCase() !== val.toLowerCase()
      );
      setPickupSuggestions(filtered);
    }
  };

  const handleDropChange = (val) => {
    setDrop(val);
    if (!val.trim()) {
      setDropSuggestions([]);
    } else {
      const filtered = HYDERABAD_HUBS.filter(h => 
        h.toLowerCase().includes(val.toLowerCase()) && h.toLowerCase() !== val.toLowerCase()
      );
      setDropSuggestions(filtered);
    }
  };

  // Swap pickup & drop locations
  const handleSwap = () => {
    const temp = pickup;
    setPickup(drop);
    setDrop(temp);
  };

  // Execute Search
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await rideService.searchRides({
        pickup,
        drop,
        date,
        time,
        passengers
      });
      if (res.success) {
        setRides(res.rides);
        
        // Reload recent searches
        const recentRes = await rideService.getRecentSearches();
        if (recentRes.success) {
          setRecentSearches(recentRes.recentSearches);
        }
      }
    } catch (err) {
      showFeedback(err.message || 'Search request failed', true);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Save Ride
  const handleToggleSave = async (rideId) => {
    try {
      const res = await rideService.saveRide(rideId);
      if (res.success) {
        if (res.isSaved) {
          setSavedRideIds(prev => [...prev, rideId]);
          showFeedback('Ride saved to bookmarks');
        } else {
          setSavedRideIds(prev => prev.filter(id => id !== rideId));
          showFeedback('Ride removed from saved list');
        }
      }
    } catch (err) {
      showFeedback('Failed to bookmark ride', true);
    }
  };

  // Clicked Book Ride
  const handleOpenBooking = (ride) => {
    setBookingRide(ride);
    setBookedCount(Math.min(passengers, ride.remainingSeats || ride.availableSeats || 1));
    setTermsAccepted(false);
    setBookingSuccess(false);
  };

  // Confirm and create booking
  const handleConfirmBooking = async () => {
    if (!termsAccepted) {
      showFeedback('Please accept the booking terms & conditions', true);
      return;
    }
    setIsBookingInProgress(true);
    try {
      const rate = bookingRide.farePerSeat || bookingRide.pricePerSeat;
      const total = rate * bookedCount;
      const res = await rideService.bookRide({
        rideId: bookingRide._id || bookingRide.id,
        seatsBooked: bookedCount,
        totalFare: total
      });

      if (res.success) {
        setBookingDetails(res.booking);
        setBookingSuccess(true);
        // Decrease remaining seats in local state
        setRides(prev => prev.map(r => {
          if (r._id === bookingRide._id) {
            return {
              ...r,
              remainingSeats: (r.remainingSeats || r.availableSeats) - bookedCount,
              availableSeats: r.availableSeats - bookedCount
            };
          }
          return r;
        }));
        showFeedback('Booking confirmed successfully!');
        if (onBookingSuccess) {
          onBookingSuccess();
        }
      }
    } catch (err) {
      showFeedback(err.message || 'Failed to complete booking', true);
    } finally {
      setIsBookingInProgress(false);
    }
  };

  // Helper feedback display
  const showFeedback = (text, isError = false) => {
    setFeedbackMessage({ text, isError });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Share ride simulator
  const handleShareRide = (ride) => {
    const url = `${window.location.origin}/rides/${ride._id || ride.id}`;
    navigator.clipboard.writeText(url);
    showFeedback('Ride link copied to clipboard!');
  };

  // Toggle Filters lists
  const toggleFilter = (val, state, setState) => {
    if (state.includes(val)) {
      setState(state.filter(item => item !== val));
    } else {
      setState([...state, val]);
    }
  };

  // Filter rides in real-time in memory
  const getFilteredRides = () => {
    return rides.filter(ride => {
      const fare = ride.farePerSeat || ride.pricePerSeat;
      // 1. Max price filter
      if (fare > maxPrice) return false;

      // 2. Vehicle Type filter
      if (selectedVehicles.length > 0 && !selectedVehicles.includes(ride.vehicleType)) {
        return false;
      }

      // 3. Rating filter
      if (minRating > 0 && ride.driverRating < minRating) return false;

      // 4. Verified Driver filter
      if (verifiedOnly && !ride.isVerifiedDriver) return false;

      // 5. Instant booking filter
      if (instantOnly && !ride.instantBooking) return false;

      // 6. Female friendly filter
      if (femaleFriendlyOnly && !ride.femaleFriendly) return false;

      // 7. AC Filter
      if (acFilter === 'ac' && !ride.acService) return false;
      if (acFilter === 'non-ac' && ride.acService) return false;

      // 8. Departure Time filter
      if (selectedTimes.length > 0) {
        const timeToMinutes = (timeStr) => {
          if (!timeStr) return 0;
          const clean = timeStr.trim().toUpperCase();
          const match = clean.match(/^(\d+):(\d+)\s*(AM|PM)?$/);
          if (!match) return 0;
          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const meridian = match[3];
          
          if (meridian === 'PM' && hours < 12) hours += 12;
          if (meridian === 'AM' && hours === 12) hours = 0;
          return hours * 60 + minutes;
        };
        const minutes = timeToMinutes(ride.departureTime);
        const inSelected = selectedTimes.some(range => {
          if (range === 'morning') return minutes >= 360 && minutes < 720;
          if (range === 'afternoon') return minutes >= 720 && minutes < 1080;
          if (range === 'evening') return minutes >= 1080 && minutes < 1440;
          if (range === 'night') return minutes >= 0 && minutes < 360;
          return false;
        });
        if (!inSelected) return false;
      }

      return true;
    });
  };

  const finalFilteredRides = getFilteredRides();

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* Toast Alert Feedback */}
      {feedbackMessage && (
        <div className={`fixed bottom-6 right-6 p-4 border rounded-2xl text-xs font-black shadow-2xl z-55 animate-fadeIn ${
          feedbackMessage.isError 
            ? 'bg-red-500/10 border-red-500/25 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
        }`}>
          {feedbackMessage.text}
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Discover Shared Carpools</h1>
          <p className="text-xs text-slate-400 font-sans">Find long-distance rides and daily commutes designed similar to BlaBlaCar.</p>
        </div>
        <button
          onClick={() => {
            setIsAlertActive(!isAlertActive);
            showFeedback(isAlertActive ? 'Ride Alerts deactivated' : 'Ride Alerts activated! You will be notified on matching routes.');
          }}
          className={`px-4 py-2 text-xs font-semibold border rounded-xl cursor-pointer transition-all flex items-center gap-2 ${
            isAlertActive 
              ? 'bg-teal-500/15 border-teal-500/30 text-teal-400' 
              : 'border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <FaBell className="text-[10px]" /> {isAlertActive ? 'Alerts On' : 'Create Ride Alert'}
        </button>
      </div>

      {/* SEARCH PANEL (BlaBlaCar-style top search section) */}
      <form onSubmit={handleSearch} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Pickup location autocomplete */}
          <div ref={pickupRef} className="md:col-span-3 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <FaMapMarkerAlt className="text-xs" />
            </span>
            <input
              type="text"
              value={pickup}
              onChange={(e) => handlePickupChange(e.target.value)}
              onFocus={() => setShowPickupList(true)}
              placeholder="Leaving from..."
              className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
            {showPickupList && pickupSuggestions.length > 0 && (
              <div className="absolute z-40 left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {pickupSuggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setPickup(s);
                      setPickupSuggestions([]);
                      setShowPickupList(false);
                    }}
                    className="px-4 py-2 hover:bg-slate-900 text-xs text-white cursor-pointer transition-colors"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Swap Locations Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all"
              title="Swap Locations"
            >
              <FaExchangeAlt className="text-xs rotate-90 md:rotate-0" />
            </button>
          </div>

          {/* Destination location autocomplete */}
          <div ref={dropRef} className="md:col-span-3 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <FaMapMarkerAlt className="text-xs text-teal-400" />
            </span>
            <input
              type="text"
              value={drop}
              onChange={(e) => handleDropChange(e.target.value)}
              onFocus={() => setShowDropList(true)}
              placeholder="Going to..."
              className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
            {showDropList && dropSuggestions.length > 0 && (
              <div className="absolute z-40 left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {dropSuggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setDrop(s);
                      setDropSuggestions([]);
                      setShowDropList(false);
                    }}
                    className="px-4 py-2 hover:bg-slate-900 text-xs text-white cursor-pointer transition-colors"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Travel Date */}
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <FaCalendarAlt className="text-xs" />
            </span>
            <input
              type="date"
              value={date}
              min={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-xs text-white outline-none transition-all"
            />
          </div>

          {/* Passengers selector */}
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <FaUsers className="text-xs" />
            </span>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-xs text-white outline-none appearance-none cursor-pointer transition-all"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n} className="bg-slate-950">{n} Passenger{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-2xl text-xs active:scale-97 cursor-pointer transition-all flex items-center justify-center gap-1 font-display"
            >
              Search
            </button>
          </div>
        </div>

        {/* Recent searches row */}
        {recentSearches.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-850 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Searches:</span>
            {recentSearches.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPickup(s.pickup);
                  setDrop(s.dropoff);
                  setDate(s.date || '');
                  setPassengers(s.passengers || 1);
                }}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 text-[10px] font-bold text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                {s.pickup} → {s.dropoff}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* MAIN CONTAINER: SIDEBAR + RESULTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* FILTERS SIDEBAR (Left panel) */}
        <div className="lg:col-span-3 bg-[#0d1020] border border-slate-800 rounded-3xl p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">Filters</h3>
            <button
              onClick={() => {
                setMaxPrice(1000);
                setSelectedTimes([]);
                setSelectedVehicles([]);
                setMinRating(0);
                setVerifiedOnly(false);
                setInstantOnly(false);
                setFemaleFriendlyOnly(false);
                setAcFilter('all');
              }}
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Price Range filter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Max Price</span>
              <span className="text-emerald-400 font-extrabold">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-950 cursor-pointer h-1.5 rounded-lg"
            />
          </div>

          {/* Departure Time ranges */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departure Time</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'morning', label: 'Morning (6am-12pm)' },
                { id: 'afternoon', label: 'Afternoon (12pm-6pm)' },
                { id: 'evening', label: 'Evening (6pm-12am)' },
                { id: 'night', label: 'Night (12am-6am)' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleFilter(t.id, selectedTimes, setSelectedTimes)}
                  className={`py-2 px-2 border rounded-xl text-[9px] font-bold transition-all text-center cursor-pointer ${
                    selectedTimes.includes(t.id)
                      ? 'bg-indigo-500/15 border-indigo-500/35 text-indigo-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Types */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Type</label>
            <div className="flex flex-col gap-2">
              {['Hatchback', 'Sedan', 'SUV'].map(v => (
                <label key={v} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedVehicles.includes(v)}
                    onChange={() => toggleFilter(v, selectedVehicles, setSelectedVehicles)}
                    className="accent-emerald-500 h-4 w-4 bg-slate-950 rounded border-slate-800"
                  />
                  <span>{v}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating filter */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Driver Rating</label>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setMinRating(r)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    minRating === r
                      ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 0 ? 'Any' : `${r}★+`}
                </button>
              ))}
            </div>
          </div>

          {/* AC / Non-AC toggle */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Air Conditioning</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'all', label: 'All' },
                { id: 'ac', label: 'AC' },
                { id: 'non-ac', label: 'Non-AC' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAcFilter(opt.id)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                    acFilter === opt.id
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Boolean checkboxes */}
          <div className="space-y-3 pt-3 border-t border-slate-850">
            <label className="flex items-center gap-2.5 text-xs text-slate-450 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={() => setVerifiedOnly(!verifiedOnly)}
                className="accent-emerald-500 h-4 w-4 bg-slate-950 rounded border-slate-800"
              />
              <span className="flex items-center gap-1"><FaCheckCircle className="text-emerald-400 text-[10px]" /> Verified Drivers Only</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-450 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={instantOnly}
                onChange={() => setInstantOnly(!instantOnly)}
                className="accent-emerald-500 h-4 w-4 bg-slate-950 rounded border-slate-800"
              />
              <span className="flex items-center gap-1"><FaBolt className="text-teal-400 text-[10px]" /> Instant Booking Only</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-450 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={femaleFriendlyOnly}
                onChange={() => setFemaleFriendlyOnly(!femaleFriendlyOnly)}
                className="accent-emerald-500 h-4 w-4 bg-slate-950 rounded border-slate-800"
              />
              <span className="flex items-center gap-1"><FaVenus className="text-pink-400 text-[10px]" /> Female-Friendly Only</span>
            </label>
          </div>
        </div>

        {/* SEARCH RESULTS LIST (Right panel) */}
        <div className="lg:col-span-9 space-y-4">
          {isLoading ? (
            // Skeleton loaders
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-slate-850 rounded-xl"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-28 bg-slate-850 rounded"></div>
                        <div className="h-2 w-20 bg-slate-850 rounded"></div>
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-slate-850 rounded-full"></div>
                  </div>
                  <div className="h-16 bg-slate-850 rounded-2xl"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-slate-850 rounded"></div>
                    <div className="h-9 w-24 bg-slate-850 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : finalFilteredRides.length === 0 ? (
            // Empty state illustration
            <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-950 border border-slate-800 text-slate-600 rounded-2xl flex items-center justify-center mx-auto">
                <FaRegFileAlt className="text-2xl" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-white font-display">No matching rides found</h3>
                <p className="text-xs text-slate-500 font-sans">We couldn't find any active carpools matching your search criteria. Try modifying filters or routing selections.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPickup('');
                  setDrop('');
                  setDate('');
                  setPassengers(1);
                  setMaxPrice(1000);
                  setSelectedTimes([]);
                  setSelectedVehicles([]);
                  setMinRating(0);
                  setVerifiedOnly(false);
                  setInstantOnly(false);
                  setFemaleFriendlyOnly(false);
                  setAcFilter('all');
                  handleSearch();
                }}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-350 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            // Ride Cards
            <div className="space-y-4">
              {finalFilteredRides.map(ride => {
                const fare = ride.farePerSeat || ride.pricePerSeat;
                const isSaved = savedRideIds.includes(ride._id || ride.id);
                return (
                  <div 
                    key={ride._id || ride.id} 
                    className="bg-[#0d1020] border border-slate-800 hover:border-slate-750 p-5 rounded-3xl transition-all relative flex flex-col md:flex-row justify-between gap-5"
                  >
                    
                    {/* Main contents */}
                    <div className="flex-1 space-y-4">
                      
                      {/* Driver info row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 flex items-center justify-center font-bold text-sm shrink-0">
                            {ride.driver ? ride.driver.fullName.split(' ').map(n => n[0]).join('') : 'D'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white font-display">
                                {ride.driver ? ride.driver.fullName : 'Verified Driver'}
                              </h4>
                              {ride.isVerifiedDriver && (
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 py-0.5 px-2 rounded-full font-bold flex items-center gap-0.5" title="Verified Account">
                                  <FaCheckCircle className="text-[8px]" /> Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-[10px] text-amber-400 gap-1 font-sans">
                              <span className="flex items-center gap-0.5 font-bold"><FaStar /> {ride.driverRating}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400 text-[9px]">{ride.vehicleType}</span>
                              {ride.acService && (
                                <>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-teal-400 text-[9px] flex items-center gap-0.5"><FaWind className="text-[8px]" /> AC</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top corner action icons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleSave(ride._id || ride.id)}
                            className="p-2 rounded-xl bg-slate-950/40 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-red-400 cursor-pointer active:scale-95 transition-all"
                            title="Save Ride"
                          >
                            {isSaved ? <FaHeart className="text-red-500 text-xs" /> : <FaRegHeart className="text-xs" />}
                          </button>
                          <button
                            onClick={() => handleShareRide(ride)}
                            className="p-2 rounded-xl bg-slate-950/40 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all"
                            title="Share Ride"
                          >
                            <FaShareAlt className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Route detail diagram row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 border border-slate-900 rounded-2xl p-4">
                        <div className="space-y-2 relative border-l border-slate-800 pl-4 ml-2">
                          
                          {/* Bullet icons */}
                          <div className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-emerald-500"></div>
                          <div className="absolute -left-1.5 bottom-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-teal-400"></div>

                          <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Departure</p>
                            <p className="text-xs font-bold text-white mt-1 leading-none">{ride.pickupLocation}</p>
                            <p className="text-[9px] text-slate-400 mt-1">{ride.departureTime} ({ride.departureDate})</p>
                          </div>
                          <div className="pt-2">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Destination</p>
                            <p className="text-xs font-bold text-white mt-1 leading-none">{ride.dropLocation}</p>
                          </div>
                        </div>

                        {/* Distance, Duration and Specs */}
                        <div className="flex flex-col justify-center gap-1.5 border-t md:border-t-0 md:border-l border-slate-900 pt-3 md:pt-0 md:pl-4">
                          <p className="text-xs text-slate-400">Distance: <span className="font-bold text-white">{ride.rideDistance || 15} km</span></p>
                          <p className="text-xs text-slate-400">Duration: <span className="font-bold text-white">{ride.rideDuration || 0.6} hours</span></p>
                          
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {ride.instantBooking && (
                              <span className="text-[8px] bg-teal-500/10 text-teal-400 border border-teal-500/15 px-2 py-0.5 rounded font-black uppercase flex items-center gap-0.5">
                                <FaBolt className="text-[7px]" /> Instant Book
                              </span>
                            )}
                            {ride.femaleFriendly && (
                              <span className="text-[8px] bg-pink-500/10 text-pink-400 border border-pink-500/15 px-2 py-0.5 rounded font-black uppercase flex items-center gap-0.5">
                                <FaVenus className="text-[7px]" /> Female Friendly
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price and Action Button Sidebar */}
                    <div className="flex md:flex-col justify-between md:justify-center md:items-end gap-3 min-w-[140px] border-t md:border-t-0 md:border-l border-slate-900 pt-4 md:pt-0 md:pl-5 shrink-0">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Price per Seat</p>
                        <p className="text-2xl font-black text-emerald-400 font-display mt-2">₹{fare}</p>
                        <p className="text-[10px] text-slate-450 mt-1">
                          {ride.remainingSeats !== undefined ? ride.remainingSeats : ride.availableSeats} seats left
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRide(ride)}
                          className="px-3.5 py-2.5 border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-slate-350 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
                          title="View Details"
                        >
                          <FaEye className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleOpenBooking(ride)}
                          disabled={(ride.remainingSeats !== undefined ? ride.remainingSeats : ride.availableSeats) <= 0}
                          className={`px-5 py-2.5 text-[10px] font-extrabold rounded-xl transition-all active:scale-97 cursor-pointer font-display ${
                            (ride.remainingSeats !== undefined ? ride.remainingSeats : ride.availableSeats) <= 0
                              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-transparent'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
                          }`}
                        >
                          {(ride.remainingSeats !== undefined ? ride.remainingSeats : ride.availableSeats) <= 0 ? 'Full' : 'Book Ride'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIDE DETAILS MODAL */}
      {selectedRide && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0d1020] border border-slate-800 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedRide(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-850 cursor-pointer"
            >
              ✕ Close
            </button>
            <div className="p-5 border-b border-slate-850">
              <h3 className="text-sm font-bold text-white font-display">Commute Ride Details</h3>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto font-sans text-slate-300">
              
              {/* Driver block */}
              <div className="flex items-center gap-4 border-b border-slate-850 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 flex items-center justify-center font-bold text-lg shrink-0">
                  {selectedRide.driver ? selectedRide.driver.fullName.split(' ').map(n => n[0]).join('') : 'D'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">
                    {selectedRide.driver ? selectedRide.driver.fullName : 'Verified Driver'}
                  </h4>
                  <div className="flex items-center text-[10px] text-amber-400 gap-1 mt-1.5">
                    <span className="flex items-center gap-0.5"><FaStar /> {selectedRide.driverRating} rating</span>
                    <span>•</span>
                    <span className="text-slate-400">12 trips completed</span>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 border border-slate-900 rounded-2xl text-xs">
                <div>
                  <p className="text-slate-500">Vehicle Info</p>
                  <p className="font-bold text-white mt-0.5">{selectedRide.driver?.vehicleName || selectedRide.vehicleType}</p>
                  <p className="text-[10px] text-slate-400">{selectedRide.driver?.vehicleNumber || selectedRide.vehicleNumber || 'Plate Hidden'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Specifications</p>
                  <p className="font-bold text-white mt-0.5">AC Commute: {selectedRide.acService ? 'Yes' : 'No'}</p>
                  <p className="text-[10px] text-slate-400">Seats: {selectedRide.remainingSeats !== undefined ? selectedRide.remainingSeats : selectedRide.availableSeats} available</p>
                </div>
              </div>

              {/* Route details */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Itinerary Details</p>
                <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-2xl space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Pickup Point:</span>
                    <span className="font-bold text-white">{selectedRide.pickupLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Drop Point:</span>
                    <span className="font-bold text-white">{selectedRide.dropLocation}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                    <div>
                      <span className="text-slate-500 block">Distance:</span>
                      <span className="font-bold text-white">{selectedRide.rideDistance || 15} km</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Estimated Time:</span>
                      <span className="font-bold text-white">{selectedRide.rideDuration || 0.6} hours</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ride rules */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Co-Commuter Rules & Notes</p>
                <div className="p-4 bg-slate-950/30 border border-slate-900 rounded-2xl text-xs space-y-1.5">
                  <p className="text-slate-350">"{selectedRide.notes || 'Please be on time at the designated pickup locations. Commute responsibly!'}"</p>
                  <ul className="list-disc pl-4 text-slate-500 space-y-1 mt-2">
                    <li>No smoking inside the vehicle.</li>
                    <li>Verify details matching drivers before boarding.</li>
                    <li>Luggage constraints apply. Contact driver for exceptions.</li>
                  </ul>
                </div>
              </div>

              {/* Contacts info placeholder */}
              <div className="p-3.5 bg-indigo-950/10 border border-indigo-500/10 text-indigo-400 text-[10px] rounded-xl flex items-center gap-2">
                <FaShieldAlt className="shrink-0 text-xs" />
                <span>Contact details (phone and chat coords) are unlocked and displayed instantly inside the bookings portal after a successful seat reservation is logged.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOK RIDE / RESERVATION FLOW MODAL */}
      {bookingRide && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0d1020] border border-slate-800 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl relative">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-850">
              <h3 className="text-sm font-bold text-white font-display">
                {bookingSuccess ? 'Booking Successful!' : 'Book Ride Reservation'}
              </h3>
            </div>

            {/* Success screen */}
            {bookingSuccess ? (
              <div className="p-6 text-center space-y-6 text-slate-300">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
                  <FaCheckCircle className="text-3xl" />
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white">Your Seat is Reserved!</h4>
                  <p className="text-xs text-slate-400">Booking reference: <span className="font-mono text-white select-all">{bookingDetails?._id || 'TXN-REFERENCE'}</span></p>
                  <p className="text-xs text-slate-400">You booked <span className="text-emerald-400 font-extrabold">{bookedCount} seat(s)</span> for a total of <span className="text-emerald-400 font-extrabold">₹{(bookingRide.farePerSeat || bookingRide.pricePerSeat) * bookedCount}</span>.</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 text-xs text-left space-y-2">
                  <p className="text-slate-400">Driver Contact: <span className="font-bold text-white">{bookingRide.driver?.phone || '9876543210'}</span></p>
                  <p className="text-slate-400">Pickup Place: <span className="font-bold text-white">{bookingRide.pickupLocation}</span></p>
                  <p className="text-slate-400">Departure: <span className="font-bold text-emerald-400">{bookingRide.departureTime}</span></p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setBookingRide(null);
                      setBookingSuccess(false);
                    }}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              // Booking layout
              <div className="p-6 space-y-6 text-slate-300 font-sans">
                
                {/* Route Summary */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl text-xs space-y-2">
                  <p className="text-slate-400 leading-none">Route: <span className="font-bold text-white">{bookingRide.pickupLocation} → {bookingRide.dropLocation}</span></p>
                  <p className="text-slate-400 leading-none">Departure: <span className="font-bold text-white">{bookingRide.departureTime} ({bookingRide.departureDate})</span></p>
                  <p className="text-slate-400 leading-none">Fare: <span className="font-bold text-emerald-400">₹{bookingRide.farePerSeat || bookingRide.pricePerSeat} / seat</span></p>
                </div>

                {/* Seat selector count */}
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Seat Count</label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5, 6].map(n => {
                      const avail = bookingRide.remainingSeats !== undefined ? bookingRide.remainingSeats : bookingRide.availableSeats;
                      const disabled = n > avail;
                      return (
                        <button
                          key={n}
                          type="button"
                          disabled={disabled}
                          onClick={() => setBookedCount(n)}
                          className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            disabled 
                              ? 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed'
                              : bookedCount === n
                              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fare Summary Calculation */}
                <div className="space-y-3 pt-3 border-t border-slate-850">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fare Summary Details</p>
                  <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fare (₹{(bookingRide.farePerSeat || bookingRide.pricePerSeat)} x {bookedCount})</span>
                      <span className="font-bold text-white">₹{(bookingRide.farePerSeat || bookingRide.pricePerSeat) * bookedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Service Commission</span>
                      <span className="font-bold text-emerald-400">₹0 (Free Commute)</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-2 font-bold">
                      <span className="text-white">Total Amount Due</span>
                      <span className="text-emerald-400">₹{(bookingRide.farePerSeat || bookingRide.pricePerSeat) * bookedCount}</span>
                    </div>
                  </div>
                </div>

                {/* Terms and conditions */}
                <label className="flex items-start gap-2.5 text-[10px] text-slate-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(!termsAccepted)}
                    className="accent-emerald-500 h-4 w-4 bg-slate-950 rounded border-slate-800 shrink-0 mt-0.5"
                  />
                  <span>I agree to the TaxiPool sharing guidelines, co-commuter code of conduct, and terms of ride booking cancellation policies.</span>
                </label>

                {/* Action buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-850">
                  <button
                    onClick={() => setBookingRide(null)}
                    className="flex-1 py-3 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isBookingInProgress}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black rounded-xl active:scale-97 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    {isBookingInProgress && <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>}
                    Confirm Reservation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FindRides;
