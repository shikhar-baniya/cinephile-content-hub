// Enhanced error handling with recovery mechanisms
import { toast } from 'sonner';
import { ApiError } from './api-client';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
  OFFLINE = 'OFFLINE',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: any;
  timestamp: number;
  stack?: string;
  recoverable: boolean;
  userMessage: string;
}

class ErrorLogger {
  private static errors: AppError[] = [];
  private static maxErrors = 100;

  static log(error: AppError) {
    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(error);
    } else {
      console.error('Logged error:', error);
    }
  }

  static getRecentErrors(count = 10): AppError[] {
    return this.errors.slice(0, count);
  }

  static clearErrors() {
    this.errors = [];
  }

  private static async sendToErrorService(error: AppError) {
    try {
      // Replace with your error tracking service (Sentry, LogRocket, etc.)
      console.log('Would send to error service:', error);
    } catch (e) {
      console.error('Failed to send error to tracking service:', e);
    }
  }
}

class RecoveryManager {
  private static retryCount = new Map<string, number>();
  private static maxRetries = 3;

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    maxRetries = this.maxRetries
  ): Promise<T> {
    const currentRetries = this.retryCount.get(operationId) || 0;

    try {
      const result = await operation();
      this.retryCount.delete(operationId); // Clear on success
      return result;
    } catch (error) {
      if (currentRetries < maxRetries) {
        this.retryCount.set(operationId, currentRetries + 1);
        
        // Exponential backoff
        const delay = Math.min(1000 * 2 ** currentRetries, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.executeWithRetry(operation, operationId, maxRetries);
      } else {
        this.retryCount.delete(operationId);
        throw error;
      }
    }
  }

  static async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    circuitId: string,
    threshold = 5,
    timeout = 60000
  ): Promise<T> {
    // Simple circuit breaker implementation
    const circuitState = this.getCircuitState(circuitId);
    
    if (circuitState.isOpen && Date.now() - circuitState.lastFailure < timeout) {
      throw new Error(`Circuit breaker is open for ${circuitId}`);
    }

    try {
      const result = await operation();
      this.resetCircuit(circuitId);
      return result;
    } catch (error) {
      this.recordFailure(circuitId, threshold);
      throw error;
    }
  }

  private static circuits = new Map<string, {
    failures: number;
    lastFailure: number;
    isOpen: boolean;
  }>();

  private static getCircuitState(circuitId: string) {
    return this.circuits.get(circuitId) || {
      failures: 0,
      lastFailure: 0,
      isOpen: false,
    };
  }

  private static recordFailure(circuitId: string, threshold: number) {
    const state = this.getCircuitState(circuitId);
    state.failures++;
    state.lastFailure = Date.now();
    state.isOpen = state.failures >= threshold;
    this.circuits.set(circuitId, state);
  }

  private static resetCircuit(circuitId: string) {
    this.circuits.set(circuitId, {
      failures: 0,
      lastFailure: 0,
      isOpen: false,
    });
  }
}

export class EnhancedErrorHandler {
  static handle(error: unknown, context?: string): AppError {
    const appError = this.createAppError(error, context);
    
    // Log the error
    ErrorLogger.log(appError);
    
    // Show user notification
    this.showUserNotification(appError);
    
    // Attempt recovery if possible
    if (appError.recoverable) {
      this.attemptRecovery(appError);
    }
    
    return appError;
  }

  private static createAppError(error: unknown, context?: string): AppError {
    const timestamp = Date.now();
    
    if (error instanceof ApiError) {
      return this.createApiError(error, timestamp, context);
    }
    
    if (error instanceof Error) {
      return this.createGenericError(error, timestamp, context);
    }
    
    return {
      type: ErrorType.UNKNOWN,
      message: 'An unknown error occurred',
      timestamp,
      recoverable: false,
      userMessage: 'Something went wrong. Please try again.',
      details: error,
    };
  }

  private static createApiError(error: ApiError, timestamp: number, context?: string): AppError {
    const { type, userMessage, recoverable } = this.categorizeApiError(error.status);
    
    return {
      type,
      message: error.message,
      code: error.status,
      timestamp,
      recoverable,
      userMessage,
      details: { context, status: error.status },
    };
  }

