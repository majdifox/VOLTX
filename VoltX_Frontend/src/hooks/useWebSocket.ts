import { useEffect, useRef, useState } from 'react';
import { webSocketService, NotificationMessage } from '../services/webSocketService';
import { useAuthStore } from '../stores/authStore';
import { errorHandler } from '../utils';

/**
 * Hook for WebSocket connection management
 */
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const connectionAttempted = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !connectionAttempted.current) {
      connectionAttempted.current = true;

      webSocketService.connect()
        .then(() => {
          setIsConnected(true);
          setConnectionError(null);
        })
        .catch((error) => {
          setConnectionError(error.message);
          setIsConnected(false);
        });
    }

    if (!isAuthenticated && connectionAttempted.current) {
      webSocketService.disconnect();
      setIsConnected(false);
      connectionAttempted.current = false;
    }

    return () => {
      if (connectionAttempted.current) {
        webSocketService.disconnect();
      }
    };
  }, [isAuthenticated]);

  return {
    isConnected,
    connectionError,
    connect: () => webSocketService.connect(),
    disconnect: () => webSocketService.disconnect(),
    sendLevelUp: webSocketService.sendLevelUp.bind(webSocketService),
    sendAchievement: webSocketService.sendAchievement.bind(webSocketService),
    sendPointsEarned: webSocketService.sendPointsEarned.bind(webSocketService),
    updateStatus: webSocketService.updateStatus.bind(webSocketService)
  };
};

/**
 * Hook for subscribing to specific WebSocket message types
 */
export const useWebSocketSubscription = (
  messageType: string,
  handler: (message: NotificationMessage) => void,
  dependencies: any[] = []
) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const stableHandler = (message: NotificationMessage) => {
      handlerRef.current(message);
    };

    webSocketService.addMessageHandler(messageType, stableHandler);

    return () => {
      webSocketService.removeMessageHandler(messageType, stableHandler);
    };
  }, [messageType, ...dependencies]);
};

/**
 * Hook for handling personal notifications
 */
export const usePersonalNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (message: NotificationMessage) => {
    setNotifications(prev => [message, ...prev].slice(0, 50)); // Keep only last 50
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (timestamp?: string) => {
    if (timestamp) {
      // Mark specific notification as read
      setNotifications(prev =>
        prev.map(notif =>
          notif.timestamp === timestamp
            ? { ...notif, read: true }
            : notif
        )
      );
    } else {
      // Mark all as read
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  useWebSocketSubscription('personal_notification', addNotification);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications
  };
};

/**
 * Hook for handling leaderboard updates
 */
export const useLeaderboardUpdates = () => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const handleLeaderboardUpdate = (message: NotificationMessage) => {
    if (message.type === 'LEADERBOARD_UPDATE') {
      setLeaderboardData(message.data);
      setLastUpdate(message.timestamp);
    } else if (message.type === 'LEVEL_UP') {
      // Someone leveled up, trigger a refresh
      setLastUpdate(message.timestamp);
    }
  };

  useWebSocketSubscription('leaderboard_update', handleLeaderboardUpdate);

  return {
    leaderboardData,
    lastUpdate
  };
};

/**
 * Hook for handling system announcements
 */
export const useSystemAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<NotificationMessage[]>([]);
  const [activeAnnouncement, setActiveAnnouncement] = useState<NotificationMessage | null>(null);

  const handleAnnouncement = (message: NotificationMessage) => {
    if (message.type === 'SYSTEM_ANNOUNCEMENT') {
      setAnnouncements(prev => [message, ...prev].slice(0, 10)); // Keep only last 10

      // Show as active announcement for important types
      if (message.announcementType === 'critical' || message.announcementType === 'maintenance') {
        setActiveAnnouncement(message);
      }
    }
  };

  const dismissActiveAnnouncement = () => {
    setActiveAnnouncement(null);
  };

  useWebSocketSubscription('system_announcement', handleAnnouncement);

  return {
    announcements,
    activeAnnouncement,
    dismissActiveAnnouncement
  };
};

/**
 * Hook for handling activity updates (user online/offline status)
 */
export const useActivityUpdates = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [userStatuses, setUserStatuses] = useState<Map<string, { status: string, lastSeen: string }>>(new Map());

  const handleActivityUpdate = (message: NotificationMessage) => {
    if (message.type === 'STATUS_UPDATE' && message.username) {
      const { username, status, lastSeen } = message;

      setUserStatuses(prev => new Map(prev.set(username, { status, lastSeen })));

      if (status === 'online') {
        setOnlineUsers(prev => new Set(prev.add(username)));
      } else {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
      }
    }
  };

  useWebSocketSubscription('activity_update', handleActivityUpdate);

  const getUserStatus = (username: string) => {
    return userStatuses.get(username) || { status: 'offline', lastSeen: '' };
  };

  const isUserOnline = (username: string) => {
    return onlineUsers.has(username);
  };

  return {
    onlineUsers: Array.from(onlineUsers),
    onlineCount: onlineUsers.size,
    getUserStatus,
    isUserOnline,
    userStatuses: Object.fromEntries(userStatuses)
  };
};

/**
 * Hook for gamification events
 */
export const useGamificationEvents = () => {
  const [recentEvents, setRecentEvents] = useState<NotificationMessage[]>([]);
  const { sendLevelUp, sendAchievement, sendPointsEarned } = useWebSocket();

  const handleGamificationEvent = (message: NotificationMessage) => {
    if (['LEVEL_UP', 'ACHIEVEMENT_UNLOCKED', 'POINTS_EARNED'].includes(message.type)) {
      setRecentEvents(prev => [message, ...prev].slice(0, 20)); // Keep only last 20
    }
  };

  useWebSocketSubscription('personal_notification', handleGamificationEvent);
  useWebSocketSubscription('leaderboard_update', handleGamificationEvent);

  const triggerLevelUp = (level: number, points: number) => {
    sendLevelUp(level, points);
  };

  const triggerAchievement = (name: string, description: string, points: number) => {
    sendAchievement(name, description, points);
  };

  const triggerPointsEarned = (points: number, source: string, totalPoints: number) => {
    sendPointsEarned(points, source, totalPoints);
  };

  return {
    recentEvents,
    triggerLevelUp,
    triggerAchievement,
    triggerPointsEarned
  };
};