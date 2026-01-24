import React from 'react';
import { THEME } from '../../config/theme';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  fullScreen = false,
  message,
  className = ''
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      default:
        return 'w-8 h-8';
    }
  };

  const getColorStyles = () => {
    switch (color) {
      case 'secondary':
        return `text-[${THEME.colors.secondary}] border-[${THEME.colors.secondary}]`;
      case 'white':
        return 'text-white border-white';
      case 'gray':
        return 'text-gray-600 border-gray-600';
      default:
        return `text-[${THEME.colors.primary}] border-[${THEME.colors.primary}]`;
    }
  };

  const renderSpinner = () => (
    <div
      className={`
        ${getSizeStyles()} ${getColorStyles()}
        border-2 border-t-transparent rounded-full
        animate-spin
      `}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : size === 'xl' ? 'w-5 h-5' : 'w-3 h-3'}
            ${getColorStyles().split(' ')[0]}
            bg-current rounded-full animate-pulse
          `}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={`
        ${getSizeStyles()} ${getColorStyles().split(' ')[0]}
        bg-current rounded-full animate-pulse
      `}
    />
  );

  const renderBars = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`
            ${size === 'sm' ? 'w-1' : size === 'lg' ? 'w-2' : size === 'xl' ? 'w-3' : 'w-1.5'}
            ${size === 'sm' ? 'h-4' : size === 'lg' ? 'h-8' : size === 'xl' ? 'h-10' : 'h-6'}
            ${getColorStyles().split(' ')[0]}
            bg-current animate-pulse
          `}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      default:
        return renderSpinner();
    }
  };

  const LoaderContent = () => (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderLoader()}
      {message && (
        <p className={`mt-3 text-sm ${getColorStyles().split(' ')[0]} animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <LoaderContent />
      </div>
    );
  }

  return <LoaderContent />;
};

// Skeleton loader for content placeholders
interface SkeletonProps {
  lines?: number;
  height?: string;
  width?: string;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  lines = 1,
  height = '1rem',
  width = '100%',
  circle = false,
  className = ''
}) => {
  if (circle) {
    return (
      <div
        className={`bg-gray-200 animate-pulse rounded-full ${className}`}
        style={{ width: height, height }}
      />
    );
  }

  if (lines === 1) {
    return (
      <div
        className={`bg-gray-200 animate-pulse rounded ${className}`}
        style={{ height, width }}
      />
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`bg-gray-200 animate-pulse rounded`}
          style={{
            height,
            width: i === lines - 1 ? '75%' : '100%' // Last line is shorter
          }}
        />
      ))}
    </div>
  );
};

// Loading overlay for containers
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  variant?: LoadingProps['variant'];
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = 'Loading...',
  variant = 'spinner',
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-lg">
          <Loading variant={variant} message={message} />
        </div>
      )}
    </div>
  );
};
