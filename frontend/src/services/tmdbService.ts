import { apiClient } from './apiClient';

// ============= TYPE DEFINITIONS =============

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  firstAirDate: string;
  lastAirDate: string;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  status: string;
  genres: Array<{ id: number; name: string }>;
  seasons: TMDBSeason[];
}

export interface TMDBSeason {
  id: number;
  name: string;
  seasonNumber: number;
  episodeCount: number;
  airDate: string;
  overview: string;
  posterPath: string;
  episodes?: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episodeNumber: number;
  airDate: string;
  runtime: number;
  stillPath: string;
  voteAverage: number;
}

export interface TMDBSearchResult {
  page: number;
  totalPages: number;
  totalResults: number;
  results: Array<{
    id: number;
    name: string;
    overview: string;
    firstAirDate: string;
    genreIds: number[];
    originCountry: string[];
    originalLanguage: string;
    originalName: string;
    popularity: number;
    posterPath: string;
    backdropPath: string;
    voteAverage: number;
    voteCount: number;
  }>;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

// ============= TMDB API SERVICE =============

export const tmdbService = {
  // Get TV show details from TMDB
  async getTVShowDetails(tmdbId: number): Promise<TMDBTVShow> {
    try {
      const response = await fetch(`${apiClient.baseURL}/api/tmdb/tv/${tmdbId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching TV show details from TMDB:', error);
      throw error;
    }
  },

  // Get season details from TMDB
  async getSeasonDetails(tmdbId: number, seasonNumber: number): Promise<TMDBSeason> {
    try {
      const response = await fetch(`${apiClient.baseURL}/api/tmdb/tv/${tmdbId}/season/${seasonNumber}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching season details from TMDB:', error);
      throw error;
    }
  },

  // Search TV shows on TMDB
  async searchTVShows(query: string): Promise<TMDBSearchResult> {
    try {
      const response = await fetch(`${apiClient.baseURL}/api/tmdb/tv/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching TV shows on TMDB:', error);
      throw error;
    }
  },

  // Get trending TV shows from TMDB
  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResult> {
    try {
      const response = await fetch(`${apiClient.baseURL}/api/tmdb/tv/trending?timeWindow=${timeWindow}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching trending TV shows from TMDB:', error);
      throw error;
    }
  },

  // Get TV genres from TMDB
  async getTVGenres(): Promise<TMDBGenre[]> {
    try {
      const response = await fetch(`${apiClient.baseURL}/api/tmdb/tv/genres`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching TV genres from TMDB:', error);
      throw error;
    }
  },

  // Populate existing series with TMDB data (requires authentication)
  async populateSeriesWithTMDBData(seriesId: string): Promise<{
    message: string;
    seriesId: string;
    showDetails: {
      name: string;
      numberOfSeasons: number;
      numberOfEpisodes: number;
    };
    seasonsCreated: number;
    seasons: Array<{
      id: string;
      seasonNumber: number;
      seasonName: string;
      episodeCount: number;
    }>;
  }> {
    try {
      const response = await fetch(`${apiClient.baseURL}/api/tmdb/series/${seriesId}/populate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error populating series with TMDB data:', error);
      throw error;
    }
  },

  // Create and populate new series from TMDB (requires authentication)
  async autoCreateSeriesFromTMDB(tmdbId: number): Promise<{
    message: string;
    series: {
      id: string;
      title: string;
      tmdbId: number;
      totalSeasons: number;
      totalEpisodes: number;
    };
  }> {
    try {
      const response = await fetch(`${apiClient.baseURL}/api/tmdb/series/auto-create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tmdbId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error auto-creating series from TMDB:', error);
      throw error;
    }
  },

  // Utility function to build poster URL
  buildPosterURL(posterPath: string, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!posterPath) return '';
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  },

  // Utility function to build backdrop URL
  buildBackdropURL(backdropPath: string, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!backdropPath) return '';
    return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
  },

  // Utility function to format release date
  formatAirDate(airDate: string): string {
    if (!airDate) return 'Unknown';
    
    try {
      const date = new Date(airDate);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return airDate;
    }
  },

  // Utility function to get year from date
  getYearFromDate(dateString: string): number | null {
    if (!dateString) return null;
    
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return null;
    }
  },

  // Utility function to format runtime
  formatRuntime(minutes: number): string {
    if (!minutes || minutes <= 0) return 'Unknown';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  },

  // Utility function to get genre names from IDs
  async getGenreNamesFromIds(genreIds: number[]): Promise<string[]> {
    try {
      const genres = await this.getTVGenres();
      const genreMap = new Map(genres.map(g => [g.id, g.name]));
      
      return genreIds
        .map(id => genreMap.get(id))
        .filter(name => name !== undefined) as string[];
    } catch {
      return [];
    }
  },

  // Helper function to check if a show is currently airing
  isCurrentlyAiring(status: string): boolean {
    return status.toLowerCase() === 'returning series' || status.toLowerCase() === 'in production';
  },

  // Helper function to check if a show has ended
  hasEnded(status: string): boolean {
    return status.toLowerCase() === 'ended' || status.toLowerCase() === 'canceled';
  },
};

// ============= ENHANCED SEARCH FUNCTIONALITY =============

export const enhancedTMDBSearch = {
  // Search with filters
  async searchWithFilters(query: string, filters?: {
    year?: number;
    genres?: number[];
    sortBy?: 'popularity.desc' | 'popularity.asc' | 'first_air_date.desc' | 'first_air_date.asc' | 'vote_average.desc';
  }): Promise<TMDBSearchResult> {
    // For now, use basic search - can be enhanced later with more advanced filtering
    return tmdbService.searchTVShows(query);
  },

  // Get recommendations based on a TV show
  async getSimilarShows(tmdbId: number): Promise<TMDBSearchResult> {
    // This would require additional TMDB API endpoints
    // For now, return trending shows as a fallback
    return tmdbService.getTrendingTVShows();
  },

  // Get popular shows by genre
  async getPopularByGenre(genreId: number): Promise<TMDBSearchResult> {
    // This would require additional TMDB API endpoints
    // For now, return trending shows as a fallback
    return tmdbService.getTrendingTVShows();
  },
};

export default tmdbService;
