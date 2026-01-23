import React from 'react';
import { THEME } from '../../config/theme';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  fullWidth = false,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return `bg-[${THEME.colors.secondary}] hover:bg-[#e55a00]`;
      case 'danger':
        return `bg-[${THEME.colors.danger}] hover:bg-[#e62e58]`;
      case 'success':
        return `bg-[${THEME.colors.success}] hover:bg-[#00e679]`;
      case 'warning':
        return `bg-[${THEME.colors.warning}] hover:bg-[#e6990a]`;
      case 'ghost':
        return `bg-transparent border-2 border-[${THEME.colors.primary}] text-[${THEME.colors.primary}] hover:bg-[${THEME.colors.primary}] hover:text-white`;
      default:
        return `bg-[${THEME.colors.primary}] hover:bg-[#00bfe6]`;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        text-white font-semibold rounded-lg
        transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none focus:ring-2 focus:ring-opacity-50
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
