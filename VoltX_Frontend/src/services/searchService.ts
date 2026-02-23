import api, { handleApiError } from './api';

export const searchService = {
  searchUsers: async (query: string): Promise<any[]> => {
    try {
      const res = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
      return res.data;
    } catch (error) { throw new Error(handleApiError(error)); }
  },
  searchEvents: async (query: string): Promise<any[]> => {
    try {
      const res = await api.get(`/events/search?query=${encodeURIComponent(query)}`);
      return res.data;
    } catch (error) { throw new Error(handleApiError(error)); }
  },
};
