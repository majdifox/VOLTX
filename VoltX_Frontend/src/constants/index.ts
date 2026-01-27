// Application-wide constants
export const APP_CONSTANTS = {
  // Application info
  APP_NAME: "VoltX",
  APP_VERSION: "1.0.0",
  APP_DESCRIPTION: "Extreme Sports Adventure Platform",

  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: "voltx_auth_token",
    USER_DATA: "voltx_user",
    PREFERENCES: "voltx_user_preferences",
    THEME: "voltx_theme",
    LANGUAGE: "voltx_language"
  },

  // API settings
  API: {
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    SIZE_OPTIONS: [10, 20, 50, 100]
  },

  // Validation limits
  VALIDATION: {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    PASSWORD_MIN_LENGTH: 8,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50
  },

  // Gamification
  GAMIFICATION: {
    MAX_LEVEL: 15,
    MAX_POINTS: 100000,
    DAILY_LOGIN_BONUS: 10,
    LEVEL_UP_BONUS: 50
  },

  // UI constants
  UI: {
    TOAST_DURATION: 5000,
    MODAL_TRANSITION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 200
  },

  // Error messages
  ERRORS: {
    NETWORK: "Network error. Please check your connection.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
    SERVER_ERROR: "Server error. Please try again later.",
    VALIDATION: "Please check your input and try again."
  },

  // Success messages
  SUCCESS: {
    LOGIN: "Successfully logged in!",
    LOGOUT: "Successfully logged out!",
    REGISTER: "Account created successfully!",
    PROFILE_UPDATE: "Profile updated successfully!"
  }
} as const;
