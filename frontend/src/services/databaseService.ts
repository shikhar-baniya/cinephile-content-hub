import { Movie } from "@/components/MovieCard";
import { config } from "@/config/env";

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
  created_at: string;
  updated_at: string;
}

export const movieService = {
  async getMovies(): Promise<Movie[]> {
    try {
      const response = await fetch(`${config.api.baseUrl}/movies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      
      return data.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        genre: movie.genre,
        category: movie.category as "Movie" | "Series" | "Short-Film",
        releaseYear: movie.release_year,
        platform: movie.platform,
        rating: movie.rating,
        status: movie.status as "watched" | "watching" | "want-to-watch",
        poster: movie.poster,
        notes: movie.notes,
        createdAt: movie.created_at,
        updatedAt: movie.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  },

  async addMovie(movieData: Omit<Movie, 'id'>): Promise<Movie> {
    try {
      const response = await fetch(`${config.api.baseUrl}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: movieData.title,
          genre: movieData.genre,
          category: movieData.category,
          release_year: movieData.releaseYear,
          platform: movieData.platform,
          rating: movieData.rating,
          status: movieData.status,
          poster: movieData.poster,
          notes: movieData.notes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          throw new Error('This movie already exists in your collection');
        }
        throw new Error(errorData.message || 'Failed to add movie');
      }

      const data = await response.json();
      
      return {
        id: data.id,
        title: data.title,
        genre: data.genre,
        category: data.category as "Movie" | "Series" | "Short-Film",
        releaseYear: data.release_year,
        platform: data.platform,
        rating: data.rating,
        status: data.status as "watched" | "watching" | "want-to-watch",
        poster: data.poster,
        notes: data.notes,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error adding movie:', error);
      throw error;
    }
  },

  async updateMovie(movieId: string, updates: Partial<Omit<DatabaseMovie, 'id' | 'user_id' | 'created_at'>>): Promise<Movie> {
    try {
      const response = await fetch(`${config.api.baseUrl}/movies/${movieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update movie');
      }

      const data = await response.json();
      
      return {
        id: data.id,
        title: data.title,
        genre: data.genre,
        category: data.category as "Movie" | "Series" | "Short-Film",
        releaseYear: data.release_year,
        platform: data.platform,
        rating: data.rating,
        status: data.status as "watched" | "watching" | "want-to-watch",
        poster: data.poster,
        watchDate: data.watch_date,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error updating movie:', error);
      throw error;
    }
  },

  async deleteMovie(movieId: string): Promise<void> {
    try {
      const response = await fetch(`${config.api.baseUrl}/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete movie');
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      throw error;
    }
  }
};