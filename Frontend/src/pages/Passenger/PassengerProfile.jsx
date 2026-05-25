import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCarSide, FaUserCircle, FaSearch, FaHistory, FaMapMarkedAlt, FaCog,
  FaSignOutAlt, FaLeaf, FaWallet, FaCar, FaChevronRight, FaTimes,
  FaUsers, FaBell, FaBars, FaTimesCircle, FaStar, FaSave, FaShieldAlt,
  FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt, FaPlus, FaTrash, FaCheckCircle
} from 'react-icons/fa';
import { userService } from '../../services/userService';
import { validatePhone } from '../../utils/auth';

function PassengerProfile() {
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
            sosContact: data.user.sosContact || ''
          });
        }
      } catch (err) {
        console.error('Error fetching passenger profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Ride Preferences State
  const [preferences, setPreferences] = useState({
    rideType: "ac", // 'ac', 'non-ac', 'no-preference'
    ambience: "quiet", // 'quiet', 'chatty', 'music'
    detourLimit: "10", // '5', '10', '15', '20'
    genderMatch: "any" // 'any', 'same-gender'
  });

  // Saved Routes State
  const [savedRoutes, setSavedRoutes] = useState([
    { id: 1, name: "Office Commute", pickup: "Ameerpet", dropoff: "Hitech City", matches: 4 },
    { id: 2, name: "Weekend Route", pickup: "Secunderabad", dropoff: "Gachibowli", matches: 2 },
    { id: 3, name: "College Path", pickup: "Kukatpally", dropoff: "Madhapur", matches: 3 }
  ]);

  // Form input field state for adding new route
  const [newRouteName, setNewRouteName] = useState('');
  const [newRoutePickup, setNewRoutePickup] = useState('');
  const [newRouteDropoff, setNewRouteDropoff] = useState('');
  const [showAddRouteForm, setShowAddRouteForm] = useState(false);

  const [statusMessage, setStatusMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Handle updates
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
      tempErrors.sosContact = 'Please enter a valid emergency contact number';
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
        sosContact: profile.sosContact
      });
      if (data.success) {
        setStatusMessage('Profile details updated successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setStatusMessage('Ride preferences saved successfully!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleDeleteRoute = (routeId) => {
    setSavedRoutes(prev => prev.filter(r => r.id !== routeId));
    setStatusMessage('Saved route deleted.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleAddRoute = (e) => {
    e.preventDefault();
    if (!newRouteName.trim() || !newRoutePickup.trim() || !newRouteDropoff.trim()) {
      alert('Please fill out all fields to add a route.');
      return;
    }
    const newRoute = {
      id: Date.now(),
      name: newRouteName,
      pickup: newRoutePickup,
      dropoff: newRouteDropoff,
      matches: Math.floor(Math.random() * 4) + 1
    };
    setSavedRoutes(prev => [...prev, newRoute]);
    setNewRouteName('');
    setNewRoutePickup('');
    setNewRouteDropoff('');
    setShowAddRouteForm(false);
    setStatusMessage('New saved route added successfully!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSidebarNavigation = (tabName) => {
    navigate('/passenger', { state: { activeTab: tabName } });
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
            onClick={() => handleSidebarNavigation('findRides')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
          >
            <FaSearch className="text-sm" /> Find Rides
          </button>
          <button
            onClick={() => handleSidebarNavigation('bookings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
          >
            <FaUsers className="text-sm" /> My Bookings
          </button>
          <button
            onClick={() => handleSidebarNavigation('history')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
          >
            <FaHistory className="text-sm" /> Ride History
          </button>
          <button
            onClick={() => handleSidebarNavigation('routes')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50"
          >
            <FaMapMarkedAlt className="text-sm" /> Saved Routes
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-400"
          >
            <FaCog className="text-sm" /> Profile Settings
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
                { name: 'findRides', label: 'Find Rides', icon: <FaSearch className="text-xs" /> },
                { name: 'bookings', label: 'My Bookings', icon: <FaUsers className="text-xs" /> },
                { name: 'history', label: 'Ride History', icon: <FaHistory className="text-xs" /> },
                { name: 'routes', label: 'Saved Routes', icon: <FaMapMarkedAlt className="text-xs" /> },
                { name: 'settings', label: 'Settings', icon: <FaCog className="text-xs" />, active: true }
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
            <h2 className="text-base font-bold text-white font-display">Passenger Profile Settings</h2>
            <p className="text-[11px] text-slate-500">Configure ride parameters and corporate identity details</p>
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
                  JD
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

          {/* Status Message popup */}
          {statusMessage && (
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-2xl animate-fadeIn">
              {statusMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column (8 units): Personal details, Emergency contacts, Preferences */}
            <div className="lg:col-span-8 space-y-8">

              {/* Form 1: Personal Details */}
              <div className="bg-gradient-to-b from-slate-900 to-[#0e1425] border border-slate-800 rounded-3xl p-6 md:p-8 relative shadow-2xl">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-3xl"></div>

                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6">Personal Details & Corporate loop</h3>

                <form onSubmit={handleSaveProfile} className="space-y-5">
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
                        <FaEnvelope /> Verified Email
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

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display"
                    >
                      <FaSave /> Save Profile Details
                    </button>
                  </div>
                </form>
              </div>

              {/* Form 2: Ride Preferences */}
              <div className="bg-gradient-to-b from-slate-900 to-[#0e1425] border border-slate-800 rounded-3xl p-6 md:p-8 relative shadow-2xl">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-3xl"></div>

                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-6">Commuter Ride Preferences</h3>

                <form onSubmit={handleSavePreferences} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Preference 1: Vehicle Air Conditioning */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cab Air Conditioning</label>
                      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, rideType: 'ac' })}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${preferences.rideType === 'ac' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          AC Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, rideType: 'non-ac' })}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${preferences.rideType === 'non-ac' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          Non-AC
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, rideType: 'no-preference' })}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${preferences.rideType === 'no-preference' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          Any
                        </button>
                      </div>
                    </div>

                    {/* Preference 2: Chatter Ambience */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ride Atmosphere / Chatter</label>
                      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, ambience: 'quiet' })}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${preferences.ambience === 'quiet' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          Silent Ride
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, ambience: 'chatty' })}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${preferences.ambience === 'chatty' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          Friendly Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, ambience: 'music' })}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${preferences.ambience === 'music' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          Music Ok
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Preference 3: Detour limit */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Maximum Route Detour</label>
                      <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                        {['5', '10', '15', '20'].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setPreferences({ ...preferences, detourLimit: mins })}
                            className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${preferences.detourLimit === mins ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                              }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preference 4: Gender matcher */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Co-Commuter Matcher Filter</label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, genderMatch: 'any' })}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${preferences.genderMatch === 'any' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          Show All Matches
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, genderMatch: 'same-gender' })}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${preferences.genderMatch === 'same-gender' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          Same Gender Only
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display"
                    >
                      <FaSave /> Save Preferences
                    </button>
                  </div>
                </form>
              </div>

              {/* Form 3: SOS Emergency Contacts */}
              <div className="bg-gradient-to-b from-slate-900 to-[#0e1425] border border-slate-800 rounded-3xl p-6 md:p-8 relative shadow-2xl">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-orange-400 rounded-t-3xl"></div>

                <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">Emergency & SOS Dispatch Contacts</h3>
                <p className="text-[10px] text-slate-400 mb-6 leading-relaxed">
                  These coordinates and contact logs are auto-notified if the SOS Emergency alert trigger is activated in the passenger console.
                </p>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FaShieldAlt /> Primary SOS Contact (Phone)
                    </label>
                    <input
                      type="tel"
                      value={profile.sosContact}
                      onChange={(e) => {
                        setProfile({ ...profile, sosContact: e.target.value });
                        if (formErrors.sosContact) setFormErrors({ ...formErrors, sosContact: '' });
                      }}
                      className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none transition-colors ${
                        formErrors.sosContact ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-red-500/50'
                      }`}
                    />
                    {formErrors.sosContact && <p className="text-red-400 text-[10px] mt-1">{formErrors.sosContact}</p>}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 text-red-400 font-bold rounded-xl text-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display"
                    >
                      <FaSave /> Save SOS Contacts
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Right Column (4 units): Avatar Card & Saved Routes */}
            <div className="lg:col-span-4 space-y-8">

              {/* Profile Card Summary */}
              <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

                {/* Avatar circle */}
                <div className="relative w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-slate-800 flex items-center justify-center font-black text-3xl shadow-inner mt-4">
                  JD
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-slate-950 border-2 border-slate-900 rounded-full flex items-center justify-center text-[9px] font-bold" title="Corporate Verified">
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
                    <p className="font-extrabold text-white">24</p>
                    <p className="text-[9px] text-slate-500">Commutes</p>
                  </div>
                  <div className="w-px h-6 bg-slate-850"></div>
                  <div className="text-center">
                    <p className="font-extrabold text-emerald-400">62%</p>
                    <p className="text-[9px] text-slate-500">Fares Saved</p>
                  </div>
                  <div className="w-px h-6 bg-slate-850"></div>
                  <div className="text-center">
                    <p className="font-extrabold text-teal-400">68kg</p>
                    <p className="text-[9px] text-slate-500">CO₂ Offset</p>
                  </div>
                </div>
              </div>

              {/* Saved Routes Section */}
              <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest font-display">Saved Commuter Routes</h3>
                  {!showAddRouteForm && (
                    <button
                      onClick={() => setShowAddRouteForm(true)}
                      className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 cursor-pointer"
                      title="Add Saved Route"
                    >
                      <FaPlus className="text-[9px]" />
                    </button>
                  )}
                </div>

                {/* Add Route Form Dialog */}
                {showAddRouteForm && (
                  <form onSubmit={handleAddRoute} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase">New Shortcut</span>
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
                        value={newRouteName}
                        onChange={(e) => setNewRouteName(e.target.value)}
                        placeholder="Shortcut Name (e.g. Home to Work)"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newRoutePickup}
                        onChange={(e) => setNewRoutePickup(e.target.value)}
                        placeholder="Pickup Location"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newRouteDropoff}
                        onChange={(e) => setNewRouteDropoff(e.target.value)}
                        placeholder="Dropoff Location"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-500 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-wider font-display active:scale-98 transition-all cursor-pointer"
                    >
                      Save shortcut Route
                    </button>
                  </form>
                )}

                {/* Route Cards */}
                <div className="space-y-3">
                  {savedRoutes.map(route => (
                    <div key={route.id} className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex items-center justify-between group">
                      <div className="space-y-2 flex-1 pr-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white font-display">{route.name}</span>
                          <span className="text-[8px] px-1.5 py-0.2 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded">
                            {route.matches} matches
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 space-y-0.5">
                          <p>From: <span className="text-slate-300 font-medium">{route.pickup}</span></p>
                          <p>To: <span className="text-slate-300 font-medium">{route.dropoff}</span></p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteRoute(route.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 cursor-pointer shrink-0"
                        title="Delete Route"
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

export default PassengerProfile;
