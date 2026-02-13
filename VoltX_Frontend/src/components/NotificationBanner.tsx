import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  InformationCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { Button } from '../UI/Button';

interface NotificationBannerProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  dismissible?: boolean;
  persistent?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  type = 'info',
  dismissible = true,
  persistent = false,
  onDismiss,
  action,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/10',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
          icon: CheckCircleIcon,
          iconColor: 'text-green-400'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-400'
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/10',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          icon: ExclamationCircleIcon,
          iconColor: 'text-red-400'
        };
      case 'announcement':
        return {
          bgColor: 'bg-purple-50 dark:bg-purple-900/10',
          borderColor: 'border-purple-200 dark:border-purple-800',
          textColor: 'text-purple-800 dark:text-purple-200',
          icon: InformationCircleIcon,
          iconColor: 'text-purple-400'
        };
      default: // info
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/10',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          icon: InformationCircleIcon,
          iconColor: 'text-blue-400'
        };
    }
  };

  if (!isVisible) return null;

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        border-l-4 p-4 ${config.bgColor} ${config.borderColor} ${className}
        ${persistent ? 'sticky top-0 z-40' : ''}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${config.textColor}`}>
            {message}
          </p>
        </div>

        <div className="ml-3 flex items-center space-x-2">
          {action && (
            <Button
              size="sm"
              variant="ghost"
              onClick={action.onClick}
              className={`${config.textColor} hover:opacity-75`}
            >
              {action.label}
            </Button>
          )}

          {dismissible && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              icon={XMarkIcon}
              className={`${config.textColor} hover:opacity-75`}
              aria-label="Dismiss notification"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// System Announcement Banner Component
interface SystemAnnouncementBannerProps {
  announcement: {
    message: string;
    type: string;
    timestamp: string;
  };
  onDismiss: () => void;
}

export const SystemAnnouncementBanner: React.FC<SystemAnnouncementBannerProps> = ({
  announcement,
  onDismiss
}) => {
  const getAnnouncementType = (announcementType: string) => {
    switch (announcementType.toLowerCase()) {
      case 'critical': return 'error';
      case 'maintenance': return 'warning';
      case 'update': return 'info';
      case 'celebration': return 'success';
      default: return 'announcement';
    }
  };

  return (
    <NotificationBanner
      message={announcement.message}
      type={getAnnouncementType(announcement.type)}
      persistent={announcement.type === 'critical' || announcement.type === 'maintenance'}
      onDismiss={onDismiss}
    />
  );
};

// Achievement Unlock Banner Component
interface AchievementBannerProps {
  achievement: {
    name: string;
    description?: string;
    points: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  onDismiss: () => void;
  showDetails?: boolean;
}

export const AchievementBanner: React.FC<AchievementBannerProps> = ({
  achievement,
  onDismiss,
  showDetails = true
}) => {
  const getRarityEmoji = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return '🏆';
      case 'epic': return '🎖️';
      case 'rare': return '🥉';
      default: return '🏅';
    }
  };

  const message = showDetails
    ? `${getRarityEmoji(achievement.rarity)} Achievement Unlocked: ${achievement.name} (+${achievement.points} AP)`
    : `🎉 New Achievement: ${achievement.name}`;

  return (
    <NotificationBanner
      message={message}
      type="success"
      onDismiss={onDismiss}
      action={showDetails ? {
        label: 'View Details',
        onClick: () => {
          // Open achievement modal or navigate to achievements page
          console.log('View achievement details:', achievement);
        }
      } : undefined}
    />
  );
};

// Level Up Banner Component
interface LevelUpBannerProps {
  newLevel: number;
  points?: number;
  onDismiss: () => void;
}

export const LevelUpBanner: React.FC<LevelUpBannerProps> = ({
  newLevel,
  points,
  onDismiss
}) => {
  const message = points
    ? `🚀 Level Up! You reached Level ${newLevel} (${points} AP)`
    : `🚀 Congratulations! You reached Level ${newLevel}`;

  return (
    <NotificationBanner
      message={message}
      type="success"
      onDismiss={onDismiss}
      action={{
        label: 'View Progress',
        onClick: () => {
          // Navigate to profile/progress page
          console.log('View level progress');
        }
      }}
    />
  );
};

// Connection Status Banner Component
interface ConnectionBannerProps {
  isConnected: boolean;
  isReconnecting?: boolean;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  isConnected,
  isReconnecting = false
}) => {
  if (isConnected) return null;

  const message = isReconnecting
    ? '🔄 Reconnecting to VoltX servers...'
    : '⚠️ Connection lost. Some features may be unavailable.';

  return (
    <NotificationBanner
      message={message}
      type={isReconnecting ? 'warning' : 'error'}
      dismissible={false}
      persistent
    />
  );
};

// Maintenance Mode Banner Component
export const MaintenanceBanner: React.FC = () => {
  return (
    <NotificationBanner
      message="🔧 VoltX is currently under maintenance. Some features may be temporarily unavailable."
      type="warning"
      dismissible={false}
      persistent
      action={{
        label: 'Status Page',
        onClick: () => {
          window.open('https://status.voltx.app', '_blank');
        }
      }}
    />
  );
};