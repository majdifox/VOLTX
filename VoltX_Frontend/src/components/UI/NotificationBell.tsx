import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications, NotificationCenter } from '../../contexts/NotificationContext';

interface NotificationBellProps {
  className?: string;
  showBadge?: boolean;
  badgeColor?: 'red' | 'blue' | 'green' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  showBadge = true,
  badgeColor = 'red',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const { getUnreadCount } = useNotifications();

  const unreadCount = getUnreadCount();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const badgeColors = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div ref={bellRef} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 text-gray-600 dark:text-gray-300
          hover:text-gray-900 dark:hover:text-white
          hover:bg-gray-100 dark:hover:bg-gray-700
          rounded-lg transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <BellIcon className={sizeClasses[size]} />

        {showBadge && unreadCount > 0 && (
          <span
            className={`
              absolute -top-1 -right-1
              ${badgeColors[badgeColor]}
              text-white text-xs font-bold
              rounded-full min-w-[1.25rem] h-5 px-1
              flex items-center justify-center
              animate-pulse
            `}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fadeInUp">
          <NotificationCenter />
        </div>
      )}
    </div>
  );
};

// Notification toast container that can be placed anywhere
export const NotificationToast: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}> = ({
  position = 'top-right',
  className = ''
}) => {
  const { notifications, removeNotification, markAsRead } = useNotifications();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-none ${className}`}>
      <div className="pointer-events-auto space-y-3">
        {notifications.slice(0, 3).map(notification => (
          <div
            key={notification.id}
            className={`
              max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg
              border-l-4 ${
                notification.type === 'success' ? 'border-l-green-500' :
                notification.type === 'error' ? 'border-l-red-500' :
                notification.type === 'warning' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }
              transform transition-all duration-300 ease-in-out
              translate-x-0 opacity-100
              ${notification.onClick ? 'cursor-pointer hover:shadow-xl' : ''}
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
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {notification.title && (
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {notification.title}
                    </h4>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="ml-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};