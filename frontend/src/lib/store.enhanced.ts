// Enhanced Store with better performance and persistence
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { Movie } from '@/components/MovieCard';

// Performance: Split large stores into smaller, focused stores
interface UIState {
  isLoading: boolean;
  activeTab: string;
  searchQuery: string;
  selectedMovie: Movie | null;
  showAddDialog: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: number;
  }>;
}

interface UIActions {
  setLoading: (loading: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedMovie: (movie: Movie | null) => void;
  setShowAddDialog: (show: boolean) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// UI Store - No persistence needed for most UI state
export const useUIStore = create<UIState & UIActions>()(
  subscribeWithSelector(
    immer((set) => ({
      // State
      isLoading: false,
      activeTab: 'home',
      searchQuery: '',
      selectedMovie: null,
      showAddDialog: false,
      notifications: [],

      // Actions
      setLoading: (loading) => set((state) => {
        state.isLoading = loading;
      }),
      
      setActiveTab: (tab) => set((state) => {
        state.activeTab = tab;
      }),
      
      setSearchQuery: (query) => set((state) => {
        state.searchQuery = query;
      }),
      
      setSelectedMovie: (movie) => set((state) => {
        state.selectedMovie = movie;
      }),
      
      setShowAddDialog: (show) => set((state) => {
        state.showAddDialog = show;
      }),
      
      addNotification: (notification) => set((state) => {
        state.notifications.push({
          ...notification,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
        });
      }),
      
      removeNotification: (id) => set((state) => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }),
      
      clearNotifications: () => set((state) => {
        state.notifications = [];
      }),
    }))
  )
);

// Data Store - Movies and related data
interface DataState {
  movies: Movie[];
  totalMovies: number;
  currentPage: number;
  pageSize: number;
  lastSync: number;
  isOffline: boolean;
  pendingOperations: Array<{
    id: string;
    type: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
  }>;
}

interface DataActions {
  setMovies: (movies: Movie[]) => void;
  addMovie: (movie: Movie) => void;
  updateMovie: (id: string, updates: Partial<Movie>) => void;
  removeMovie: (id: string) => void;
  setTotalMovies: (total: number) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  updateLastSync: () => void;
  setOfflineStatus: (offline: boolean) => void;
  addPendingOperation: (operation: Omit<DataState['pendingOperations'][0], 'id' | 'timestamp'>) => void;
  removePendingOperation: (id: string) => void;
  clearPendingOperations: () => void;
}

export const useDataStore = create<DataState & DataActions>()(
  persist(
    subscribeWithSelector(
      immer((set, get) => ({
        // State
        movies: [],
        totalMovies: 0,
        currentPage: 1,
        pageSize: 20,
        lastSync: 0,
        isOffline: false,
        pendingOperations: [],

        // Actions
        setMovies: (movies) => set((state) => {
          state.movies = movies;
        }),
        
        addMovie: (movie) => set((state) => {
          state.movies.unshift(movie);
          state.totalMovies += 1;
        }),
        
        updateMovie: (id, updates) => set((state) => {
          const index = state.movies.findIndex(m => m.id === id);
          if (index !== -1) {
            Object.assign(state.movies[index], updates);
          }
        }),
        
        removeMovie: (id) => set((state) => {
          state.movies = state.movies.filter(m => m.id !== id);
          state.totalMovies = Math.max(0, state.totalMovies - 1);
        }),
        
        setTotalMovies: (total) => set((state) => {
          state.totalMovies = total;
        }),
        
        setCurrentPage: (page) => set((state) => {
          state.currentPage = page;
        }),
        
        setPageSize: (size) => set((state) => {
          state.pageSize = size;
        }),
        
        updateLastSync: () => set((state) => {
          state.lastSync = Date.now();
        }),
        
        setOfflineStatus: (offline) => set((state) => {
          state.isOffline = offline;
        }),
        
        addPendingOperation: (operation) => set((state) => {
          state.pendingOperations.push({
            ...operation,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
          });
        }),
        
        removePendingOperation: (id) => set((state) => {
          state.pendingOperations = state.pendingOperations.filter(op => op.id !== id);
        }),
        
        clearPendingOperations: () => set((state) => {
          state.pendingOperations = [];
        }),
      }))
    ),
    {
      name: 'cinephile-data-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        movies: state.movies,
        totalMovies: state.totalMovies,
        currentPage: state.currentPage,
        pageSize: state.pageSize,
        lastSync: state.lastSync,
        pendingOperations: state.pendingOperations,
      }),
    }
  )
);

