import apiClient from './client';

export const transportApi = {
  getTransports: async () => {
    const response = await apiClient.get('/transports');
    return response.data.data;
  },

  getRoutes: async () => {
    const response = await apiClient.get('/routes');
    return response.data.data;
  },

  getCities: async () => {
    const response = await apiClient.get('/routes/cities');
    return response.data.data;
  },
};
