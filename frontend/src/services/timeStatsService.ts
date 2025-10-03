import { seriesService, SeriesSeason, SeriesEpisode } from './seriesService';
import { Movie } from '@/components/MovieCard';

// ============= TYPE DEFINITIONS =============

export interface WatchTimeStats {
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  movieMinutes: number;
  seriesMinutes: number;
  movieCount: number;
  episodeCount: number;
  weeklyAverage: number;
  monthlyAverage: number;
  dailyAverage: number;
  breakdown: {
    movies: { hours: number; minutes: number; percentage: number };
    series: { hours: number; minutes: number; percentage: number };
  };
}

export interface BingeSession {
  date: string;
  episodeCount: number;
  totalMinutes: number;
  seriesTitle: string;
  seasonNumber: number;
  episodes: SeriesEpisode[];
}

export interface BingeStats {
  longestBinge: BingeSession | null;
  topBingeDays: BingeSession[];
  bingeScore: number;
  bingeLevel: string;
  averageEpisodesPerSession: number;
  last30DaysEpisodes: number;
  last30DaysAverage: number;
  trendPercentage: number;
}

export interface SeriesForecast {
  seriesId: string;
  seriesTitle: string;
  seasonNumber: number;
  seasonName: string;
  totalEpisodes: number;
  watchedEpisodes: number;
  remainingEpisodes: number;
  progressPercentage: number;
  episodesPerWeek: number;
  weeksRemaining: number;
  estimatedFinishDate: string;
  remainingMinutes: number;
  status: string;
}

export interface CompletionForecastStats {
  currentlyWatching: SeriesForecast[];
  totalSeriesWatching: number;
  totalWeeksToFinishAll: number;
  totalRemainingMinutes: number;
  fastestToFinish: SeriesForecast | null;
}

// ============= HELPER FUNCTIONS =============

function formatMinutesToHoursMinutes(totalMinutes: number): { hours: number; minutes: number } {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return { hours, minutes };
}

function getWeeksBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays / 7;
}

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

// ============= WATCH TIME CALCULATION =============

