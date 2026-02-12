import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rounded?: boolean;
  outline?: boolean;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  rounded = false,
  outline = false,
  dot = false,
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  // Variant classes for solid badges
  const solidVariantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-primary text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  // Variant classes for outline badges
  const outlineVariantClasses = {
    default: 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    primary: 'border-primary text-primary',
    secondary: 'border-gray-500 text-gray-500',
    success: 'border-green-500 text-green-600',
    warning: 'border-yellow-500 text-yellow-600',
    danger: 'border-red-500 text-red-600',
    info: 'border-blue-500 text-blue-600'
  };

  const baseClasses = `
    inline-flex items-center font-medium
    ${rounded ? 'rounded-full' : 'rounded-md'}
    ${sizeClasses[size]}
    ${outline
      ? `border ${outlineVariantClasses[variant]}`
      : solidVariantClasses[variant]
    }
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (dot) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <span
          className={`
            w-2 h-2 rounded-full mr-2
            ${solidVariantClasses[variant].split(' ')[0]}
          `}
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">{children}</span>
      </span>
    );
  }

  return (
    <span className={baseClasses}>
      {children}
    </span>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned' | 'online' | 'offline';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showDot = false,
  className = ''
}) => {
  const statusConfig = {
    active: { label: 'Active', variant: 'success' as const },
    inactive: { label: 'Inactive', variant: 'default' as const },
    pending: { label: 'Pending', variant: 'warning' as const },
    suspended: { label: 'Suspended', variant: 'danger' as const },
    banned: { label: 'Banned', variant: 'danger' as const },
    online: { label: 'Online', variant: 'success' as const },
    offline: { label: 'Offline', variant: 'default' as const }
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      dot={showDot}
      rounded
      className={className}
    >
      {config.label}
    </Badge>
  );
};

// Level Badge Component
interface LevelBadgeProps {
  level: number;
  maxLevel?: number;
  showProgress?: boolean;
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  maxLevel = 15,
  showProgress = false,
  className = ''
}) => {
  const getLevelInfo = (level: number) => {
    if (level >= 13) return { label: 'Legend', variant: 'danger' as const, color: 'from-red-500 to-pink-600' };
    if (level >= 10) return { label: 'Expert', variant: 'warning' as const, color: 'from-yellow-400 to-orange-500' };
    if (level >= 7) return { label: 'Advanced', variant: 'info' as const, color: 'from-blue-400 to-purple-500' };
    if (level >= 4) return { label: 'Intermediate', variant: 'success' as const, color: 'from-green-400 to-blue-500' };
    return { label: 'Beginner', variant: 'default' as const, color: 'from-gray-400 to-gray-500' };
  };

  const levelInfo = getLevelInfo(level);

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className={`bg-gradient-to-r ${levelInfo.color} text-white px-3 py-1 rounded-full text-sm font-bold`}>
        Level {level}
      </div>
      {showProgress && maxLevel && (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <span>{level}</span>
          <span>/</span>
          <span>{maxLevel}</span>
        </div>
      )}
    </div>
  );
};

// Points Badge Component
interface PointsBadgeProps {
  points: number;
  label?: string;
  icon?: string;
  animate?: boolean;
  className?: string;
}

export const PointsBadge: React.FC<PointsBadgeProps> = ({
  points,
  label = 'AP',
  icon = '⚡',
  animate = false,
  className = ''
}) => {
  const formatPoints = (points: number): string => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    }
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  };

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <span className={`text-lg ${animate ? 'animate-pulse' : ''}`}>{icon}</span>
      <span className="font-bold text-primary">{formatPoints(points)}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
};
