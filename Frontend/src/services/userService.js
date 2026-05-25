import { api } from './api';

export const userService = {
  getCurrentUser: async () => {
    return api.get('/users/me');
  },

  updateProfile: async (profileData) => {
    return api.put('/users/me', profileData);
  }
};