export async function calculateWatchTime(
  movies: Movie[], 
  timeframe: 'thisYear' | 'allTime' | 'last30Days' = 'thisYear'
): Promise<WatchTimeStats> {
  // Filter movies based on timeframe
  const now = new Date();
  const currentYear = now.getFullYear();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let filteredMovies = movies.filter(m => m.status === 'watched');
  console.log('📊 [WatchTime] Total watched movies:', filteredMovies.length);
  
  if (timeframe === 'thisYear') {
    // Filter by watch date year, not release year
    filteredMovies = filteredMovies.filter(m => {
      if (!m.watchDate) return false;
      const watchYear = new Date(m.watchDate).getFullYear();
      return watchYear === currentYear;
    });
    console.log('📊 [WatchTime] Movies this year:', filteredMovies.length);
  } else if (timeframe === 'last30Days') {
    filteredMovies = filteredMovies.filter(m => {
      if (!m.watchDate) return false;
      return new Date(m.watchDate) >= thirtyDaysAgo;
    });
    console.log('📊 [WatchTime] Movies last 30 days:', filteredMovies.length);
  } else {
    console.log('📊 [WatchTime] All time movies:', filteredMovies.length);
  }

  // Calculate movie watch time (assume average 120 min if no runtime)
  const movieMinutes = filteredMovies.reduce((total, m) => {
    return total + (m.runtime || 120);
  }, 0);

  // Get all episodes across all series
  let allEpisodes: SeriesEpisode[] = [];
  try {
    const allSeasons = await seriesService.seasons.getAllSeasons();
    console.log('📊 [WatchTime] Found seasons:', allSeasons.length);
    
    const episodePromises = allSeasons.map(season => 
      seriesService.episodes.getSeasonEpisodes(season.id)
    );
    const episodeArrays = await Promise.all(episodePromises);
    allEpisodes = episodeArrays.flat();
    console.log('📊 [WatchTime] Total episodes:', allEpisodes.length);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    // Continue with empty episodes array
  }

  // Filter episodes based on timeframe
  let watchedEpisodes = allEpisodes.filter(e => e.watched && e.watchDate);
  
  if (timeframe === 'thisYear') {
    watchedEpisodes = watchedEpisodes.filter(e => {
      const watchDate = new Date(e.watchDate!);
      return watchDate.getFullYear() === currentYear;
    });
  } else if (timeframe === 'last30Days') {
    watchedEpisodes = watchedEpisodes.filter(e => {
      const watchDate = new Date(e.watchDate!);
      return watchDate >= thirtyDaysAgo;
    });
  }

  // Calculate series watch time (assume average 45 min if no duration)
  const seriesMinutes = watchedEpisodes.reduce((total, e) => {
    return total + (e.durationMinutes || 45);
  }, 0);

  const totalMinutes = movieMinutes + seriesMinutes;
  const totalHours = totalMinutes / 60;
  const totalDays = totalHours / 24;

  // Calculate averages
  const daysInPeriod = timeframe === 'last30Days' ? 30 : 
                       timeframe === 'thisYear' ? Math.floor((now.getTime() - new Date(currentYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24)) :
                       365;
  
  const dailyAverage = totalMinutes / daysInPeriod;
  const weeklyAverage = dailyAverage * 7;
  const monthlyAverage = dailyAverage * 30;

  // Calculate breakdown
  const moviePercentage = totalMinutes > 0 ? (movieMinutes / totalMinutes) * 100 : 0;
  const seriesPercentage = totalMinutes > 0 ? (seriesMinutes / totalMinutes) * 100 : 0;

  return {
    totalMinutes,
    totalHours,
    totalDays,
    movieMinutes,
    seriesMinutes,
    movieCount: filteredMovies.length,
    episodeCount: watchedEpisodes.length,
    weeklyAverage,
    monthlyAverage,
    dailyAverage,
    breakdown: {
      movies: {
        ...formatMinutesToHoursMinutes(movieMinutes),
        percentage: Math.round(moviePercentage)
      },
      series: {
        ...formatMinutesToHoursMinutes(seriesMinutes),
        percentage: Math.round(seriesPercentage)
      }
    }
  };
}

// ============= BINGE STATS CALCULATION =============

export async function calculateBingeStats(): Promise<BingeStats> {
  // Get all episodes
  const allSeasons = await seriesService.seasons.getAllSeasons();
  const episodePromises = allSeasons.map(season => 
    seriesService.episodes.getSeasonEpisodes(season.id)
  );
  const episodeArrays = await Promise.all(episodePromises);
  const allEpisodes = episodeArrays.flat();

  // Filter watched episodes with dates
  const watchedEpisodes = allEpisodes.filter(e => e.watched && e.watchDate);

  if (watchedEpisodes.length === 0) {
    return {
      longestBinge: null,
      topBingeDays: [],
      bingeScore: 0,
      bingeLevel: 'New Watcher',
      averageEpisodesPerSession: 0,
      last30DaysEpisodes: 0,
      last30DaysAverage: 0,
      trendPercentage: 0
    };
  }

  // Group episodes by date
  const episodesByDate: Record<string, SeriesEpisode[]> = {};
  watchedEpisodes.forEach(ep => {
    const dateKey = ep.watchDate!;
    if (!episodesByDate[dateKey]) {
      episodesByDate[dateKey] = [];
    }
    episodesByDate[dateKey].push(ep);
  });

  // Create binge sessions
  const bingeSessions: BingeSession[] = Object.entries(episodesByDate).map(([date, episodes]) => {
    const totalMinutes = episodes.reduce((sum, e) => sum + (e.durationMinutes || 45), 0);
    // Assume all episodes from same day are from same series for simplicity
    // In reality, you'd need to fetch series info
    return {
      date,
      episodeCount: episodes.length,
      totalMinutes,
      seriesTitle: 'Series', // We'll need to fetch this
      seasonNumber: 1, // We'll need to fetch this
      episodes
    };
  });

  // Sort by episode count to get top binges
  const sortedBinges = [...bingeSessions].sort((a, b) => b.episodeCount - a.episodeCount);
  const longestBinge = sortedBinges[0] || null;
  const topBingeDays = sortedBinges.slice(0, 5);

  // Calculate binge score (average episodes per day when watching)
  const uniqueWatchDays = Object.keys(episodesByDate).length;
  const averageEpisodesPerSession = watchedEpisodes.length / uniqueWatchDays;
  const bingeScore = Math.min(10, averageEpisodesPerSession * 1.4); // Scale to 0-10

  // Determine binge level
  let bingeLevel = 'Casual Viewer';
  if (bingeScore >= 8) bingeLevel = 'Power Binger';
  else if (bingeScore >= 6) bingeLevel = 'Dedicated Watcher';
  else if (bingeScore >= 4) bingeLevel = 'Regular Viewer';

  // Last 30 days stats
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const last30DaysEpisodes = watchedEpisodes.filter(e => {
    return new Date(e.watchDate!) >= thirtyDaysAgo;
  }).length;
  const last30DaysAverage = last30DaysEpisodes / 30;

  // Previous 30 days for trend
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const previous30DaysEpisodes = watchedEpisodes.filter(e => {
    const watchDate = new Date(e.watchDate!);
    return watchDate >= sixtyDaysAgo && watchDate < thirtyDaysAgo;
  }).length;

  const trendPercentage = previous30DaysEpisodes > 0
    ? Math.round(((last30DaysEpisodes - previous30DaysEpisodes) / previous30DaysEpisodes) * 100)
    : 0;

  return {
    longestBinge,
    topBingeDays,
    bingeScore: Math.round(bingeScore * 10) / 10,
    bingeLevel,
    averageEpisodesPerSession: Math.round(averageEpisodesPerSession * 10) / 10,
    last30DaysEpisodes,
    last30DaysAverage: Math.round(last30DaysAverage * 10) / 10,
    trendPercentage
  };
}

// ============= COMPLETION FORECAST CALCULATION =============

export async function calculateCompletionForecast(movies: Movie[]): Promise<CompletionForecastStats> {
  // Get all seasons that are currently being watched
  const allSeasons = await seriesService.seasons.getAllSeasons();
  const watchingSeasons = allSeasons.filter(s => s.status === 'watching');

  if (watchingSeasons.length === 0) {
    return {
      currentlyWatching: [],
      totalSeriesWatching: 0,
      totalWeeksToFinishAll: 0,
      totalRemainingMinutes: 0,
      fastestToFinish: null
    };
  }

  const forecasts: SeriesForecast[] = [];

  for (const season of watchingSeasons) {
    try {
      const episodes = await seriesService.episodes.getSeasonEpisodes(season.id);
      const watchedEpisodes = episodes.filter(e => e.watched);
      const totalEpisodes = season.episodeCount;
      const watchedCount = watchedEpisodes.length;
      const remainingEpisodes = totalEpisodes - watchedCount;

      if (remainingEpisodes <= 0) continue;

      // Calculate pace (episodes per week)
      const watchDates = watchedEpisodes
        .filter(e => e.watchDate)
        .map(e => new Date(e.watchDate!))
        .sort((a, b) => a.getTime() - b.getTime());

      if (watchDates.length < 2) {
        // Not enough data to calculate pace, skip
        continue;
      }

      const firstWatch = watchDates[0];
      const lastWatch = watchDates[watchDates.length - 1];
      const weeksSinceStart = getWeeksBetween(firstWatch, lastWatch);
      
      // Avoid division by zero
      const episodesPerWeek = weeksSinceStart > 0 
        ? watchedCount / weeksSinceStart 
        : watchedCount; // If all watched in < 1 week

      // Calculate remaining time
      const weeksRemaining = episodesPerWeek > 0 
        ? remainingEpisodes / episodesPerWeek 
        : 0;
      
      const estimatedFinishDate = addWeeks(new Date(), weeksRemaining);
      
      const remainingMinutes = episodes
        .filter(e => !e.watched)
        .reduce((sum, e) => sum + (e.durationMinutes || 45), 0);

      // Get series info from movies table
      const seriesInfo = movies.find(m => m.id === season.seriesId);

      forecasts.push({
        seriesId: season.seriesId,
        seriesTitle: seriesInfo?.title || 'Unknown Series',
        seasonNumber: season.seasonNumber,
        seasonName: season.seasonName,
        totalEpisodes,
        watchedEpisodes: watchedCount,
        remainingEpisodes,
        progressPercentage: Math.round((watchedCount / totalEpisodes) * 100),
        episodesPerWeek: Math.round(episodesPerWeek * 10) / 10,
        weeksRemaining: Math.round(weeksRemaining * 10) / 10,
        estimatedFinishDate: estimatedFinishDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        remainingMinutes,
        status: season.status
      });
    } catch (error) {
      console.error(`Error calculating forecast for season ${season.id}:`, error);
    }
  }

  // Sort by weeks remaining (fastest to finish first)
  forecasts.sort((a, b) => a.weeksRemaining - b.weeksRemaining);

  const totalWeeksToFinishAll = Math.max(...forecasts.map(f => f.weeksRemaining), 0);
  const totalRemainingMinutes = forecasts.reduce((sum, f) => sum + f.remainingMinutes, 0);
  const fastestToFinish = forecasts[0] || null;

  return {
    currentlyWatching: forecasts,
    totalSeriesWatching: forecasts.length,
    totalWeeksToFinishAll: Math.round(totalWeeksToFinishAll * 10) / 10,
    totalRemainingMinutes,
    fastestToFinish
  };
}

export const timeStatsService = {
  calculateWatchTime,
  calculateBingeStats,
  calculateCompletionForecast,
  formatMinutesToHoursMinutes
};

export default timeStatsService;
