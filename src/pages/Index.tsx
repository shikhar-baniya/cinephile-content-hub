
import { useState, useMemo } from "react";
import { Film } from "lucide-react";
import Header from "@/components/Header";
import MovieGrid from "@/components/MovieGrid";
import FilterBar from "@/components/FilterBar";
import StatsCards from "@/components/StatsCards";
import AddMovieDialog from "@/components/AddMovieDialog";
import { Movie } from "@/components/MovieCard";

// Sample data with real movie posters
const sampleMovies: Movie[] = [
  {
    id: "1",
    title: "The Dark Knight",
    genre: "Action",
    releaseYear: 2008,
    platform: "HBO Max",
    rating: 9,
    status: "watched",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
  },
  {
    id: "2",
    title: "Inception",
    genre: "Sci-Fi", 
    releaseYear: 2010,
    platform: "Netflix",
    rating: 8,
    status: "watched",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
  },
  {
    id: "3",
    title: "Dune: Part Two",
    genre: "Sci-Fi",
    releaseYear: 2024,
    platform: "Prime Video",
    rating: 0,
    status: "want-to-watch",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"
  },
  {
    id: "4",
    title: "The Grand Budapest Hotel",
    genre: "Comedy",
    releaseYear: 2014,
    platform: "Disney+",
    rating: 8,
    status: "watched",
    poster: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg"
  },
  {
    id: "5",
    title: "Stranger Things 4",
    genre: "Horror",
    releaseYear: 2022,
    platform: "Netflix",
    rating: 0,
    status: "watching",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg"
  },
  {
    id: "6",
    title: "Oppenheimer",
    genre: "Drama",
    releaseYear: 2023,
    platform: "Cinema",
    rating: 9,
    status: "watched",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"
  }
];

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>(sampleMovies);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Get unique values for filters
  const genres = useMemo(() => [...new Set(movies.map(m => m.genre))].sort(), [movies]);
  const platforms = useMemo(() => [...new Set(movies.map(m => m.platform))].sort(), [movies]);

  // Filter movies based on search and filters
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           movie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           movie.platform.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || movie.status === statusFilter;
      const matchesGenre = genreFilter === "all" || movie.genre === genreFilter;
      const matchesPlatform = platformFilter === "all" || movie.platform === platformFilter;
      
      return matchesSearch && matchesStatus && matchesGenre && matchesPlatform;
    });
  }, [movies, searchQuery, statusFilter, genreFilter, platformFilter]);

  const handleAddMovie = (movieData: Omit<Movie, 'id'>) => {
    const newMovie: Movie = {
      ...movieData,
      id: Date.now().toString()
    };
    setMovies(prev => [newMovie, ...prev]);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setGenreFilter("all");
    setPlatformFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddMovie={() => setShowAddDialog(true)}
      />
      
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section - Mobile Optimized */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            My <span className="gradient-text">CineTracker</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Track your movie journey and discover your watching patterns
          </p>
        </div>

        {/* Stats Cards - Mobile Grid */}
        <StatsCards movies={movies} />

        {/* Filters - Mobile Responsive */}
        <FilterBar
          statusFilter={statusFilter}
          genreFilter={genreFilter}
          platformFilter={platformFilter}
          onStatusChange={setStatusFilter}
          onGenreChange={setGenreFilter}
          onPlatformChange={setPlatformFilter}
          onClearFilters={clearFilters}
          genres={genres}
          platforms={platforms}
        />

        {/* Movie Collection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold">
              Your Collection ({filteredMovies.length})
            </h3>
            {filteredMovies.length !== movies.length && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
          <MovieGrid
            movies={filteredMovies}
            onMovieClick={setSelectedMovie}
          />
        </div>
      </main>

      <AddMovieDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddMovie={handleAddMovie}
      />
    </div>
  );
};

export default Index;
