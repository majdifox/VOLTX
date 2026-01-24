// API endpoints configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password'
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string | number) => `/users/${id}`,
    BY_USERNAME: (username: string) => `/users/username/${username}`,
    SEARCH: '/users/search',
    LEADERBOARD: '/users/leaderboard',
    UPDATE_PROFILE: '/users/profile',
    UPDATE_AVATAR: '/users/avatar'
  },

  // Events (placeholder for future implementation)
  EVENTS: {
    BASE: '/events',
    BY_ID: (id: string | number) => `/events/${id}`,
    CATEGORIES: '/events/categories',
    UPCOMING: '/events/upcoming',
    USER_EVENTS: (userId: string | number) => `/events/user/${userId}`,
    JOIN: (eventId: string | number) => `/events/${eventId}/join`,
    LEAVE: (eventId: string | number) => `/events/${eventId}/leave`
  },

  // Gamification
  GAMIFICATION: {
    LEVELS: '/gamification/levels',
    REWARDS: '/gamification/rewards',
    ACHIEVEMENTS: '/gamification/achievements',
    USER_PROGRESS: (userId: string | number) => `/gamification/progress/${userId}`
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    REPORTS: '/admin/reports',
    MODERATION: '/admin/moderation',
    STATISTICS: '/admin/statistics'
  }
} as const;

// Helper function to build full URL
export const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Type-safe endpoint builder
export const createEndpoint = (path: string) => ({
  url: `${API_BASE_URL}${path}`,
  build: (params?: Record<string, string | number>) => buildUrl(path, params)
});
