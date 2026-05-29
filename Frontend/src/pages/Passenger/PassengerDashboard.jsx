import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import PassengerSidebar from './components/PassengerSidebar.jsx';
import PassengerHeader from './components/PassengerHeader.jsx';
import PassengerOverview from './components/PassengerOverview.jsx';
import FindRides from './components/FindRides.jsx';
import MyBookings from './components/MyBookings.jsx';
import RideHistory from './components/RideHistory.jsx';
import SavedRoutes from './components/SavedRoutes.jsx';

import { userService } from '../../services/userService';
import { rideService } from '../../services/rideService';
import { dashboardService } from '../../services/dashboardService';

function PassengerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Tab control state synced with router location state for deep-linking
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchPickup, setSearchPickup] = useState('');
  const [searchDropoff, setSearchDropoff] = useState('');

  // Overview metrics state
  const [stats, setStats] = useState({
    totalRides: 0,
    moneySaved: 0,
    co2Reduced: 0,
    activePools: 0
  });

  // Recent activity logs state
  const [activities, setActivities] = useState([
    { id: 1, text: "New pool match found on Kukatpally route", time: "2 hours ago", type: "match" },
    { id: 2, text: "Completed commute with Driver Rahul S.", time: "2 days ago", type: "completed" },
    { id: 3, text: "Saved ₹150 on Ameerpet route", time: "3 days ago", type: "savings" },
    { id: 4, text: "Updated corporate email verification", time: "5 days ago", type: "system" }
  ]);

  // Chart data
  const weeklySavingsData = [
    { day: 'Mon', amount: 120 },
    { day: 'Tue', amount: 150 },
    { day: 'Wed', amount: 90 },
    { day: 'Thu', amount: 180 },
    { day: 'Fri', amount: 200 },
    { day: 'Sat', amount: 50 },
    { day: 'Sun', amount: 0 }
  ];
  const maxSavings = Math.max(...weeklySavingsData.map(d => d.amount), 1);

  // List of available rides (Find Rides)
  const [availableRides, setAvailableRides] = useState([]);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [isLoadingRides, setIsLoadingRides] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // History list
  const historyList = [
    { id: 1, driver: "Rahul S.", route: "Ameerpet → Hitech City", date: "May 20, 2026", fare: 45, status: "Completed", rating: 5 },
    { id: 2, driver: "Sneha G.", route: "Madhapur → Ameerpet", date: "May 18, 2026", fare: 45, status: "Completed", rating: 5 },
    { id: 3, driver: "Priya M.", route: "Secunderabad → Gachibowli", date: "May 15, 2026", fare: 75, status: "Completed", rating: 4 },
    { id: 4, driver: "Ankit V.", route: "Kukatpally → Madhapur", date: "May 12, 2026", fare: 50, status: "Completed", rating: 5 },
  ];

  // Saved Routes
  const [savedRoutes, setSavedRoutes] = useState([
    { id: 1, name: "Office Commute", pickup: "Ameerpet", dropoff: "Hitech City", matches: 4 },
    { id: 2, name: "Weekend Route", pickup: "Secunderabad", dropoff: "Gachibowli", matches: 2 },
    { id: 3, name: "College Path", pickup: "Kukatpally", dropoff: "Madhapur", matches: 3 }
  ]);

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
    if (path.includes('/passenger/find-rides')) {
      setActiveTab('findRides');
    } else if (path.includes('/passenger/bookings')) {
      setActiveTab('bookings');
    } else if (path.includes('/passenger/history')) {
      setActiveTab('history');
    } else if (path.includes('/passenger/routes')) {
      setActiveTab('routes');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  const userName = user ? user.fullName : 'John Doe';
  const userCompany = user && user.company ? user.company : 'Not specified';

  // Fetch dashboard stats dynamically from backend
  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await dashboardService.getPassengerStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching passenger dashboard stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch available active rides from backend
  const fetchAvailableRides = async () => {
    setIsLoadingRides(true);
    try {
      const data = await rideService.getAllRides();
      if (data.success) {
        const currentUserId = user ? user.id || user._id : '';
        const mappedRides = data.rides.map(ride => ({
          id: ride._id,
          driverName: ride.driver ? ride.driver.fullName : 'Verified Driver',
          driverCompany: ride.driver && ride.driver.vehicleName ? ride.driver.vehicleName : 'Verified Commuter',
          driverRating: 4.9,
          vehicle: ride.driver && ride.driver.vehicleNumber ? `${ride.driver.vehicleName} (${ride.driver.vehicleNumber})` : ride.vehicleType,
          pickup: ride.pickupLocation,
          dropoff: ride.dropLocation,
          time: ride.departureTime,
          date: ride.departureDate,
          seats: ride.availableSeats,
          price: ride.pricePerSeat,
          match: 90 + Math.floor(Math.random() * 10),
          joined: ride.passengers ? ride.passengers.includes(currentUserId) : false
        }));
        setAvailableRides(mappedRides);
      }
    } catch (err) {
      console.error('Error fetching available rides:', err);
    } finally {
      setIsLoadingRides(false);
    }
  };

  // Fetch passenger's joined bookings from backend
  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const data = await rideService.getPassengerBookings();
      if (data.success) {
        const mappedBookings = data.bookings.map(b => ({
          id: b._id,
          driverName: b.driver ? b.driver.fullName : 'Verified Driver',
          driverCompany: b.driver && b.driver.vehicleName ? b.driver.vehicleName : 'Verified Commuter',
          vehicle: b.driver && b.driver.vehicleNumber ? `${b.driver.vehicleName} (${b.driver.vehicleNumber})` : b.vehicleType,
          pickup: b.pickupLocation,
          dropoff: b.dropLocation,
          time: `${b.departureTime} (${b.departureDate})`,
          status: b.status === 'active' ? 'Confirmed' : (b.status === 'cancelled' ? 'Cancelled' : 'Completed'),
          price: b.pricePerSeat
        }));
        setUpcomingRides(mappedBookings);
      }
    } catch (err) {
      console.error('Error fetching passenger bookings:', err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchAvailableRides(),
      fetchBookings()
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

  // Handle joining a ride
  const handleJoinRide = async (rideId) => {
    try {
      const data = await rideService.joinRide(rideId);
      if (data.success) {
        // Log Activity
        const joinedRide = availableRides.find(r => r.id === rideId);
        const newActivity = {
          id: Date.now(),
          text: `Joined ${joinedRide ? joinedRide.driverName : 'Driver'}'s ride to ${joinedRide ? joinedRide.dropoff : 'destination'}`,
          time: "Just now",
          type: "joined"
        };
        setActivities(prev => [newActivity, ...prev]);

        // Reload lists immediately
        await refreshData();
      }
    } catch (err) {
      alert(err.message || 'Failed to join ride pool');
    }
  };

  // Handle cancellation (Leave Ride)
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const data = await rideService.leaveRide(bookingId);
      if (data.success) {
        // Log Activity
        const newActivity = {
          id: Date.now(),
          text: "Cancelled pool request",
          time: "Just now",
          type: "cancel"
        };
        setActivities(prev => [newActivity, ...prev]);

        // Reload lists immediately
        await refreshData();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const filteredRides = availableRides.filter(ride => {
    const matchesPickup = ride.pickup.toLowerCase().includes(searchPickup.toLowerCase());
    const matchesDropoff = ride.dropoff.toLowerCase().includes(searchDropoff.toLowerCase());
    return matchesPickup && matchesDropoff;
  });

  const handleSettingsNavigation = () => {
    navigate('/passenger/profile');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {activeTab === 'dashboard' && (
        <PassengerOverview
          stats={stats}
          weeklySavingsData={weeklySavingsData}
          maxSavings={maxSavings}
          upcomingRides={upcomingRides}
          handleCancelBooking={handleCancelBooking}
          activities={activities}
          setActiveTab={setActiveTab}
          userName={userName}
        />
      )}

      {activeTab === 'findRides' && (
        <FindRides
          handleJoinRide={handleJoinRide}
          onBookingSuccess={refreshData}
        />
      )}

      {activeTab === 'bookings' && (
        <MyBookings
          upcomingRides={upcomingRides}
          handleCancelBooking={handleCancelBooking}
        />
      )}

      {activeTab === 'history' && (
        <RideHistory
          historyList={historyList}
        />
      )}

      {activeTab === 'routes' && (
        <SavedRoutes
          savedRoutes={savedRoutes}
          setSearchPickup={setSearchPickup}
          setSearchDropoff={setSearchDropoff}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}

export default PassengerDashboard;
