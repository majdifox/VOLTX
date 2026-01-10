import api, { handleApiError } from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/refresh', {}, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Logout (client-side only for now)
  logout: async (): Promise<void> => {
    // In a real app, you might want to call a logout endpoint
    // to invalidate the refresh token on the server
    return Promise.resolve();
  },
};