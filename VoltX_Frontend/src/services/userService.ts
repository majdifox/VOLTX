import api, { handleApiError } from './api';
import { User, UpdateProfileRequest } from '../types';

export const userService = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/users/me');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get user by ID
  getUserById: async (userId: number): Promise<User> => {
    try {
      const response = await api.get<User>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get user by username
  getUserByUsername: async (username: string): Promise<User> => {
    try {
      const response = await api.get<User>(`/users/username/${username}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update user profile
  updateProfile: async (updates: UpdateProfileRequest): Promise<User> => {
    try {
      const response = await api.put<User>('/users/me', updates);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update profile picture
  updateProfilePicture: async (file: File): Promise<User> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<User>('/users/me/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update banner picture
  updateBannerPicture: async (file: File): Promise<User> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<User>('/users/me/banner-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Follow user
  followUser: async (userId: number): Promise<void> => {
    try {
      await api.post(`/users/${userId}/follow`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Unfollow user
  unfollowUser: async (userId: number): Promise<void> => {
    try {
      await api.delete(`/users/${userId}/follow`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};