  private static createGenericError(error: Error, timestamp: number, context?: string): AppError {
    let type = ErrorType.UNKNOWN;
    let recoverable = false;
    let userMessage = 'An unexpected error occurred. Please try again.';

    // Network errors
    if (error.message.includes('fetch') || error.name === 'NetworkError') {
      type = ErrorType.NETWORK;
      recoverable = true;
      userMessage = 'Network error. Please check your connection and try again.';
    }
    
    // Offline detection
    if (!navigator.onLine) {
      type = ErrorType.OFFLINE;
      recoverable = true;
      userMessage = 'You appear to be offline. Please check your connection.';
    }

    return {
      type,
      message: error.message,
      timestamp,
      recoverable,
      userMessage,
      stack: error.stack,
      details: { context, name: error.name },
    };
  }

  private static categorizeApiError(status?: number): {
    type: ErrorType;
    userMessage: string;
    recoverable: boolean;
  } {
    switch (status) {
      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          userMessage: 'Please log in again to continue.',
          recoverable: true,
        };
      case 403:
        return {
          type: ErrorType.PERMISSION,
          userMessage: 'You do not have permission to perform this action.',
          recoverable: false,
        };
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          userMessage: 'The requested resource was not found.',
          recoverable: false,
        };
      case 429:
        return {
          type: ErrorType.RATE_LIMIT,
          userMessage: 'Too many requests. Please wait a moment and try again.',
          recoverable: true,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER,
          userMessage: 'Server error. Please try again later.',
          recoverable: true,
        };
      default:
        return {
          type: ErrorType.UNKNOWN,
          userMessage: 'An unexpected error occurred. Please try again.',
          recoverable: true,
        };
    }
  }

  private static showUserNotification(error: AppError) {
    const toastOptions = {
      duration: error.type === ErrorType.NETWORK ? 10000 : 5000,
      action: error.recoverable ? {
        label: 'Retry',
        onClick: () => this.attemptRecovery(error),
      } : undefined,
    };

    switch (error.type) {
      case ErrorType.NETWORK:
      case ErrorType.OFFLINE:
        toast.error(error.userMessage, {
          ...toastOptions,
          description: 'Your changes will be saved when connection is restored.',
        });
        break;
      case ErrorType.AUTHENTICATION:
        toast.error(error.userMessage, {
          ...toastOptions,
          action: {
            label: 'Log In',
            onClick: () => this.redirectToLogin(),
          },
        });
        break;
      case ErrorType.RATE_LIMIT:
        toast.warning(error.userMessage, toastOptions);
        break;
      default:
        toast.error(error.userMessage, toastOptions);
    }
  }

  private static attemptRecovery(error: AppError) {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        this.redirectToLogin();
        break;
      case ErrorType.NETWORK:
      case ErrorType.OFFLINE:
        this.enableOfflineMode();
        break;
      case ErrorType.RATE_LIMIT:
        // Implement exponential backoff retry
        setTimeout(() => {
          toast.info('You can try again now.');
        }, 60000);
        break;
    }
  }

  private static redirectToLogin() {
    // Implementation depends on your auth setup
    window.location.href = '/login';
  }

  private static enableOfflineMode() {
    // Enable offline mode in store
    import('@/lib/store.enhanced').then(({ useDataStore }) => {
      useDataStore.getState().setOfflineStatus(true);
    });
  }

  // Public methods for components
  static withErrorHandling<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ) {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error, context);
        throw error; // Re-throw for component-level handling
      }
    };
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    maxRetries = 3
  ): Promise<T> {
    return RecoveryManager.executeWithRetry(operation, operationId, maxRetries);
  }

  static async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    circuitId: string
  ): Promise<T> {
    return RecoveryManager.executeWithCircuitBreaker(operation, circuitId);
  }

  static getErrorHistory(): AppError[] {
    return ErrorLogger.getRecentErrors();
  }

  static clearErrorHistory() {
    ErrorLogger.clearErrors();
  }
}