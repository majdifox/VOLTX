import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray' | 'inherit';
  className?: string;
  overlay?: boolean;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  overlay = false,
  text
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Color classes
  const colorClasses = {
    primary: 'text-primary',
    white: 'text-white',
    gray: 'text-gray-500',
    inherit: ''
  };

  const spinnerClasses = `
    animate-spin rounded-full border-2 border-current border-t-transparent
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const spinner = <div className={spinnerClasses} />;

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
          <div className="flex flex-col items-center space-y-3">
            {spinner}
            {text && (
              <p className="text-gray-600 dark:text-gray-300 text-sm">{text}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center space-x-3">
        {spinner}
        <span className="text-gray-600 dark:text-gray-300">{text}</span>
      </div>
    );
  }

  return spinner;
};

// Page Loading Component
interface PageLoadingProps {
  text?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Loading...'
}) => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">{text}</p>
      </div>
    </div>
  );
};

// Button Loading Component
interface ButtonLoadingProps {
  size?: 'xs' | 'sm' | 'md';
  color?: 'primary' | 'white' | 'inherit';
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  size = 'sm',
  color = 'white'
}) => {
  return <LoadingSpinner size={size} color={color} />;
};

// Skeleton Loading Components
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
};

// Progress Loading Component
interface ProgressLoadingProps {
  progress: number; // 0-100
  text?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  progress,
  text,
  showPercentage = true,
  className = ''
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {(text || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {text && (
            <span className="text-sm text-gray-600 dark:text-gray-300">{text}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

// Pulse Loading Component
export const PulseLoading: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  return (
    <div className={`flex space-x-1 justify-center items-center ${className}`}>
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
    </div>
  );
};
