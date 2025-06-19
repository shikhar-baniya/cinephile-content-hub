import { config } from '@/config/env';
import { QueryClient } from '@tanstack/react-query';

// Rate limiting configuration
const RATE_LIMIT = 40; // requests per 10 seconds
const RATE_LIMIT_WINDOW = 10000; // 10 seconds in milliseconds

class RateLimiter {
  private timestamps: number[] = [];

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(time => now - time < RATE_LIMIT_WINDOW);
    
    if (this.timestamps.length >= RATE_LIMIT) {
      const oldestTimestamp = this.timestamps[0];
      const waitTime = RATE_LIMIT_WINDOW - (now - oldestTimestamp);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.timestamps.push(now);
  }
}

const rateLimiter = new RateLimiter();

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = {
  async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await rateLimiter.waitForSlot();

    const url = `${config.tmdb.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${config.tmdb.apiKey}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    return response.json();
  }
};

// Create a QueryClient instance with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
}); 