import { create } from 'zustand';
import { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

interface NotificationActions {
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: number) => void;
  clearNotifications: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,

  // Actions
  setNotifications: (notifications: Notification[]) => {
    const unreadCount = notifications.filter(n => !n.read).length;
    set({
      notifications,
      unreadCount,
    });
  },

  addNotification: (notification: Notification) => {
    const { notifications } = get();
    const newNotifications = [notification, ...notifications];
    const unreadCount = newNotifications.filter(n => !n.read).length;

    set({
      notifications: newNotifications,
      unreadCount,
    });
  },

  markAsRead: (notificationId: number) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    const unreadCount = updatedNotifications.filter(n => !n.read).length;

    set({
      notifications: updatedNotifications,
      unreadCount,
    });
  },

  markAllAsRead: () => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
    }));

    set({
      notifications: updatedNotifications,
      unreadCount: 0,
    });
  },

  removeNotification: (notificationId: number) => {
    const { notifications } = get();
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    const unreadCount = updatedNotifications.filter(n => !n.read).length;

    set({
      notifications: updatedNotifications,
      unreadCount,
    });
  },

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));