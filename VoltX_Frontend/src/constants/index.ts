// Application constants

export const APP_NAME = 'VoltX';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    ME: '/users/me',
    BY_ID: '/users/:id',
    BY_USERNAME: '/users/username/:username',
    FOLLOW: '/users/:id/follow',
    PROFILE_PICTURE: '/users/me/profile-picture',
    BANNER_PICTURE: '/users/me/banner-picture',
  },
  POSTS: {
    BASE: '/posts',
    BY_ID: '/posts/:id',
    BY_USER: '/posts/user/:userId',
    LIKE: '/posts/:id/like',
  },
  EVENTS: {
    BASE: '/events',
    BY_ID: '/events/:id',
    BY_ORGANIZER: '/events/organizer/:organizerId',
    JOIN: '/events/:id/join',
    LEAVE: '/events/:id/leave',
    ACCEPT_MEMBER: '/events/:id/accept/:memberId',
  },
  COMMENTS: {
    BY_POST: '/comments/post/:postId',
    BY_ID: '/comments/:id',
  },
};

// Risk levels
export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;

// Post types
export const POST_TYPES = {
  SOLO: 'SOLO',
  SQUAD: 'SQUAD',
} as const;

// User roles
export const USER_ROLES = {
  EXPLORER: 'EXPLORER',
  CHALLENGER: 'CHALLENGER',
  MARSHAL: 'MARSHAL',
  CAPTAIN: 'CAPTAIN',
  ADMIN: 'ADMIN',
} as const;

// Account statuses
export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 20,
  MAX_SIZE: 100,
};

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
};

// Gamification levels
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000,
  15000, 20000, 26000, 33000, 41000
];

// Theme colors
export const THEME_COLORS = {
  PRIMARY: '#00d4ff',
  SECONDARY: '#ff6b00',
  DANGER: '#ff3366',
  SUCCESS: '#00ff88',
  WARNING: '#ffaa00',
  BG_PRIMARY: '#0a0a0a',
  BG_SECONDARY: '#1a1a1a',
  BG_TERTIARY: '#2a2a2a',
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#b3b3b3',
  TEXT_MUTED: '#666666',
};