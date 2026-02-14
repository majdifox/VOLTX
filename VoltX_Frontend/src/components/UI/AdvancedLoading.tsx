import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Advanced shimmer effect component
interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
  animate = true
}) => {
  const shimmerClasses = `
    ${animate ? 'animate-pulse' : ''}
    ${rounded ? 'rounded-full' : 'rounded'}
    bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
    ${animate ? 'bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return <div className={shimmerClasses} style={style} />;
};

// Table loading skeleton
interface TableLoadingProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export const TableLoading: React.FC<TableLoadingProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = ''
}) => {
  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <table className="w-full">
        {showHeader && (
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <Shimmer height="1rem" width={`${60 + Math.random() * 30}%`} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Shimmer
                    height="0.875rem"
                    width={`${40 + Math.random() * 50}%`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Chat loading component
export const ChatLoading: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <Shimmer width={40} height={40} rounded className="flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer height="1rem" width="60%" />
        <Shimmer height="1rem" width="45%" />
        <Shimmer height="1rem" width="80%" />
      </div>
    </div>
  );
};

// Form loading component
interface FormLoadingProps {
  fields?: number;
  showSubmit?: boolean;
  className?: string;
}

export const FormLoading: React.FC<FormLoadingProps> = ({
  fields = 4,
  showSubmit = true,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Shimmer height="1rem" width="25%" />
          <Shimmer height="2.5rem" width="100%" />
        </div>
      ))}
      {showSubmit && (
        <div className="pt-4">
          <Shimmer height="2.5rem" width="8rem" />
        </div>
      )}
    </div>
  );
};

// Grid loading component
interface GridLoadingProps {
  items?: number;
  columns?: number;
  aspectRatio?: 'square' | 'wide' | 'tall';
  showText?: boolean;
  className?: string;
}

export const GridLoading: React.FC<GridLoadingProps> = ({
  items = 6,
  columns = 3,
  aspectRatio = 'square',
  showText = true,
  className = ''
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    wide: 'aspect-[16/9]',
    tall: 'aspect-[3/4]'
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns as keyof typeof gridCols] || 'grid-cols-3'} ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Shimmer className={aspectClasses[aspectRatio]} />
          {showText && (
            <div className="space-y-2">
              <Shimmer height="1rem" width="80%" />
              <Shimmer height="0.875rem" width="60%" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Progressive loading component for images
interface ImageLoadingProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export const ImageLoading: React.FC<ImageLoadingProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  onLoad,
  onError
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  const defaultPlaceholder = (
    <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 text-gray-400">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="w-8 h-8 mx-auto mb-2">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <span className="text-xs">Failed to load</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (placeholder || defaultPlaceholder)}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'absolute inset-0 opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

// Typing indicator for real-time features
export const TypingIndicator: React.FC<{
  users?: string[];
  className?: string;
}> = ({ users = [], className = '' }) => {
  if (users.length === 0) return null;

  const displayText =
    users.length === 1
      ? `${users[0]} is typing...`
      : users.length === 2
      ? `${users[0]} and ${users[1]} are typing...`
      : `${users[0]} and ${users.length - 1} others are typing...`;

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
      <span>{displayText}</span>
    </div>
  );
};

// Smart loading component that adapts based on content type
interface SmartLoadingProps {
  type: 'page' | 'table' | 'grid' | 'form' | 'chat' | 'card' | 'list';
  config?: {
    rows?: number;
    columns?: number;
    items?: number;
    fields?: number;
    aspectRatio?: 'square' | 'wide' | 'tall';
  };
  className?: string;
}

export const SmartLoading: React.FC<SmartLoadingProps> = ({
  type,
  config = {},
  className = ''
}) => {
  switch (type) {
    case 'table':
      return (
        <TableLoading
          rows={config.rows}
          columns={config.columns}
          className={className}
        />
      );
    case 'grid':
      return (
        <GridLoading
          items={config.items}
          columns={config.columns}
          aspectRatio={config.aspectRatio}
          className={className}
        />
      );
    case 'form':
      return <FormLoading fields={config.fields} className={className} />;
    case 'chat':
      return (
        <div className={`space-y-4 ${className}`}>
          {Array.from({ length: 3 }).map((_, index) => (
            <ChatLoading key={index} />
          ))}
        </div>
      );
    case 'list':
      return (
        <div className={`space-y-3 ${className}`}>
          {Array.from({ length: config.items || 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Shimmer width={48} height={48} rounded />
              <div className="flex-1 space-y-2">
                <Shimmer height="1rem" width="70%" />
                <Shimmer height="0.875rem" width="40%" />
              </div>
            </div>
          ))}
        </div>
      );
    case 'card':
      return (
        <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
          <div className="space-y-4">
            <Shimmer height="1.5rem" width="60%" />
            <Shimmer height="8rem" width="100%" />
            <div className="space-y-2">
              <Shimmer height="1rem" width="100%" />
              <Shimmer height="1rem" width="80%" />
              <Shimmer height="1rem" width="60%" />
            </div>
          </div>
        </div>
      );
    case 'page':
    default:
      return (
        <div className={`space-y-6 ${className}`}>
          <Shimmer height="2rem" width="40%" />
          <Shimmer height="1rem" width="80%" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <SmartLoading key={index} type="card" />
            ))}
          </div>
        </div>
      );
  }
};

// Loading state manager hook
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingText, setLoadingText] = useState<string>();

  const startLoading = (text?: string) => {
    setIsLoading(true);
    setLoadingText(text);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingText(undefined);
  };

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    setLoadingText
  };
}