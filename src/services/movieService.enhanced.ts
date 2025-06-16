// Enhanced Movie Service with pagination, caching, and better data management
import { QueryFunctionContext } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/components/MovieCard";

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

    let query = supabase
      .from('movies')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.genre && filters.genre !== 'all') {
      query = query.eq('genre', filters.genre);
    }
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters.platform && filters.platform !== 'all') {
      query = query.eq('platform', filters.platform);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }
    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const transformedData = data?.map(this.transformDatabaseMovie) || [];
    const totalPages = Math.ceil((count || 0) / pageSize);

    const result = {
      data: transformedData,
      count: count || 0,
      page,
      pageSize,
      totalPages,
    };

    // Cache the result
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  }

  // Batch operations for better performance
  async batchUpdateMovies(updates: Array<{ id: string; updates: Partial<Movie> }>): Promise<void> {
    const promises = updates.map(({ id, updates: movieUpdates }) =>
      supabase
        .from('movies')
        .update({
          ...movieUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
    );

    await Promise.all(promises);
    this.invalidateCache();
  }

  async batchDeleteMovies(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('movies')
      .delete()
      .in('id', ids);

    if (error) throw error;
    this.invalidateCache();
  }

  // Analytics with caching
  async getAnalyticsData(timeRange: 'week' | 'month' | 'year' = 'month') {
    const cacheKey = `analytics-${timeRange}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const { data, error } = await supabase
      .from('movies')
      .select('category, status, genre, rating, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const analytics = this.calculateAnalytics(data || [], timeRange);
    
    this.cache.set(cacheKey, {
      data: analytics,
      timestamp: Date.now(),
    });

    return analytics;
  }

  // Genre statistics with caching
  async getGenreStatistics() {
    const cacheKey = 'genre-stats';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const { data, error } = await supabase
      .from('movies')
      .select('genre, status')
      .eq('status', 'watched');

    if (error) throw error;

    const stats = data?.reduce((acc, movie) => {
      acc[movie.genre] = (acc[movie.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    this.cache.set(cacheKey, {
      data: stats,
      timestamp: Date.now(),
    });

    return stats;
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

  private calculateAnalytics(data: any[], timeRange: string) {
    // Implementation for analytics calculation
    // Group by time periods, calculate trends, etc.
    return {
      totalMovies: data.length,
      byCategory: data.reduce((acc, movie) => {
        acc[movie.category] = (acc[movie.category] || 0) + 1;
        return acc;
      }, {}),
      byStatus: data.reduce((acc, movie) => {
        acc[movie.status] = (acc[movie.status] || 0) + 1;
        return acc;
      }, {}),
      averageRating: data.reduce((sum, movie) => sum + movie.rating, 0) / data.length,
      // Add more analytics as needed
    };
  }

  private invalidateCache() {
    this.cache.clear();
  }

  // Real-time subscriptions for live updates
  subscribeToMovieChanges(callback: (payload: any) => void) {
    return supabase
      .channel('movies-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'movies' },
        callback
      )
      .subscribe();
  }
}

export const enhancedMovieService = new EnhancedMovieService();