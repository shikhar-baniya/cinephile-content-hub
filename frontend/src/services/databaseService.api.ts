import { Movie } from "@/components/MovieCard";
import { apiClient } from "./apiClient";

export interface DatabaseMovie {
  id: string;
  user_id: string;
  title: string;
  genre: string;
  category: "Movie" | "Series" | "Short-Film";
  release_year: number;
  platform: string;
  rating: number;
  status: "watched" | "watching" | "want-to-watch";
  poster?: string;
  notes?: string;
  season?: string;
  created_at: string;
  updated_at: string;
}

export const movieService = {
  async getMovies(): Promise<Movie[]> {
    try {
      return await apiClient.getMovies();
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  },

  async addMovie(movieData: Omit<Movie, 'id'>): Promise<Movie> {
    try {
      return await apiClient.addMovie(movieData);
    } catch (error) {
      console.error('Error adding movie:', error);
      throw error;
    }
  },

  async updateMovie(movieId: string, updates: Partial<Omit<DatabaseMovie, 'id' | 'user_id' | 'created_at'>>): Promise<Movie> {
    try {
      // Transform updates to match Movie interface
      const movieUpdates: Partial<Movie> = {};
      
      if (updates.title !== undefined) movieUpdates.title = updates.title;
      if (updates.genre !== undefined) movieUpdates.genre = updates.genre;
      if (updates.category !== undefined) movieUpdates.category = updates.category;
      if (updates.release_year !== undefined) movieUpdates.releaseYear = updates.release_year;
      if (updates.platform !== undefined) movieUpdates.platform = updates.platform;
      if (updates.rating !== undefined) movieUpdates.rating = updates.rating;
      if (updates.status !== undefined) movieUpdates.status = updates.status;
      if (updates.poster !== undefined) movieUpdates.poster = updates.poster;
      if (updates.notes !== undefined) movieUpdates.notes = updates.notes;
      if (updates.season !== undefined) movieUpdates.season = updates.season;

      return await apiClient.updateMovie(movieId, movieUpdates);
    } catch (error) {
      console.error('Error updating movie:', error);
      throw error;
    }
  },

  async deleteMovie(movieId: string): Promise<void> {
    try {
      await apiClient.deleteMovie(movieId);
    } catch (error) {
      console.error('Error deleting movie:', error);
      throw error;
    }
  }
};