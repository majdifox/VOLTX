import React from 'react';
import { THEME } from '../../config/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  outline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  outline = false,
  className = '',
  onClick
}) => {
  const getVariantStyles = () => {
    const colors = {
      primary: outline 
        ? `border-[${THEME.colors.primary}] text-[${THEME.colors.primary}] bg-transparent` 
        : `bg-[${THEME.colors.primary}] text-white`,
      secondary: outline 
        ? `border-[${THEME.colors.secondary}] text-[${THEME.colors.secondary}] bg-transparent` 
        : `bg-[${THEME.colors.secondary}] text-white`,
      success: outline 
        ? `border-[${THEME.colors.success}] text-[${THEME.colors.success}] bg-transparent` 
        : `bg-[${THEME.colors.success}] text-white`,
      warning: outline 
        ? `border-[${THEME.colors.warning}] text-[${THEME.colors.warning}] bg-transparent` 
        : `bg-[${THEME.colors.warning}] text-white`,
      danger: outline 
        ? `border-[${THEME.colors.danger}] text-[${THEME.colors.danger}] bg-transparent` 
        : `bg-[${THEME.colors.danger}] text-white`,
      info: outline 
        ? 'border-blue-500 text-blue-500 bg-transparent' 
        : 'bg-blue-500 text-white',
      dark: outline 
        ? `border-[${THEME.colors.dark}] text-[${THEME.colors.dark}] bg-transparent` 
        : `bg-[${THEME.colors.dark}] text-white`,
      light: outline 
        ? 'border-gray-300 text-gray-600 bg-transparent' 
        : 'bg-gray-100 text-gray-800'
    };
    
    return colors[variant] + (outline ? ' border' : '');
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const isClickable = !!onClick;

  return (
    <span
      onClick={onClick}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        inline-flex items-center justify-center
        font-medium
        ${rounded ? 'rounded-full' : 'rounded-lg'}
        ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// Status Badge for common status indicators
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned' | 'verified';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return { variant: 'success' as const, label: 'Active' };
      case 'inactive':
        return { variant: 'light' as const, label: 'Inactive' };
      case 'pending':
        return { variant: 'warning' as const, label: 'Pending' };
      case 'suspended':
        return { variant: 'warning' as const, label: 'Suspended' };
      case 'banned':
        return { variant: 'danger' as const, label: 'Banned' };
      case 'verified':
        return { variant: 'info' as const, label: 'Verified' };
      default:
        return { variant: 'light' as const, label: status };
    }
  };

  const { variant, label } = getStatusConfig();

  return (
    <Badge variant={variant} size={size} rounded className={className}>
      {label}
    </Badge>
  );
};

// Level Badge for gamification levels
interface LevelBadgeProps {
  level: number;
  levelTitle?: string;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  levelTitle,
  size = 'md',
  showLevel = true,
  className = ''
}) => {
  const getVariantByLevel = (level: number) => {
    if (level >= 10) return 'danger';
    if (level >= 7) return 'warning';
    if (level >= 4) return 'secondary';
    return 'primary';
  };

  return (
    <Badge 
      variant={getVariantByLevel(level)} 
      size={size} 
      rounded 
      className={className}
    >
      {showLevel && `Lvl ${level}`}
      {levelTitle && (showLevel ? ` • ${levelTitle}` : levelTitle)}
    </Badge>
  );
};
