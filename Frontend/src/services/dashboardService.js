import { api } from './api';

export const dashboardService = {
  getPassengerStats: async () => {
    return api.get('/dashboard/passenger');
  },

  getDriverStats: async () => {
    return api.get('/dashboard/driver');
  }
};
