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
      // Get the current session token from localStorage (Supabase stores it there)
      const sessionData = localStorage.getItem('supabase.auth.token');
      let accessToken = null;

      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          accessToken = session?.currentSession?.access_token || session?.access_token;
        } catch (e) {
          console.warn('Could not parse session data');
        }
      }

      if (!accessToken) {
        throw new Error('No authentication token available. Please sign in first.');
      }

      const response = await fetch(`${config.api.baseUrl}/analytics/episodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch episode analytics: ${response.status}`);
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
      // Get the current session token from localStorage (Supabase stores it there)
      const sessionData = localStorage.getItem('supabase.auth.token');
      let accessToken = null;

      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          accessToken = session?.currentSession?.access_token || session?.access_token;
        } catch (e) {
          console.warn('Could not parse session data');
        }
      }

      if (!accessToken) {
        throw new Error('No authentication token available. Please sign in first.');
      }

      const response = await fetch(`${config.api.baseUrl}/analytics/seasons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch season analytics: ${response.status}`);
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