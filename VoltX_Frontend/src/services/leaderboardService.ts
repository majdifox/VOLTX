import api, { handleApiError } from './api';
import { LeaderboardEntry } from '../types';

export const leaderboardService = {
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    try {
      const response = await api.get<LeaderboardEntry[]>('/leaderboard');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getTopUsers: async (limit = 10): Promise<LeaderboardEntry[]> => {
    try {
      const response = await api.get<LeaderboardEntry[]>(`/leaderboard/top?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
