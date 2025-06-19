// Enhanced Movie Service with pagination, caching, and better data management
import { QueryFunctionContext } from '@tanstack/react-query';
import { Movie } from "@/components/MovieCard";
import { config } from "@/config/env";

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MovieFilters {
  status?: string;
  genre?: string;
  category?: string;
  platform?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

class EnhancedMovieService {
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Paginated movie fetching with filters
  async getMoviesPaginated(
    page = 1,
    pageSize = 20,
    filters: MovieFilters = {}
  ): Promise<PaginatedResponse<Movie>> {
    const cacheKey = `movies-${page}-${pageSize}-${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...filters,
      });

      const response = await fetch(`${config.api.baseUrl}/movies/paginated?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch paginated movies');
      }

      const result = await response.json();
      
      const transformedResult = {
        ...result,
        data: result.data.map(this.transformDatabaseMovie),
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: transformedResult,
        timestamp: Date.now(),
      });

      return transformedResult;
    } catch (error) {
      console.error('Error fetching paginated movies:', error);
      throw error;
    }
  }

  // Batch operations for better performance
  async batchUpdateMovies(updates: Array<{ id: string; updates: Partial<Movie> }>): Promise<void> {
    try {
      const response = await fetch(`${config.api.baseUrl}/movies/batch-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to batch update movies');
      }

      this.invalidateCache();
    } catch (error) {
      console.error('Error batch updating movies:', error);
      throw error;
    }
  }

  async batchDeleteMovies(ids: string[]): Promise<void> {
    try {
      const response = await fetch(`${config.api.baseUrl}/movies/batch-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error('Failed to batch delete movies');
      }

      this.invalidateCache();
    } catch (error) {
      console.error('Error batch deleting movies:', error);
      throw error;
    }
  }

  // Analytics with caching
  async getAnalyticsData(timeRange: 'week' | 'month' | 'year' = 'month') {
    const cacheKey = `analytics-${timeRange}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await fetch(`${config.api.baseUrl}/movies/analytics?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const analytics = await response.json();
      
      this.cache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now(),
      });

      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Genre statistics with caching
  async getGenreStatistics() {
    const cacheKey = 'genre-stats';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await fetch(`${config.api.baseUrl}/movies/genre-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch genre statistics');
      }

      const stats = await response.json();

      this.cache.set(cacheKey, {
        data: stats,
        timestamp: Date.now(),
      });

      return stats;
    } catch (error) {
      console.error('Error fetching genre statistics:', error);
      throw error;
    }
  }

  private transformDatabaseMovie(dbMovie: any): Movie {
    return {
      id: dbMovie.id,
      title: dbMovie.title,
      genre: dbMovie.genre,
      category: dbMovie.category,
      releaseYear: dbMovie.release_year,
      platform: dbMovie.platform,
      rating: dbMovie.rating,
      status: dbMovie.status,
      poster: dbMovie.poster,
      notes: dbMovie.notes,
      createdAt: dbMovie.created_at,
      updatedAt: dbMovie.updated_at,
    };
  }

  private invalidateCache() {
    this.cache.clear();
  }

  // WebSocket connection for real-time updates (if backend supports it)
  subscribeToMovieChanges(callback: (payload: any) => void) {
    // This would need to be implemented with WebSocket or Server-Sent Events
    // depending on your backend implementation
    console.log('Real-time subscriptions would be implemented here');
    
    // Return a cleanup function
    return () => {
      console.log('Unsubscribing from movie changes');
    };
  }
}

export const enhancedMovieService = new EnhancedMovieService();