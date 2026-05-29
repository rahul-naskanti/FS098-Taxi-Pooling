import { api } from './api';

export const rideService = {
  createRide: async (rideData) => {
    return api.post('/rides', rideData);
  },

  getAllRides: async () => {
    return api.get('/rides');
  },

  getDriverRides: async () => {
    return api.get('/rides/driver/my-rides');
  },

  getPassengerBookings: async () => {
    return api.get('/rides/passenger/bookings');
  },

  joinRide: async (rideId) => {
    return api.post(`/rides/${rideId}/join`);
  },

  leaveRide: async (rideId) => {
    return api.post(`/rides/${rideId}/leave`);
  },

  cancelRide: async (rideId) => {
    return api.patch(`/rides/${rideId}/cancel`);
  },

  removePassenger: async (rideId, passengerId) => {
    return api.post(`/rides/${rideId}/remove-passenger`, { passengerId });
  },

  searchRides: async (searchParams) => {
    const query = new URLSearchParams();
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== undefined && searchParams[key] !== null && searchParams[key] !== '') {
        if (Array.isArray(searchParams[key])) {
          query.append(key, searchParams[key].join(','));
        } else {
          query.append(key, searchParams[key]);
        }
      }
    });
    return api.get(`/rides/search?${query.toString()}`);
  },

  getRideById: async (id) => {
    return api.get(`/rides/${id}`);
  },

  bookRide: async (bookingData) => {
    return api.post('/bookings', bookingData);
  },

  saveRide: async (rideId) => {
    return api.post('/rides/save', { rideId });
  },

  getSavedRides: async () => {
    return api.get('/passenger/saved-rides');
  },

  getRecentSearches: async () => {
    return api.get('/passenger/recent-searches');
  }
};
