import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCarSide, FaUserCircle, FaSearch, FaHistory, FaMapMarkedAlt, FaCog,
  FaSignOutAlt, FaLeaf, FaWallet, FaCar, FaChevronRight, FaTimes,
  FaUsers, FaBell, FaBars, FaTimesCircle, FaStar, FaSave, FaShieldAlt,
  FaEnvelope, FaPhone, FaBuilding, FaIdCard, FaChair, FaPlus, FaTrash, FaCheckCircle,
  FaPlusCircle, FaRoad, FaHandHoldingUsd
} from 'react-icons/fa';
import { userService } from '../../services/userService';
import { validatePhone } from '../../utils/auth';

function DriverProfile() {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Information State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    vehicleName: "",
    vehicleNumber: "",
    licenseNumber: "",
    availableSeats: "0",
    sosContact: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getCurrentUser();
        if (data.success) {
          setProfile({
            name: data.user.fullName || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            company: data.user.company || '',
            vehicleName: data.user.vehicleName || '',
            vehicleNumber: data.user.vehicleNumber || '',
            licenseNumber: data.user.licenseNumber || '',
            availableSeats: String(data.user.availableSeats || 0),
            sosContact: data.user.sosContact || ''
          });
        }
      } catch (err) {
        console.error('Error fetching driver profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Preferred Routes State
  const [preferredRoutes, setPreferredRoutes] = useState([
    { id: 1, pickup: "Ameerpet", dropoff: "Hitech City" },
    { id: 2, pickup: "Madhapur", dropoff: "Ameerpet" }
  ]);

  // Passenger Reviews list
  const reviews = [
    {
      id: 1,
      passenger: "Vivek K.",
      rating: 5,
      comment: "Very punctual and friendly. Smooth driving on Hitech highway commutes! Saved me ₹150.",
      date: "May 22, 2026"
    },
    {
      id: 2,
      passenger: "Priya M.",
      rating: 5,
      comment: "Verified co-commutes with corporate colleagues makes me feel extremely secure. Safe ride!",
      date: "May 20, 2026"
    },
    {
      id: 3,
      passenger: "Ankit V.",
      rating: 4.8,
      comment: "Excellent pool matches. Highly recommended for daily corporate travel.",
      date: "May 18, 2026"
    }
  ];

  // Form input field state for adding new route preference
  const [newRoutePickup, setNewRoutePickup] = useState('');
  const [newRouteDropoff, setNewRouteDropoff] = useState('');
  const [showAddRouteForm, setShowAddRouteForm] = useState(false);

  const [statusMessage, setStatusMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Handle Updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const tempErrors = {};
    if (!profile.name || !profile.name.trim()) {
      tempErrors.name = 'Full name is required';
    }
    if (!profile.phone || !validatePhone(profile.phone)) {
      tempErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (profile.sosContact && !validatePhone(profile.sosContact)) {
      tempErrors.sosContact = 'Please enter a valid SOS contact number';
    }
    const seats = parseInt(profile.availableSeats, 10);
    if (isNaN(seats) || seats < 1 || seats > 8) {
      tempErrors.seats = 'Seats must be between 1 and 8';
    }

    setFormErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) {
      return;
    }

    try {
      const data = await userService.updateProfile({
        fullName: profile.name,
        phone: profile.phone,
        company: profile.company,
        vehicleName: profile.vehicleName,
        vehicleNumber: profile.vehicleNumber,
        licenseNumber: profile.licenseNumber,
        availableSeats: Number(profile.availableSeats) || 0,
        sosContact: profile.sosContact
      });
      if (data.success) {
        setStatusMessage('Profile and vehicle details updated successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleDeleteRoute = (routeId) => {
    setPreferredRoutes(prev => prev.filter(r => r.id !== routeId));
    setStatusMessage('Preferred route removed.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleAddRoute = (e) => {
    e.preventDefault();
    if (!newRoutePickup.trim() || !newRouteDropoff.trim()) {
      alert('Please fill out both source and destination.');
      return;
    }
    const newRoute = {
      id: Date.now(),
      pickup: newRoutePickup,
      dropoff: newRouteDropoff
    };
    setPreferredRoutes(prev => [...prev, newRoute]);
    setNewRoutePickup('');
    setNewRouteDropoff('');
    setShowAddRouteForm(false);
    setStatusMessage('Preferred commuting route added.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSidebarNavigation = (tabName) => {
    navigate('/driver', { state: { activeTab: tabName } });
  };

  return (
    <div className="min-h-screen bg-[#0a0d17] text-slate-200 flex flex-col md:flex-row">

      {/* 1. Sidebar Navigation (Desktop Only) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d1020] border-r border-slate-800 shrink-0">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-850">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
            <FaCarSide className="text-base" />
          </div>
          <span className="text-base font-bold tracking-tight text-white font-display">
            FS098 <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">TaxiPool</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => handleSidebarNavigation('dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
          >
            <FaCar className="text-sm" /> Dashboard
          </button>
          <button
            onClick={() => handleSidebarNavigation('createRide')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
          >
            <FaPlusCircle className="text-sm" /> Create Ride
          </button>
          <button
            onClick={() => handleSidebarNavigation('activeRides')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
          >
            <FaRoad className="text-sm" /> Active Rides
          </button>
          <button
            onClick={() => handleSidebarNavigation('requests')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
          >
            <FaUsers className="text-sm" /> Ride Requests
          </button>
          <button
            onClick={() => handleSidebarNavigation('earnings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
          >
            <FaHandHoldingUsd className="text-sm" /> Earnings
          </button>
          <button
            onClick={() => handleSidebarNavigation('history')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
          >
            <FaHistory className="text-sm" /> Ride History
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-400"
          >
            <FaCog className="text-sm" /> Profile
          </button>
        </nav>

        <div className="p-4 border-t border-slate-850">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <FaSignOutAlt /> Log Out
          </Link>
        </div>
      </aside>

      {/* 2. Mobile Responsive Layout Header */}
      <header className="md:hidden h-16 bg-[#0d1020] border-b border-slate-800 flex items-center justify-between px-4 z-40 relative">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
            <FaCarSide className="text-sm" />
          </div>
          <span className="text-sm font-bold text-white font-display">
            FS098 <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">TaxiPool</span>
          </span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
        >
          <FaBars className="text-sm" />
        </button>
      </header>

      {/* Mobile Drawer Menu Popup */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 md:hidden flex justify-end animate-fadeIn">
          <div className="w-64 bg-[#0d1020] h-full p-6 flex flex-col border-l border-slate-800 shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <FaTimes className="text-xs" />
            </button>

            <div className="flex items-center gap-2.5 mb-8 mt-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950">
                <FaCarSide className="text-base" />
              </div>
              <span className="text-base font-bold text-white font-display">FS098 TaxiPool</span>
            </div>

            <nav className="flex-1 space-y-1.5">
              {[
                { name: 'dashboard', label: 'Dashboard', icon: <FaCar className="text-xs" /> },
                { name: 'createRide', label: 'Create Ride', icon: <FaPlusCircle className="text-xs" /> },
                { name: 'activeRides', label: 'Active Rides', icon: <FaRoad className="text-xs" /> },
                { name: 'requests', label: 'Ride Requests', icon: <FaUsers className="text-xs" /> },
                { name: 'earnings', label: 'Earnings', icon: <FaHandHoldingUsd className="text-xs" /> },
                { name: 'history', label: 'Ride History', icon: <FaHistory className="text-xs" /> },
                { name: 'settings', label: 'Profile', icon: <FaCog className="text-xs" />, active: true }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.name === 'settings') {
                      setIsMobileSidebarOpen(false);
                    } else {
                      handleSidebarNavigation(item.name);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${item.active
                      ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-400'
                      : 'border border-transparent text-slate-400 hover:text-white'
                    }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-850">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <FaSignOutAlt /> Log Out
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">

        {/* Top Header bar */}
        <header className="h-20 bg-[#0a0d17] border-b border-slate-850 px-6 sm:px-8 flex items-center justify-between z-10 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white font-display">Driver Profile Settings</h2>
            <p className="text-[11px] text-slate-500">Configure vehicle documentation and verified details</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 border border-slate-800/80 text-slate-400 text-[10px] font-bold rounded-lg select-none">
              <FaShieldAlt className="text-slate-500 text-xs" /> Emergency
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-extrabold text-sm shrink-0">
                  RS
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight">{profile.name}</p>
                  <p className="text-[9px] text-slate-500 font-sans leading-none">{profile.company}</p>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-2xl p-2 shadow-2xl z-20 space-y-1 animate-fadeIn">
                  <button
                    onClick={() => {
                      handleSidebarNavigation('dashboard');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                  >
                    <FaCar /> Dashboard Console
                  </button>
                  <Link
                    to="/"
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <FaSignOutAlt /> Log Out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Profile Content Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-8">

          {statusMessage && (
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-2xl animate-fadeIn">
              {statusMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column (8 units): Personal/Vehicle Details, SOS, Reviews */}
            <div className="lg:col-span-8 space-y-8">

              {/* Form 1: Personal & Vehicle Details */}
              <div className="bg-gradient-to-b from-slate-900 to-[#0e1425] border border-slate-800 rounded-3xl p-6 md:p-8 relative shadow-2xl">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-3xl"></div>

                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6">Driver & Vehicle Credentials</h3>

                <form onSubmit={handleSaveProfile} className="space-y-6">

                  {/* Personal details */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Personal Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FaUserCircle /> Full Name
                        </label>
                        <input
                           type="text"
                           value={profile.name}
                           onChange={(e) => {
                             setProfile({ ...profile, name: e.target.value });
                             if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                           }}
                           className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none transition-colors ${
                             formErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                           }`}
                         />
                         {formErrors.name && <p className="text-red-400 text-[10px] mt-1">{formErrors.name}</p>}
                       </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FaEnvelope /> Corporate Email
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FaPhone /> Phone Number
                        </label>
                         <input
                           type="tel"
                           value={profile.phone}
                           onChange={(e) => {
                             setProfile({ ...profile, phone: e.target.value });
                             if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                           }}
                           className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none transition-colors ${
                             formErrors.phone ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                           }`}
                         />
                         {formErrors.phone && <p className="text-red-400 text-[10px] mt-1">{formErrors.phone}</p>}
                       </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FaBuilding /> Company / Office
                        </label>
                        <input
                          type="text"
                          value={profile.company}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle details */}
                  <div className="space-y-4 pt-4 border-t border-slate-850">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Vehicle Credentials</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FaCar /> Vehicle Model name
                        </label>
                        <input
                          type="text"
                          value={profile.vehicleName}
                          onChange={(e) => setProfile({ ...profile, vehicleName: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FaIdCard /> Vehicle License Plate
                        </label>
                        <input
                          type="text"
                          value={profile.vehicleNumber}
                          onChange={(e) => setProfile({ ...profile, vehicleNumber: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FaIdCard /> Driver License Number
                        </label>
                        <input
                          type="text"
                          value={profile.licenseNumber}
                          onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FaChair /> Passenger Capacity (Max seats)
                        </label>
                         <input
                           type="number"
                           value={profile.availableSeats}
                           onChange={(e) => {
                             setProfile({ ...profile, availableSeats: e.target.value });
                             if (formErrors.seats) setFormErrors({ ...formErrors, seats: '' });
                           }}
                           className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none transition-colors ${
                             formErrors.seats ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500/50'
                           }`}
                         />
                         {formErrors.seats && <p className="text-red-400 text-[10px] mt-1">{formErrors.seats}</p>}
                       </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display"
                    >
                      <FaSave /> Save Profile details
                    </button>
                  </div>
                </form>
              </div>

              {/* Form 2: Passenger Reviews Card */}
              <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest font-display">Passenger Commuter Reviews</h3>

                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white flex items-center gap-1">
                          {rev.passenger} <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded">Verified Rider</span>
                        </span>
                        <span className="text-[9px] text-slate-500">{rev.date}</span>
                      </div>

                      <div className="flex text-amber-400 text-[10px] gap-0.5">
                        <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
                        <span className="text-[10px] text-slate-400 ml-1">({rev.rating})</span>
                      </div>

                      <p className="text-xs text-slate-350 italic font-sans">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (4 units): Profile Summary & Preferred Routes */}
            <div className="lg:col-span-4 space-y-8">

              {/* Summary Card */}
              <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

                <div className="relative w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-slate-800 flex items-center justify-center font-black text-3xl shadow-inner mt-4">
                  RS
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-slate-950 border-2 border-slate-900 rounded-full flex items-center justify-center text-[9px] font-bold" title="Verified Driver License">
                    ✓
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white font-display">{profile.name}</h4>
                  <p className="text-[10px] text-slate-400">{profile.email}</p>
                  <p className="text-[9px] text-slate-500 mt-1 font-sans">{profile.phone}</p>
                </div>

                <div className="pt-3 border-t border-slate-850 flex items-center justify-center gap-4 text-[10px] text-slate-400">
                  <div className="text-center">
                    <p className="font-extrabold text-white">52</p>
                    <p className="text-[9px] text-slate-500">Commutes</p>
                  </div>
                  <div className="w-px h-6 bg-slate-850"></div>
                  <div className="text-center">
                    <p className="font-extrabold text-emerald-400">4.9</p>
                    <p className="text-[9px] text-slate-500">Rating</p>
                  </div>
                  <div className="w-px h-6 bg-slate-850"></div>
                  <div className="text-center">
                    <p className="font-extrabold text-teal-400">₹6.4k</p>
                    <p className="text-[9px] text-slate-500">Earned</p>
                  </div>
                </div>
              </div>

              {/* Preferred Routes Shortcuts */}
              <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest font-display">Preferred Routes</h3>
                  {!showAddRouteForm && (
                    <button
                      onClick={() => setShowAddRouteForm(true)}
                      className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 cursor-pointer"
                      title="Add Preferred Route"
                    >
                      <FaPlus className="text-[9px]" />
                    </button>
                  )}
                </div>

                {showAddRouteForm && (
                  <form onSubmit={handleAddRoute} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase">New Preferred Route</span>
                      <button
                        type="button"
                        onClick={() => setShowAddRouteForm(false)}
                        className="text-slate-500 hover:text-white"
                      >
                        <FaTimes className="text-[9px]" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newRoutePickup}
                        onChange={(e) => setNewRoutePickup(e.target.value)}
                        placeholder="Source Pickup"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newRouteDropoff}
                        onChange={(e) => setNewRouteDropoff(e.target.value)}
                        placeholder="Destination Dropoff"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-500 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-wider font-display active:scale-98 transition-all cursor-pointer"
                    >
                      Add to preference
                    </button>
                  </form>
                )}

                <div className="space-y-3">
                  {preferredRoutes.map(route => (
                    <div key={route.id} className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex items-center justify-between group">
                      <div className="space-y-1.5 flex-1 pr-3 text-[10px] text-slate-400">
                        <p>From: <span className="text-white font-bold">{route.pickup}</span></p>
                        <p>To: <span className="text-white font-bold">{route.dropoff}</span></p>
                      </div>

                      <button
                        onClick={() => handleDeleteRoute(route.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 cursor-pointer shrink-0"
                        title="Delete Shortcut"
                      >
                        <FaTrash className="text-[9px]" />
                      </button>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}

export default DriverProfile;
