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
  }
};
