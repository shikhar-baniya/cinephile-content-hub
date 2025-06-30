import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Grid, 
  List, 
  TrendingUp, 
  BarChart3,
  Plus,
  Download,
  Share2
} from "lucide-react";
import { Movie } from "./MovieCard";
import MovieCard from "./MovieCard";
import MovieFilters, { FilterOptions } from "./MovieFilters";
import MovieStats from "./MovieStats";

interface MovieListProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  onAddMovie: () => void;
  onEditMovie?: (movie: Movie) => void;
  onDeleteMovie?: () => void;
  onUpdateMovies?: () => void;
}

const MovieList = ({ 
  movies, 
  onMovieClick, 
  onAddMovie, 
  onEditMovie, 
  onDeleteMovie, 
  onUpdateMovies 
}: MovieListProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'stats'>('grid');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    category: 'all',
    genre: 'all',
    platform: 'all',
    ratingMin: 0,
    ratingMax: 10,
    yearMin: 2000,
    yearMax: new Date().getFullYear(),
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Filter and sort movies
  const filteredAndSortedMovies = useMemo(() => {
    let filtered = movies.filter(movie => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          movie.title.toLowerCase().includes(searchLower) ||
          movie.genre.toLowerCase().includes(searchLower) ||
          movie.platform.toLowerCase().includes(searchLower) ||
          (movie.notes && movie.notes.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && movie.status !== filters.status) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && movie.category !== filters.category) {
        return false;
      }

      // Genre filter
      if (filters.genre !== 'all' && !movie.genre.includes(filters.genre)) {
        return false;
      }

      // Platform filter
      if (filters.platform !== 'all' && movie.platform !== filters.platform) {
        return false;
      }

      // Rating filter
      if (movie.rating < filters.ratingMin || movie.rating > filters.ratingMax) {
        return false;
      }

      // Year filter
      if (movie.releaseYear < filters.yearMin || movie.releaseYear > filters.yearMax) {
        return false;
      }

      return true;
    });

    // Sort movies
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'releaseYear':
          aValue = a.releaseYear;
          bValue = b.releaseYear;
          break;
        case 'watchDate':
          aValue = a.watchDate ? new Date(a.watchDate).getTime() : 0;
          bValue = b.watchDate ? new Date(b.watchDate).getTime() : 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [movies, filters]);

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      category: 'all',
      genre: 'all',
      platform: 'all',
      ratingMin: 0,
      ratingMax: 10,
      yearMin: 2000,
      yearMax: new Date().getFullYear(),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredAndSortedMovies, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `movies-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            My Collection
          </h2>
          <Badge variant="secondary" className="text-sm">
            {filteredAndSortedMovies.length} of {movies.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none border-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'stats' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('stats')}
              className="rounded-l-none border-0"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={onAddMovie} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Filters */}
      <MovieFilters
        movies={movies}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      {/* Content */}
      {viewMode === 'stats' ? (
        <MovieStats movies={filteredAndSortedMovies} />
      ) : (
        <>
          {/* Results Summary */}
          {filteredAndSortedMovies.length !== movies.length && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    Showing {filteredAndSortedMovies.length} of {movies.length} items
                  </span>
                  {filters.search && (
                    <span className="text-muted-foreground">
                      Search results for "{filters.search}"
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Movies Grid */}
          {filteredAndSortedMovies.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="text-4xl">🎬</div>
                  <div>
                    <h3 className="text-lg font-semibold">No movies found</h3>
                    <p className="text-muted-foreground">
                      {movies.length === 0 
                        ? "Start building your collection by adding your first movie or series!"
                        : "Try adjusting your filters to see more results."
                      }
                    </p>
                  </div>
                  {movies.length === 0 && (
                    <Button onClick={onAddMovie} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Movie
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredAndSortedMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={onMovieClick}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MovieList;