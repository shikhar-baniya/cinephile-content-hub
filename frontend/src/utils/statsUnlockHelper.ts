import { Movie } from "@/components/MovieCard";

export interface StatsUnlockStatus {
  moviesWatchedCount: number;
  seriesWatchedCount: number;
  moviesRequired: number;
  seriesRequired: number;
  moviesRemaining: number;
  seriesRemaining: number;
  isUnlocked: boolean;
  progressPercentage: number;
}

const MOVIES_REQUIRED = 5;
const SERIES_REQUIRED = 3;

export const calculateStatsUnlockStatus = (movies: Movie[]): StatsUnlockStatus => {
  const watchedMovies = movies.filter(m => m.status === 'watched');
  
  const moviesWatchedCount = watchedMovies.filter(m => m.category === 'Movie').length;
  const seriesWatchedCount = watchedMovies.filter(m => m.category === 'Series').length;
  
  const moviesRemaining = Math.max(0, MOVIES_REQUIRED - moviesWatchedCount);
  const seriesRemaining = Math.max(0, SERIES_REQUIRED - seriesWatchedCount);
  
  const isUnlocked = moviesWatchedCount >= MOVIES_REQUIRED && seriesWatchedCount >= SERIES_REQUIRED;
  
  const totalRequired = MOVIES_REQUIRED + SERIES_REQUIRED;
  const totalWatched = Math.min(moviesWatchedCount, MOVIES_REQUIRED) + Math.min(seriesWatchedCount, SERIES_REQUIRED);
  const progressPercentage = Math.min(100, Math.round((totalWatched / totalRequired) * 100));
  
  return {
    moviesWatchedCount,
    seriesWatchedCount,
    moviesRequired: MOVIES_REQUIRED,
    seriesRequired: SERIES_REQUIRED,
    moviesRemaining,
    seriesRemaining,
    isUnlocked,
    progressPercentage,
  };
};
