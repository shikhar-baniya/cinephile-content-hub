import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/components/MovieCard";

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
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }

    return data?.map(movie => ({
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
    })) || [];
  },

  async addMovie(movieData: Omit<Movie, 'id'>): Promise<Movie> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('movies')
      .insert({
        user_id: user.id,
        title: movieData.title,
        genre: movieData.genre,
        category: movieData.category,
        release_year: movieData.releaseYear,
        platform: movieData.platform,
        rating: movieData.rating,
        status: movieData.status,
        poster: movieData.poster,
        notes: movieData.notes
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('This movie already exists in your collection');
      }
      console.error('Error adding movie:', error);
      throw error;
    }

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
  },

  async deleteMovie(movieId: string): Promise<void> {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', movieId);

    if (error) {
      console.error('Error deleting movie:', error);
      throw error;
    }
  }
};
