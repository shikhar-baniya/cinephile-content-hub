import { config } from '@/config/env';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/error-handling';

// TMDb API service for fetching movie data
// Note: This uses a demo API key - users should get their own from https://www.themoviedb.org/settings/api

const TMDB_API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c'; // Demo key - get your own!
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
}

export interface TMDbTVShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
}

export interface TMDbGenre {
  id: number;
  name: string;
}

// Genre mapping
const genreMap: Record<number, string> = {
  28: "Action",
  12: "Adventure", 
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

export const searchMoviesAndShows = async (query: string): Promise<{movies: TMDbMovie[], shows: TMDbTVShow[]}> => {
  try {
    const [movieResponse, tvResponse] = await Promise.all([
      apiClient.fetch<{ results: TMDbMovie[] }>(`/search/movie?query=${encodeURIComponent(query)}`),
      apiClient.fetch<{ results: TMDbTVShow[] }>(`/search/tv?query=${encodeURIComponent(query)}`)
    ]);

    return {
      movies: movieResponse.results || [],
      shows: tvResponse.results || []
    };
  } catch (error) {
    ErrorHandler.handle(error);
    return { movies: [], shows: [] };
  }
};

export const getImageUrl = (posterPath: string | null): string | null => {
  return posterPath ? `${config.tmdb.imageBaseUrl}/w500${posterPath}` : null;
};

export const getGenreName = (genreIds: number[]): string => {
  if (!genreIds || genreIds.length === 0) return "Unknown";
  return genreMap[genreIds[0]] || "Unknown";
};

export const formatMovieData = (movie: TMDbMovie) => ({
  title: movie.title,
  genre: getGenreName(movie.genre_ids),
  releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
  poster: getImageUrl(movie.poster_path),
  rating: Math.round(movie.vote_average),
  notes: movie.overview
});

export const formatTVData = (show: TMDbTVShow) => ({
  title: show.name,
  genre: getGenreName(show.genre_ids),
  releaseYear: show.first_air_date ? new Date(show.first_air_date).getFullYear() : new Date().getFullYear(),
  poster: getImageUrl(show.poster_path),
  rating: Math.round(show.vote_average),
  notes: show.overview
});

/**
 * Fetch TV show details from TMDB, including seasons list.
 * @param tvId TMDB TV show ID
 */
export const fetchTVShowDetails = async (tvId: number) => {
  try {
    const data = await apiClient.fetch<any>(`/tv/${tvId}`);
    return data; // includes 'seasons' array
  } catch (error) {
    ErrorHandler.handle(error);
    return null;
  }
};
