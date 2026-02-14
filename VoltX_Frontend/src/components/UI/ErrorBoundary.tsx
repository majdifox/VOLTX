import React, { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;
  private prevResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
    this.prevResetKeys = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Report to error monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && this.hasResetKeysChanged(prevProps.resetKeys, resetKeys)) {
        this.resetError();
      }
    }

    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetError();
    }
  }

  hasResetKeysChanged(
    prevResetKeys: Array<string | number> = [],
    nextResetKeys: Array<string | number> = []
  ): boolean {
    return (
      prevResetKeys.length !== nextResetKeys.length ||
      prevResetKeys.some((item, idx) => nextResetKeys[idx] !== item)
    );
  }

  resetError = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      });
    }, 100);
  };

  reportErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Mock error reporting - replace with actual service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorId: this.state.errorId
    };

    // Send to error monitoring service
    console.log('Error reported to monitoring service:', errorData);
  }

  render() {
    const { hasError, error, errorInfo, errorId } = this.state;
    const { children, fallback: Fallback, isolate } = this.props;

    if (hasError) {
      if (Fallback) {
        return (
          <Fallback
            error={error}
            errorInfo={errorInfo}
            resetError={this.resetError}
            errorId={errorId}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
          errorId={errorId}
          isolate={isolate}
        />
      );
    }

    return children;
  }
}

// Default Error Fallback Component
interface DefaultErrorFallbackProps extends ErrorFallbackProps {
  isolate?: boolean;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  errorId,
  isolate = false
}) => {
  const containerClasses = isolate
    ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6'
    : 'min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4';

  const contentClasses = isolate
    ? 'text-center'
    : 'max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8';

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
          Oops! Something went wrong
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {isolate
            ? "This component encountered an error and couldn't be displayed."
            : "We're sorry, but something unexpected happened. Please try again."
          }
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Error Details (Development)
            </summary>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 text-xs font-mono overflow-auto max-h-32">
              <p className="text-red-600 dark:text-red-400 mb-2">
                <strong>Error:</strong> {error.message}
              </p>
              {error.stack && (
                <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={resetError}
            variant="primary"
            className="flex-1"
            size="md"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          {!isolate && (
            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
              className="flex-1"
              size="md"
            >
              Refresh Page
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Error ID: {errorId}
        </p>
      </div>
    </div>
  );
};

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends {}>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for error boundary functionality
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

// Async Error Boundary for handling async operations
export const AsyncErrorBoundary: React.FC<Props> = ({ children, ...props }) => {
  return <ErrorBoundary {...props}>{children}</ErrorBoundary>;
};