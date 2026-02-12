// Error handling utilities
import { APP_CONSTANTS } from '../constants';

export interface VoltXError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  stack?: string;
}

export interface ErrorContext {
  user?: string;
  action?: string;
  component?: string;
  url?: string;
  userAgent?: string;
}

/**
 * Enhanced error handling utilities for VoltX application
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: VoltXError[] = [];
  private maxQueueSize = 50;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and log errors with context
   */
  handleError(error: Error | unknown, context?: ErrorContext): VoltXError {
    const voltxError = this.transformError(error, context);
    this.logError(voltxError, context);
    this.queueError(voltxError);
    return voltxError;
  }

  /**
   * Transform any error into VoltXError format
   */
  private transformError(error: Error | unknown, context?: ErrorContext): VoltXError {
    if (error instanceof Error) {
      return {
        code: this.getErrorCode(error),
        message: error.message,
        details: { name: error.name, stack: error.stack },
        timestamp: new Date().toISOString(),
        stack: error.stack
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get error code based on error type and message
   */
  private getErrorCode(error: Error): string {
    // Network errors
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }

    // Authentication errors
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'AUTH_ERROR';
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      return 'VALIDATION_ERROR';
    }

    // API errors
    if (error.message.includes('400') || error.message.includes('Bad Request')) {
      return 'API_ERROR';
    }

    // Server errors
    if (error.message.includes('500') || error.message.includes('Internal Server')) {
      return 'SERVER_ERROR';
    }

    return 'GENERIC_ERROR';
  }

  /**
   * Log error to console and external service
   */
  private logError(error: VoltXError, context?: ErrorContext): void {
    console.error('[VoltX Error]', {
      ...error,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(error, context);
    }
  }

  /**
   * Queue error for batch reporting
   */
  private queueError(error: VoltXError): void {
    this.errorQueue.push(error);

    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Send error to external error tracking service
   */
  private async sendToErrorService(error: VoltXError, context?: ErrorContext): Promise<void> {
    try {
      // Mock implementation - replace with actual service
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error,
          context,
          metadata: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: VoltXError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return APP_CONSTANTS.ERRORS.NETWORK;
      case 'AUTH_ERROR':
        return APP_CONSTANTS.ERRORS.UNAUTHORIZED;
      case 'SERVER_ERROR':
        return APP_CONSTANTS.ERRORS.SERVER_ERROR;
      case 'VALIDATION_ERROR':
        return APP_CONSTANTS.ERRORS.VALIDATION;
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get queued errors for debugging
   */
  getErrorQueue(): VoltXError[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }
}

/**
 * Global error handler for unhandled errors and promise rejections
 */
export const setupGlobalErrorHandling = (): void => {
  const errorHandler = ErrorHandler.getInstance();

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorHandler.handleError(event.error || event.message, {
      component: 'Global',
      action: 'Uncaught Error',
      url: window.location.href
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(event.reason, {
      component: 'Global',
      action: 'Unhandled Promise Rejection',
      url: window.location.href
    });

    // Prevent the default browser behavior
    event.preventDefault();
  });
};

/**
 * Helper functions for common error scenarios
 */
export const errorUtils = {
  /**
   * Handle API errors with proper status codes
   */
  handleApiError: (response: Response, context?: ErrorContext): VoltXError => {
    const error = new Error(`API Error: ${response.status} ${response.statusText}`);
    return ErrorHandler.getInstance().handleError(error, {
      ...context,
      action: 'API Request',
      details: { status: response.status, url: response.url }
    });
  },

  /**
   * Handle validation errors
   */
  handleValidationError: (field: string, message: string, context?: ErrorContext): VoltXError => {
    const error = new ValidationError(`${field}: ${message}`);
    return ErrorHandler.getInstance().handleError(error, {
      ...context,
      action: 'Form Validation'
    });
  },

  /**
   * Handle authentication errors
   */
  handleAuthError: (message: string, context?: ErrorContext): VoltXError => {
    const error = new Error(message);
    error.name = 'AuthError';
    return ErrorHandler.getInstance().handleError(error, {
      ...context,
      action: 'Authentication'
    });
  },

  /**
   * Handle network connectivity errors
   */
  handleNetworkError: (context?: ErrorContext): VoltXError => {
    const error = new Error('Network connection failed');
    error.name = 'NetworkError';
    return ErrorHandler.getInstance().handleError(error, {
      ...context,
      action: 'Network Request'
    });
  }
};

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