// Filter Store - Separate for filter state
interface FilterState {
  status: 'all' | 'watched' | 'watching' | 'want-to-watch';
  category: 'all' | 'Movie' | 'Series' | 'Short-Film';
  genre: string;
  platform: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  sortBy: 'title' | 'releaseYear' | 'rating' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

interface FilterActions {
  setStatusFilter: (status: FilterState['status']) => void;
  setCategoryFilter: (category: FilterState['category']) => void;
  setGenreFilter: (genre: string) => void;
  setPlatformFilter: (platform: string) => void;
  setDateRange: (range: FilterState['dateRange']) => void;
  setSortBy: (sortBy: FilterState['sortBy']) => void;
  setSortOrder: (order: FilterState['sortOrder']) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState & FilterActions>()(
  persist(
    immer((set) => ({
      // State
      status: 'all',
      category: 'all',
      genre: 'all',
      platform: 'all',
      dateRange: { start: null, end: null },
      sortBy: 'createdAt',
      sortOrder: 'desc',

      // Actions
      setStatusFilter: (status) => set((state) => {
        state.status = status;
      }),
      
      setCategoryFilter: (category) => set((state) => {
        state.category = category;
      }),
      
      setGenreFilter: (genre) => set((state) => {
        state.genre = genre;
      }),
      
      setPlatformFilter: (platform) => set((state) => {
        state.platform = platform;
      }),
      
      setDateRange: (range) => set((state) => {
        state.dateRange = range;
      }),
      
      setSortBy: (sortBy) => set((state) => {
        state.sortBy = sortBy;
      }),
      
      setSortOrder: (order) => set((state) => {
        state.sortOrder = order;
      }),
      
      resetFilters: () => set((state) => {
        state.status = 'all';
        state.category = 'all';
        state.genre = 'all';
        state.platform = 'all';
        state.dateRange = { start: null, end: null };
        state.sortBy = 'createdAt';
        state.sortOrder = 'desc';
      }),
    })),
    {
      name: 'cinephile-filter-storage',
    }
  )
);

// Performance monitoring store
interface PerformanceState {
  metrics: {
    renderTimes: number[];
    apiCallTimes: number[];
    lastPerformanceCheck: number;
  };
}

interface PerformanceActions {
  addRenderTime: (time: number) => void;
  addApiCallTime: (time: number) => void;
  getAverageRenderTime: () => number;
  getAverageApiCallTime: () => number;
}

export const usePerformanceStore = create<PerformanceState & PerformanceActions>()(
  immer((set, get) => ({
    metrics: {
      renderTimes: [],
      apiCallTimes: [],
      lastPerformanceCheck: Date.now(),
    },

    addRenderTime: (time) => set((state) => {
      state.metrics.renderTimes.push(time);
      // Keep only last 100 entries
      if (state.metrics.renderTimes.length > 100) {
        state.metrics.renderTimes.shift();
      }
    }),

    addApiCallTime: (time) => set((state) => {
      state.metrics.apiCallTimes.push(time);
      // Keep only last 100 entries
      if (state.metrics.apiCallTimes.length > 100) {
        state.metrics.apiCallTimes.shift();
      }
    }),

    getAverageRenderTime: () => {
      const times = get().metrics.renderTimes;
      return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    },

    getAverageApiCallTime: () => {
      const times = get().metrics.apiCallTimes;
      return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    },
  }))
);