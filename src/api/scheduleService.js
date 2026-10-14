import apiClient from './client';

export const scheduleApi = {
  search: async ({ transportType, sourceCity, destinationCity, journeyDate, passengers }) => {
    const params = {
      sourceCity,
      destinationCity,
      journeyDate,
      passengers: passengers || 1,
    };
    if (transportType) {
      params.transportType = transportType;
    }
    const response = await apiClient.get('/schedules/search', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/schedules/${id}`);
    return response.data.data;
  },

  getSeats: async (id) => {
    const response = await apiClient.get(`/schedules/${id}/seats`);
    return response.data.data;
  },
};
