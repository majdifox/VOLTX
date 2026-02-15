import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Filter } from 'lucide-react';
import { useNotifications, Notification, NotificationType } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  onClose?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchNotifications(page, filter === 'unread');
  }, [page, filter, fetchNotifications]);

  const handleMarkAsRead = useCallback(async (notificationId: number) => {
    await markAsRead(notificationId);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleDelete = useCallback(async (notificationId: number) => {
    await deleteNotification(notificationId);
  }, [deleteNotification]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const filteredNotifications = selectedType === 'all'
    ? notifications
    : notifications.filter(n => n.type === selectedType);

  const getNotificationIcon = (type: NotificationType): string => {
    const icons: Record<NotificationType, string> = {
      NEW_FOLLOWER: '👥',
      ACTIVITY_LIKE: '❤️',
      ACTIVITY_COMMENT: '💬',
      ACHIEVEMENT_UNLOCKED: '🏆',
      LEVEL_UP: '⬆️',
      EVENT_REMINDER: '📅',
      SYSTEM_ANNOUNCEMENT: '📢',
      FRIEND_REQUEST: '🤝',
      CHALLENGE_INVITATION: '🎯',
    };
    return icons[type] || '📬';
  };

  const getNotificationColor = (type: NotificationType): string => {
    const colors: Record<NotificationType, string> = {
      NEW_FOLLOWER: 'bg-blue-100 text-blue-800',
      ACTIVITY_LIKE: 'bg-pink-100 text-pink-800',
      ACTIVITY_COMMENT: 'bg-purple-100 text-purple-800',
      ACHIEVEMENT_UNLOCKED: 'bg-yellow-100 text-yellow-800',
      LEVEL_UP: 'bg-green-100 text-green-800',
      EVENT_REMINDER: 'bg-indigo-100 text-indigo-800',
      SYSTEM_ANNOUNCEMENT: 'bg-orange-100 text-orange-800',
      FRIEND_REQUEST: 'bg-teal-100 text-teal-800',
      CHALLENGE_INVITATION: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-lg ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded-lg ${
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Unread
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="w-full px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center justify-center space-x-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading && page === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No notifications yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                icon={getNotificationIcon(notification.type)}
                colorClass={getNotificationColor(notification.type)}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="p-4">
            <button
              onClick={handleLoadMore}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-gray-700"
            >
              Load More
            </button>
          </div>
        )}

        {loading && page > 0 && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  icon: string;
  colorClass: string;
  onMarkAsRead: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  icon,
  colorClass,
  onMarkAsRead,
  onDelete,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [marking, setMarking] = useState(false);

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.read || marking) return;

    setMarking(true);
    try {
      await onMarkAsRead(notification.id);
    } finally {
      setMarking(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleting) return;

    setDeleting(true);
    try {
      await onDelete(notification.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
        !notification.read ? 'bg-blue-50 dark:bg-gray-800' : ''
      } ${deleting ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${colorClass}`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.read ? 'font-semibold' : ''} text-gray-900 dark:text-white`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {!notification.read && (
            <button
              onClick={handleMarkAsRead}
              disabled={marking}
              className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-700 disabled:opacity-50"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-gray-700 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
