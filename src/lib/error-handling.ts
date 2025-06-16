import { toast } from 'sonner';
import { ApiError } from './api-client';

export class ErrorHandler {
  static handle(error: unknown): void {
    if (error instanceof ApiError) {
      this.handleApiError(error);
    } else if (error instanceof Error) {
      this.handleGenericError(error);
    } else {
      this.handleUnknownError(error);
    }
  }

  private static handleApiError(error: ApiError): void {
    switch (error.status) {
      case 401:
        toast.error('Authentication failed. Please log in again.');
        // Handle authentication error (e.g., redirect to login)
        break;
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('The requested resource was not found.');
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('An internal server error occurred. Please try again later.');
        break;
      default:
        toast.error(`An error occurred: ${error.message}`);
    }
  }

  private static handleGenericError(error: Error): void {
    toast.error(error.message);
  }

  private static handleUnknownError(error: unknown): void {
    toast.error('An unexpected error occurred. Please try again later.');
    console.error('Unknown error:', error);
  }
} 