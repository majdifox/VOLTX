import api, { handleApiError } from './api';

export interface Notification {
  id: number;
  type: string;
  message: string;
  referenceId: number;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get<Notification[]>('/notifications');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    try {
      const response = await api.get<{ count: number }>('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
