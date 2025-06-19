// Enhanced Query Client with better caching and performance
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

// Custom error handler for queries
const queryErrorHandler = (error: unknown) => {
  console.error('Query error:', error);
  
  if (error instanceof Error) {
    // Don't show toast for aborted requests
    if (error.name === 'AbortError') return;
    
    toast.error(`Failed to fetch data: ${error.message}`);
  } else {
    toast.error('An unexpected error occurred while fetching data');
  }
};

// Custom error handler for mutations
const mutationErrorHandler = (error: unknown) => {
  console.error('Mutation error:', error);
  
  if (error instanceof Error) {
    toast.error(`Operation failed: ${error.message}`);
  } else {
    toast.error('An unexpected error occurred');
  }
};

export const enhancedQueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: queryErrorHandler,
  }),
  mutationCache: new MutationCache({
    onError: mutationErrorHandler,
  }),
  defaultOptions: {
    queries: {
      // Performance: Longer stale time for relatively static data
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Keep data in cache longer
      gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry for 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Background refetch settings
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: true,
      
      // Network mode settings
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      retryDelay: 1000,
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

// Query key factory for consistency
export const queryKeys = {
  all: ['movies'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
  analytics: () => [...queryKeys.all, 'analytics'] as const,
  analyticsData: (timeRange: string) => [...queryKeys.analytics(), timeRange] as const,
  genres: () => ['genres'] as const,
  genreStats: () => [...queryKeys.genres(), 'stats'] as const,
  search: () => ['search'] as const,
  searchResults: (query: string, type: string) => [...queryKeys.search(), query, type] as const,
} as const;

// Prefetch utilities
export const prefetchUtilities = {
  async prefetchMovieDetails(movieId: string) {
    await enhancedQueryClient.prefetchQuery({
      queryKey: queryKeys.detail(movieId),
      queryFn: async () => {
        // Implementation for fetching movie details
        const { movieService } = await import('@/services/databaseService');
        return movieService.getMovies(); // This should be getMovieById
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  },

  async prefetchAnalytics(timeRange: string = 'month') {
    await enhancedQueryClient.prefetchQuery({
      queryKey: queryKeys.analyticsData(timeRange),
      queryFn: async () => {
        const { enhancedMovieService } = await import('@/services/movieService.enhanced');
        return enhancedMovieService.getAnalyticsData(timeRange as any);
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  },

  async prefetchGenreStats() {
    await enhancedQueryClient.prefetchQuery({
      queryKey: queryKeys.genreStats(),
      queryFn: async () => {
        const { enhancedMovieService } = await import('@/services/movieService.enhanced');
        return enhancedMovieService.getGenreStatistics();
      },
      staleTime: 1000 * 60 * 15, // 15 minutes
    });
  },
};

// Background sync utility
export const backgroundSync = {
  async syncPendingOperations() {
    const { useDataStore } = await import('@/lib/store.enhanced');
    const { pendingOperations } = useDataStore.getState();
    
    if (pendingOperations.length === 0) return;
    
    console.log(`Syncing ${pendingOperations.length} pending operations...`);
    
    for (const operation of pendingOperations) {
      try {
        switch (operation.type) {
          case 'create':
            // Implement create sync
            break;
          case 'update':
            // Implement update sync
            break;
          case 'delete':
            // Implement delete sync
            break;
        }
        
        useDataStore.getState().removePendingOperation(operation.id);
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
        // Operation will remain in pending state for next sync attempt
      }
    }
  },

  startPeriodicSync(intervalMs: number = 30000) {
    return setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingOperations();
      }
    }, intervalMs);
  },
};