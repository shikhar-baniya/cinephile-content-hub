import { config } from "@/config/env";

export interface EpisodeAnalyticsData {
  date: string;
  episodes: number;
  seasons: number;
  series: number;
  totalWatchTime: number;
}

export interface SeasonAnalyticsData {
  date: string;
  seasonsCompleted: number;
  seriesCompleted: number;
  averageCompletionRate: number;
}

export const episodeAnalyticsService = {
  async getEpisodeWatchData(startDate: Date, endDate: Date): Promise<EpisodeAnalyticsData[]> {
    try {
      const response = await fetch(`${config.api.baseUrl}/analytics/episodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch episode analytics');
      }

      const data = await response.json();
      return data.map((item: any) => ({
        date: item.date,
        episodes: item.episodes || 0,
        seasons: item.seasons || 0,
        series: item.series || 0,
        totalWatchTime: item.totalWatchTime || 0
      }));
    } catch (error) {
      console.error('Error fetching episode analytics:', error);
      throw error;
    }
  },

  async getSeasonCompletionData(startDate: Date, endDate: Date): Promise<SeasonAnalyticsData[]> {
    try {
      const response = await fetch(`${config.api.baseUrl}/analytics/seasons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch season analytics');
      }

      const data = await response.json();
      return data.map((item: any) => ({
        date: item.date,
        seasonsCompleted: item.seasonsCompleted || 0,
        seriesCompleted: item.seriesCompleted || 0,
        averageCompletionRate: item.averageCompletionRate || 0
      }));
    } catch (error) {
      console.error('Error fetching season analytics:', error);
      throw error;
    }
  }
};