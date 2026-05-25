import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import DriverSidebar from './components/DriverSidebar.jsx';
import DriverHeader from './components/DriverHeader.jsx';
import DriverOverview from './components/DriverOverview.jsx';
import CreateRide from './components/CreateRide.jsx';
import ActiveRides from './components/ActiveRides.jsx';
import RideRequests from './components/RideRequests.jsx';
import Earnings from './components/Earnings.jsx';
import RideHistory from './components/RideHistory.jsx';

import { userService } from '../../services/userService';
import { rideService } from '../../services/rideService';
import { dashboardService } from '../../services/dashboardService';

function DriverDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Tab control state synced with router location state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Overview stats state
  const [stats, setStats] = useState({
    ridesGiven: 0,
    monthlyEarnings: 0,
    totalPassengers: 0,
    activePools: 0
  });

  // Recent driver activities log
  const [activities, setActivities] = useState([
    { id: 1, text: "Created a new pool route Ameerpet to Hitech City", time: "1 hour ago", type: "create" },
    { id: 2, text: "Received joining request from Passenger Vivek K.", time: "2 hours ago", type: "request" },
    { id: 3, text: "Completed trip Ameerpet → Hitech City, earned ₹135", time: "Yesterday", type: "payout" },
    { id: 4, text: "Withdrew monthly earnings ₹4,500 to Bank", time: "3 days ago", type: "withdrawal" }
  ]);

  // Dynamic Weekly Earnings state
  const [weeklyEarnings, setWeeklyEarnings] = useState([
    { day: 'Mon', amount: 0 },
    { day: 'Tue', amount: 0 },
    { day: 'Wed', amount: 0 },
    { day: 'Thu', amount: 0 },
    { day: 'Fri', amount: 0 },
    { day: 'Sat', amount: 0 },
    { day: 'Sun', amount: 0 }
  ]);

  const maxEarnings = Math.max(...weeklyEarnings.map(d => d.amount), 1);

  // Active Rides State
  const [activeRides, setActiveRides] = useState([]);
  const [isLoadingRides, setIsLoadingRides] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Ride Request matches
  const [rideRequests, setRideRequests] = useState([]);

  // Create Ride Form Fields
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('3');
  const [vehicle, setVehicle] = useState('Sedan');
  const [price, setPrice] = useState('50');
  const [notes, setNotes] = useState('');

  const [formStatus, setFormStatus] = useState('');

  const intervalRef = useRef(null);

  // Fetch current user details
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userService.getCurrentUser();
        if (data.success) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching user data', err);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/driver/create-ride')) {
      setActiveTab('createRide');
    } else if (path.includes('/driver/active-rides')) {
      setActiveTab('activeRides');
    } else if (path.includes('/driver/requests')) {
      setActiveTab('requests');
    } else if (path.includes('/driver/earnings')) {
      setActiveTab('earnings');
    } else if (path.includes('/driver/history')) {
      setActiveTab('history');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  const userName = user ? user.fullName : 'Rahul S.';
  const userCompany = user && user.vehicleName ? `${user.vehicleName} (${user.vehicleNumber})` : 'Verified Driver';

  // Fetch dashboard stats dynamically from backend
  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await dashboardService.getDriverStats();
      if (data.success) {
        setStats(data.stats);
        if (data.rideRequests) {
          setRideRequests(data.rideRequests);
        }
        if (data.weeklyEarnings) {
          setWeeklyEarnings(data.weeklyEarnings);
        }
      }
    } catch (err) {
      console.error('Error fetching driver dashboard stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch driver's active rides from backend
  const fetchRides = async () => {
    setIsLoadingRides(true);
    try {
      const data = await rideService.getDriverRides();
      if (data.success) {
        const mappedRides = data.rides.map(ride => ({
          id: ride._id,
          pickup: ride.pickupLocation,
          dropoff: ride.dropLocation,
          date: ride.departureDate,
          time: ride.departureTime,
          seats: ride.availableSeats,
          vehicle: ride.vehicleType,
          price: ride.pricePerSeat,
          passengersCount: ride.passengers ? ride.passengers.length : 0,
          status: ride.status === 'active' ? 'Active - Matching' : (ride.status === 'cancelled' ? 'Cancelled' : 'Completed'),
          notes: ride.notes
        }));
        setActiveRides(mappedRides);
      }
    } catch (err) {
      console.error('Error fetching driver rides:', err);
    } finally {
      setIsLoadingRides(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchRides()
    ]);
  };

  useEffect(() => {
    if (user) {
      refreshData();

      // Setup lightweight polling using useRef interval
      intervalRef.current = setInterval(() => {
        refreshData();
      }, 20000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [user]);

  // Past ride history
  const historyList = [
    { id: 1, route: "Ameerpet → Hitech City", date: "May 22, 2026", passengers: 3, earned: 135, status: "Completed" },
    { id: 2, route: "Madhapur → Ameerpet", date: "May 20, 2026", passengers: 2, earned: 90, status: "Completed" },
    { id: 3, route: "Ameerpet → Gachibowli", date: "May 18, 2026", passengers: 3, earned: 225, status: "Completed" },
    { id: 4, route: "Secunderabad → Hitech City", date: "May 15, 2026", passengers: 4, earned: 300, status: "Completed" }
  ];

  // Helper to format current time e.g. "9:14 AM"
  const getFormattedTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Handle Create Ride
  const handleCreateRide = async (e) => {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim() || !date || !time) {
      alert('Please fill out all required route parameters.');
      return;
    }

    setFormStatus('Registering ride pool...');

    try {
      const data = await rideService.createRide({
        pickupLocation: pickup,
        dropLocation: dropoff,
        departureDate: date,
        departureTime: time,
        availableSeats: parseInt(seats, 10),
        pricePerSeat: parseInt(price, 10),
        vehicleType: vehicle,
        notes: notes
      });

      if (data.success) {
        // Log Activity
        const newActivity = {
          id: Date.now(),
          text: `Created new route ${pickup} → ${dropoff}`,
          time: "Just now",
          type: "create"
        };
        setActivities(prev => [newActivity, ...prev]);

        // Clear form
        setPickup('');
        setDropoff('');
        setDate('');
        setTime('');
        setSeats('3');
        setPrice('50');
        setNotes('');

        setFormStatus('Ride pool created and is now active for matching.');

        // Reload rides list immediately
        await refreshData();

        setTimeout(() => setFormStatus(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to create ride pool');
      setFormStatus('');
    }
  };

  // Handle Cancel Ride
  const handleCancelRide = async (rideId) => {
    if (!window.confirm('Are you sure you want to cancel this ride pool?')) return;

    try {
      const data = await rideService.cancelRide(rideId);
      if (data.success) {
        // Log Activity
        const newActivity = {
          id: Date.now(),
          text: `Cancelled pool request`,
          time: "Just now",
          type: "decline"
        };
        setActivities(prev => [newActivity, ...prev]);

        // Reload list immediately
        await refreshData();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel ride');
    }
  };

  // Handle Accept Request (local visual confirmation / list cleanup since passenger is already joined)
  const handleAcceptRequest = (requestId, rideId, passengerName) => {
    // Just log activity and remove from local rideRequests list
    const newActivity = {
      id: Date.now(),
      text: `✓ Confirmed ${passengerName} — ${getFormattedTime()}`,
      time: "Just now",
      type: "accept"
    };
    setActivities(prevAct => [newActivity, ...prevAct]);
    setRideRequests(prev => prev.filter(req => req.id !== requestId));
  };

  // Handle Reject Request / Remove Passenger from Ride (calls backend removePassenger API)
  const handleRejectRequest = async (requestId, passengerName) => {
    // requestId is formatted as `rideId-passengerId`
    const [rideId, passengerId] = requestId.split('-');
    if (!rideId || !passengerId) return;

    if (!window.confirm(`Are you sure you want to remove ${passengerName} from this ride?`)) return;

    try {
      const data = await rideService.removePassenger(rideId, passengerId);
      if (data.success) {
        const newActivity = {
          id: Date.now(),
          text: `✗ Removed ${passengerName} — ${getFormattedTime()}`,
          time: "Just now",
          type: "decline"
        };
        setActivities(prev => [newActivity, ...prev]);
        setRideRequests(prev => prev.filter(req => req.id !== requestId));

        // Refresh statistics and lists
        await refreshData();
      }
    } catch (err) {
      alert(err.message || 'Failed to remove passenger');
    }
  };

  const handleSettingsNavigation = () => {
    navigate('/driver/profile');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {activeTab === 'dashboard' && (
        <DriverOverview
          stats={stats}
          rideRequests={rideRequests}
          handleAcceptRequest={handleAcceptRequest}
          handleRejectRequest={handleRejectRequest}
          activeRides={activeRides}
          activities={activities}
          setActiveTab={setActiveTab}
          userName={userName.split(' ')[0]}
        />
      )}

      {activeTab === 'createRide' && (
        <CreateRide
          pickup={pickup}
          setPickup={setPickup}
          dropoff={dropoff}
          setDropoff={setDropoff}
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
          seats={seats}
          setSeats={setSeats}
          vehicle={vehicle}
          setVehicle={setVehicle}
          price={price}
          setPrice={setPrice}
          notes={notes}
          setNotes={setNotes}
          formStatus={formStatus}
          handleCreateRide={handleCreateRide}
        />
      )}

      {activeTab === 'activeRides' && (
        <ActiveRides
          activeRides={activeRides}
          handleCancelRide={handleCancelRide}
        />
      )}

      {activeTab === 'requests' && (
        <RideRequests
          rideRequests={rideRequests}
          handleAcceptRequest={handleAcceptRequest}
          handleRejectRequest={handleRejectRequest}
        />
      )}

      {activeTab === 'earnings' && (
        <Earnings
          stats={stats}
          weeklyEarnings={weeklyEarnings}
          maxEarnings={maxEarnings}
        />
      )}

      {activeTab === 'history' && (
        <RideHistory
          historyList={historyList}
        />
      )}
    </div>
  );
}

export default DriverDashboard;
