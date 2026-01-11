// Frontend environment configuration
const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'VoltX',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  MAX_FILE_SIZE_MB: Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10,
  SUPPORTED_IMAGE_TYPES: import.meta.env.VITE_SUPPORTED_IMAGE_TYPES?.split(',') || [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ],
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_WEBSOCKETS: import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

export default config;