import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Movie } from '@/components/MovieCard';

interface AppState {
  // UI State
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Movie State
  movies: Movie[];
  setMovies: (movies: Movie[]) => void;
  addMovie: (movie: Movie) => void;
  removeMovie: (id: string) => void;
  updateMovie: (id: string, movie: Partial<Movie>) => void;
  
  // Filter State
  filters: {
    status: 'all' | 'watched' | 'watching' | 'want-to-watch';
    category: 'all' | 'Movie' | 'Series' | 'Short-Film';
    genre: string;
  };
  setFilters: (filters: Partial<AppState['filters']>) => void;
  
  // Pagination State
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
  };
  setPagination: (pagination: Partial<AppState['pagination']>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // UI State
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Movie State
      movies: [],
      setMovies: (movies) => set({ movies }),
      addMovie: (movie) => set((state) => ({ 
        movies: [...state.movies, movie] 
      })),
      removeMovie: (id) => set((state) => ({
        movies: state.movies.filter((movie) => movie.id !== id)
      })),
      updateMovie: (id, updatedMovie) => set((state) => ({
        movies: state.movies.map((movie) =>
          movie.id === id ? { ...movie, ...updatedMovie } : movie
        )
      })),
      
      // Filter State
      filters: {
        status: 'all',
        category: 'all',
        genre: 'all',
      },
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),
      
      // Pagination State
      pagination: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
      },
      setPagination: (newPagination) => set((state) => ({
        pagination: { ...state.pagination, ...newPagination }
      })),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
); 