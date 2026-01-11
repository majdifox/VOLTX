export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile/:username?',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',
  ADMIN: '/admin',
} as const;