import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  timestamp: Date;
  read: boolean;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  data?: Record<string, any>;
}

export interface NotificationOptions {
  type?: NotificationType;
  title?: string;
  duration?: number;
  persistent?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  data?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, options?: NotificationOptions) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  // Convenience methods
  success: (message: string, options?: Omit<NotificationOptions, 'type'>) => string;
  error: (message: string, options?: Omit<NotificationOptions, 'type'>) => string;
  warning: (message: string, options?: Omit<NotificationOptions, 'type'>) => string;
  info: (message: string, options?: Omit<NotificationOptions, 'type'>) => string;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
  position?: NotificationPosition;
  enablePersistence?: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 10,
  defaultDuration = 5000,
  position = 'top-right',
  enablePersistence = true
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('voltx_notifications');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Persist notifications to localStorage
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      localStorage.setItem('voltx_notifications', JSON.stringify(notifications));
    }
  }, [notifications, enablePersistence]);

  const addNotification = useCallback((message: string, options: NotificationOptions = {}): string => {
    const id = uuidv4();
    const notification: Notification = {
      id,
      type: options.type || 'info',
      title: options.title,
      message,
      duration: options.duration ?? defaultDuration,
      persistent: options.persistent || false,
      onClick: options.onClick,
      onClose: options.onClose,
      timestamp: new Date(),
      read: false,
      actionButton: options.actionButton,
      data: options.data
    };

    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      return newNotifications.slice(0, maxNotifications);
    });

    // Auto-remove notification after duration (if not persistent)
    if (!notification.persistent && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  }, [defaultDuration, maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification?.onClose) {
        notification.onClose();
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Convenience methods
  const success = useCallback((message: string, options: Omit<NotificationOptions, 'type'> = {}) => {
    return addNotification(message, { ...options, type: 'success' });
  }, [addNotification]);

  const error = useCallback((message: string, options: Omit<NotificationOptions, 'type'> = {}) => {
    return addNotification(message, { ...options, type: 'error' });
  }, [addNotification]);

  const warning = useCallback((message: string, options: Omit<NotificationOptions, 'type'> = {}) => {
    return addNotification(message, { ...options, type: 'warning' });
  }, [addNotification]);

  const info = useCallback((message: string, options: Omit<NotificationOptions, 'type'> = {}) => {
    return addNotification(message, { ...options, type: 'info' });
  }, [addNotification]);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer position={position} />
    </NotificationContext.Provider>
  );
};

// Toast notification component
interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
  onMarkRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
  onMarkRead
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const handleClick = () => {
    if (notification.onClick) {
      notification.onClick();
    }
    if (!notification.read) {
      onMarkRead(notification.id);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  const transformClass = isVisible && !isLeaving
    ? 'translate-x-0 opacity-100'
    : 'translate-x-full opacity-0';

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${transformClass}
        mb-3 max-w-sm w-full bg-white dark:bg-gray-800
        border-l-4 ${getBorderColor()}
        rounded-lg shadow-lg overflow-hidden
        ${notification.onClick ? 'cursor-pointer hover:shadow-xl' : ''}
        ${!notification.read ? 'ring-2 ring-blue-200 dark:ring-blue-700' : ''}
      `}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>

          <div className="ml-3 w-0 flex-1">
            {notification.title && (
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {notification.message}
            </p>

            {notification.actionButton && (
              <div className="mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.actionButton!.onClick();
                  }}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
                >
                  {notification.actionButton.label}
                </button>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-2">
              {notification.timestamp.toLocaleTimeString()}
            </p>
          </div>

          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification container component
interface NotificationContainerProps {
  position: NotificationPosition;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ position }) => {
  const context = useContext(NotificationContext);
  if (!context) return null;

  const { notifications, removeNotification, markAsRead } = context;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50 pointer-events-none`}>
      <div className="pointer-events-auto">
        {notifications.slice(0, 5).map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            onMarkRead={markAsRead}
          />
        ))}
      </div>
    </div>
  );
};

// Notification center component for viewing all notifications
export const NotificationCenter: React.FC<{
  className?: string;
  maxHeight?: string;
}> = ({ className = '', maxHeight = 'max-h-96' }) => {
  const context = useContext(NotificationContext);
  if (!context) return null;

  const {
    notifications,
    removeNotification,
    markAsRead,
    clearAllNotifications,
    markAllAsRead
  } = context;

  if (notifications.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No notifications</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Notifications
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Mark all read
          </button>
          <button
            onClick={clearAllNotifications}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className={`overflow-y-auto ${maxHeight}`}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`
              p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700
              ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              ${notification.onClick ? 'cursor-pointer' : ''}
            `}
            onClick={() => {
              if (notification.onClick) {
                notification.onClick();
              }
              if (!notification.read) {
                markAsRead(notification.id);
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {notification.type === 'success' && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  )}
                  {notification.type === 'error' && (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                  {notification.type === 'warning' && (
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  )}
                  {notification.type === 'info' && (
                    <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {notification.title && (
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};