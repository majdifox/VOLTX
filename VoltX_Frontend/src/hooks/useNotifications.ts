import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import axios from 'axios';

export type NotificationType =
  | 'NEW_FOLLOWER'
  | 'ACTIVITY_LIKE'
  | 'ACTIVITY_COMMENT'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'LEVEL_UP'
  | 'EVENT_REMINDER'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'FRIEND_REQUEST'
  | 'CHALLENGE_INVITATION';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  referenceId: number | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationStats {
  totalCount: number;
  readCount: number;
  unreadCount: number;
  countsByType: Record<NotificationType, number>;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchNotifications: (page?: number, unreadOnly?: boolean) => Promise<void>;
  fetchStats: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  playNotificationSound: () => void;
}

const NOTIFICATION_SOUND = '/sounds/notification.mp3';
const API_BASE = '/api/notifications';

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // WebSocket connection for real-time notifications
  const { subscribe, isConnected } = useWebSocket();

  // Audio for notification sound
  const audio = typeof window !== 'undefined' ? new Audio(NOTIFICATION_SOUND) : null;

  const playNotificationSound = useCallback(() => {
    if (audio) {
      audio.play().catch(err => console.warn('Failed to play notification sound:', err));
    }
  }, [audio]);

  // Fetch notifications with pagination
  const fetchNotifications = useCallback(async (page = 0, unreadOnly = false) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = unreadOnly ? `${API_BASE}/unread` : API_BASE;
      const params = unreadOnly ? {} : { page, size: 20 };

      const response = await axios.get(endpoint, { params });

      if (unreadOnly) {
        setNotifications(response.data);
        setHasMore(false);
      } else {
        const newNotifications = response.data.content || response.data;

        if (page === 0) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }

        setHasMore(!response.data.last);
        setCurrentPage(page);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/unread-count`);
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Fetch notification statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch notification stats:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await axios.put(`${API_BASE}/${notificationId}/read`);

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
      throw new Error(err.response?.data?.message || 'Failed to mark as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put(`${API_BASE}/read-all`);

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );

      setUnreadCount(0);
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
      throw new Error(err.response?.data?.message || 'Failed to mark all as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await axios.delete(`${API_BASE}/${notificationId}`);

      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
    } catch (err: any) {
      console.error('Failed to delete notification:', err);
      throw new Error(err.response?.data?.message || 'Failed to delete notification');
    }
  }, []);

  // Handle real-time notification from WebSocket
  const handleRealtimeNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    playNotificationSound();

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('VoltX Notification', {
        body: notification.message,
        icon: '/logo.png',
        tag: `notification-${notification.id}`,
      });
    }
  }, [playNotificationSound]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Subscribe to real-time notifications via WebSocket
  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribe('/user/queue/notifications', handleRealtimeNotification);
      return unsubscribe;
    }
  }, [isConnected, subscribe, handleRealtimeNotification]);

  // Initial data fetch
  useEffect(() => {
    fetchNotifications(0, false);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Poll for unread count every 30 seconds as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) {
        fetchUnreadCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    stats,
    loading,
    error,
    hasMore,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    playNotificationSound,
  };
};
