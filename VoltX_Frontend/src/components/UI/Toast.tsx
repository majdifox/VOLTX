import React, { useEffect, useState } from 'react';
import { THEME } from '../../config/theme';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: `bg-[${THEME.colors.success}]`,
          icon: '✓',
          border: 'border-green-400'
        };
      case 'error':
        return {
          bg: `bg-[${THEME.colors.danger}]`,
          icon: '×',
          border: 'border-red-400'
        };
      case 'warning':
        return {
          bg: `bg-[${THEME.colors.warning}]`,
          icon: '⚠',
          border: 'border-yellow-400'
        };
      default:
        return {
          bg: `bg-[${THEME.colors.primary}]`,
          icon: 'ℹ',
          border: 'border-blue-400'
        };
    }
  };

  const { bg, icon, border } = getTypeStyles();

  return (
    <div
      className={`
        ${bg} ${border}
        fixed z-50 min-w-80 max-w-md mx-4 p-4 rounded-lg shadow-lg border-l-4
        text-white font-medium
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-xl font-bold flex-shrink-0 mt-0.5">
            {icon}
          </span>
          <p className="text-sm leading-relaxed flex-1 break-words">
            {message}
          </p>
        </div>
        
        <button
          onClick={handleClose}
          className="ml-4 text-white/80 hover:text-white transition-colors duration-200 flex-shrink-0"
          aria-label="Close notification"
        >
          <span className="text-lg">×</span>
        </button>
      </div>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right'
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className={`fixed ${getPositionStyles()} z-50 space-y-2`}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};
