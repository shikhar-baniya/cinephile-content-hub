import { apiClient } from './apiClient';

// ============= TYPE DEFINITIONS =============

export interface SeriesSeason {
  id: string;
  seriesId: string;
  seasonNumber: number;
  seasonName: string;
  episodeCount: number;
  episodesWatched: number;
  status: 'not-started' | 'watching' | 'completed' | 'dropped' | 'want-to-watch';
  watchDate?: string;
  startedDate?: string;
  rating?: number;
  notes?: string;
  tmdbSeasonId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SeriesEpisode {
  id: string;
  seasonId: string;
  episodeNumber: number;
  episodeName: string;
  watched: boolean;
  watchDate?: string;
  rating?: number;
  notes?: string;
  durationMinutes?: number;
  tmdbEpisodeId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SeriesWithSeasons {
  seriesId: string;
  title: string;
  genre: string;
  releaseYear: number;
  platform: string;
  seriesStatus: string;
  poster: string;
  overallRating?: number;
  overallNotes?: string;
  latestSeasonWatched?: number;
  totalSeasonsAvailable?: number;
  tmdbId?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  
  // Aggregated season data
  totalSeasonsTracked: number;
  completedSeasons: number;
  watchingSeasons: number;
  wantToWatchSeasons: number;
  totalEpisodesWatched: number;
  totalEpisodesAvailable: number;
  latestSeasonCompletionDate?: string;
  averageSeasonRating?: number;
}

export interface EpisodeStats {
  seasonId: string;
  seriesTitle: string;
  seasonNumber: number;
  totalEpisodes: number;
  watchedEpisodes: number;
  unwatchedEpisodes: number;
  watchedPercentage: number;
  averageRating?: number;
  firstWatchDate?: string;
  lastWatchDate?: string;
  isCompleted: boolean;
  nextEpisodeToWatch?: number;
}

// ============= SEASON SERVICES =============

export const seasonService = {
  async getSeriesSeasons(seriesId: string): Promise<SeriesSeason[]> {
    try {
      console.log('Fetching seasons for series:', seriesId);
      const response = await fetch(`${apiClient.baseURL}/series/${seriesId}/seasons`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Seasons response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Seasons error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Seasons data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching series seasons:', error);
      throw error;
    }
  },

  async getSeason(seasonId: string): Promise<SeriesSeason> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/seasons/${seasonId}`, {
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
      console.error('Error fetching season:', error);
      throw error;
    }
  },

  async createSeason(seriesId: string, seasonData: Partial<SeriesSeason>): Promise<SeriesSeason> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/${seriesId}/seasons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seasonData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating season:', error);
      throw error;
    }
  },

  async updateSeason(seasonId: string, updates: Partial<SeriesSeason>): Promise<SeriesSeason> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/seasons/${seasonId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating season:', error);
      throw error;
    }
  },

  async deleteSeason(seasonId: string): Promise<void> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/seasons/${seasonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting season:', error);
      throw error;
    }
  },

  async updateSeasonProgress(seasonId: string, progressData: {
    episodesWatched?: number;
    status?: string;
    watchDate?: string;
  }): Promise<SeriesSeason> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/seasons/${seasonId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating season progress:', error);
      throw error;
    }
  },

  async getSeriesOverview(seriesId: string): Promise<SeriesWithSeasons> {
    try {
      console.log('Fetching series overview for:', seriesId);
      const response = await fetch(`${apiClient.baseURL}/series/${seriesId}/overview`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Series overview response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Series overview error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Series overview data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching series overview:', error);
      throw error;
    }
  },
};

// ============= EPISODE SERVICES =============

export const episodeService = {
  async getSeasonEpisodes(seasonId: string): Promise<SeriesEpisode[]> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/seasons/${seasonId}/episodes`, {
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
      console.error('Error fetching season episodes:', error);
      throw error;
    }
  },

  async getEpisode(episodeId: string): Promise<SeriesEpisode> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/episodes/${episodeId}`, {
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
      console.error('Error fetching episode:', error);
      throw error;
    }
  },

  async createEpisode(seasonId: string, episodeData: Partial<SeriesEpisode>): Promise<SeriesEpisode> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/seasons/${seasonId}/episodes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(episodeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating episode:', error);
      throw error;
    }
  },

  async updateEpisode(episodeId: string, updates: Partial<SeriesEpisode>): Promise<SeriesEpisode> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/episodes/${episodeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating episode:', error);
      throw error;
    }
  },

  async deleteEpisode(episodeId: string): Promise<void> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/episodes/${episodeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting episode:', error);
      throw error;
    }
  },

  async toggleEpisodeWatched(episodeId: string, watchedData: {
    watched: boolean;
    watchDate?: string;
    rating?: number;
  }): Promise<SeriesEpisode> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/episodes/${episodeId}/watched`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(watchedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling episode watched status:', error);
      throw error;
    }
  },

  async bulkUpdateEpisodes(seasonId: string, bulkData: {
    episodeNumbers: number[];
    watched: boolean;
    watchDate?: string;
  }): Promise<SeriesEpisode[]> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/seasons/${seasonId}/episodes/bulk`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error bulk updating episodes:', error);
      throw error;
    }
  },

  async markEpisodesWatchedUpTo(seasonId: string, data: {
    episodeNumber: number;
    watchDate?: string;
  }): Promise<SeriesEpisode[]> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/seasons/${seasonId}/episodes/watch-up-to`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking episodes watched up to:', error);
      throw error;
    }
  },

  async getSeasonEpisodeStats(seasonId: string): Promise<EpisodeStats> {
    try {
      const response = await fetch(`${apiClient.baseURL}/series/seasons/${seasonId}/episodes/stats`, {
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
      console.error('Error fetching episode stats:', error);
      throw error;
    }
  },
};

// ============= COMBINED SERIES SERVICE =============

export const seriesService = {
  // Re-export season and episode services
  seasons: seasonService,
  episodes: episodeService,

  // Combined utility functions
  async getCompleteSeriesData(seriesId: string): Promise<{
    overview: SeriesWithSeasons;
    seasons: SeriesSeason[];
    episodesBySeasonId: Record<string, SeriesEpisode[]>;
  }> {
    try {
      const [overview, seasons] = await Promise.all([
        seasonService.getSeriesOverview(seriesId),
        seasonService.getSeriesSeasons(seriesId),
      ]);

      // Fetch episodes for each season
      const episodePromises = seasons.map(season => 
        episodeService.getSeasonEpisodes(season.id)
      );
      const episodesArrays = await Promise.all(episodePromises);

      // Create episodes map by season ID
      const episodesBySeasonId: Record<string, SeriesEpisode[]> = {};
      seasons.forEach((season, index) => {
        episodesBySeasonId[season.id] = episodesArrays[index];
      });

      return {
        overview,
        seasons,
        episodesBySeasonId,
      };
    } catch (error) {
      console.error('Error fetching complete series data:', error);
      throw error;
    }
  },

  async getSeriesProgress(seriesId: string): Promise<{
    totalSeasons: number;
    completedSeasons: number;
    currentSeason?: number;
    totalEpisodes: number;
    watchedEpisodes: number;
    progressPercentage: number;
  }> {
    try {
      const overview = await seasonService.getSeriesOverview(seriesId);
      
      const progressPercentage = overview.totalEpisodesAvailable > 0 
        ? Math.round((overview.totalEpisodesWatched / overview.totalEpisodesAvailable) * 100)
        : 0;

      return {
        totalSeasons: overview.totalSeasonsTracked,
        completedSeasons: overview.completedSeasons,
        currentSeason: overview.latestSeasonWatched || undefined,
        totalEpisodes: overview.totalEpisodesAvailable,
        watchedEpisodes: overview.totalEpisodesWatched,
        progressPercentage,
      };
    } catch (error) {
      console.error('Error fetching series progress:', error);
      throw error;
    }
  },
};
