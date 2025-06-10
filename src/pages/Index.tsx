
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import MovieGrid from "@/components/MovieGrid";
import FilterBar from "@/components/FilterBar";
import StatsCards from "@/components/StatsCards";
import AddMovieDialog from "@/components/AddMovieDialog";
import MobileNavigation from "@/components/MobileNavigation";
import MovieDetailDialog from "@/components/MovieDetailDialog";
import GenreCollections from "@/components/GenreCollections";
import { Movie } from "@/components/MovieCard";

// Sample data with real movie posters
const sampleMovies: Movie[] = [
  {
    id: "1",
    title: "The Dark Knight",
    genre: "Action",
    category: "Movie",
    releaseYear: 2008,
    platform: "HBO Max",
    rating: 9,
    status: "watched",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    title: "Inception",
    genre: "Sci-Fi", 
    category: "Movie",
    releaseYear: 2010,
    platform: "Netflix",
    rating: 8,
    status: "watched",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    createdAt: "2024-01-20T14:15:00Z"
  },
  {
    id: "3",
    title: "Dune: Part Two",
    genre: "Sci-Fi",
    category: "Movie",
    releaseYear: 2024,
    platform: "Prime Video",
    rating: 0,
    status: "want-to-watch",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    createdAt: "2024-02-01T09:00:00Z"
  },
  {
    id: "4",
    title: "The Grand Budapest Hotel",
    genre: "Comedy",
    category: "Movie",
    releaseYear: 2014,
    platform: "Disney+",
    rating: 8,
    status: "watched",
    poster: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    createdAt: "2024-01-25T16:45:00Z"
  },
  {
    id: "5",
    title: "Stranger Things 4",
    genre: "Horror",
    category: "Series",
    releaseYear: 2022,
    platform: "Netflix",
    rating: 0,
    status: "watching",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    createdAt: "2024-01-18T12:20:00Z"
  },
  {
    id: "6",
    title: "Oppenheimer",
    genre: "Drama",
    category: "Movie",
    releaseYear: 2023,
    platform: "Cinema",
    rating: 9,
    status: "watched",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    createdAt: "2024-02-05T18:30:00Z"
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
  const [activeTab, setActiveTab] = useState("home");

  // Get unique values for filters
  const genres = useMemo(() => [...new Set(movies.map(m => m.genre))].sort(), [movies]);
  const platforms = useMemo(() => [...new Set(movies.map(m => m.platform))].sort(), [movies]);

  // Filter movies based on search and filters
  const filteredMovies = useMemo(() => {
    let filtered = movies;

    // Filter by tab type first
    if (activeTab === "movies") {
      // Assuming movies have lower IDs or different criteria - for demo, we'll show first half
      filtered = movies.filter((_, index) => index % 2 === 0);
    } else if (activeTab === "series") {
      // Assuming series have higher IDs or different criteria - for demo, we'll show second half
      filtered = movies.filter((_, index) => index % 2 === 1);
    }

    return filtered.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           movie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           movie.platform.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || movie.status === statusFilter;
      const matchesGenre = genreFilter === "all" || movie.genre === genreFilter;
      const matchesPlatform = platformFilter === "all" || movie.platform === platformFilter;
      
      return matchesSearch && matchesStatus && matchesGenre && matchesPlatform;
    });
  }, [movies, searchQuery, statusFilter, genreFilter, platformFilter, activeTab]);

  const handleAddMovie = (movieData: Omit<Movie, 'id'>) => {
    const newMovie: Movie = {
      ...movieData,
      id: Date.now().toString()
    };
    setMovies(prev => [newMovie, ...prev]);
    console.log('Movie added:', newMovie);
  };

  const handleDeleteMovie = (movieId: string) => {
    setMovies(prev => prev.filter(m => m.id !== movieId));
    setSelectedMovie(null);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setGenreFilter("all");
    setPlatformFilter("all");
    setSearchQuery("");
  };

  const renderContent = () => {
    if (activeTab === "analytics") {
      return (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="gradient-text">Analytics</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Your movie watching insights and statistics
            </p>
          </div>
          <StatsCards movies={movies} />
        </div>
      );
    }

    const showCollections = activeTab === "home" && !searchQuery && statusFilter === "all" && genreFilter === "all" && platformFilter === "all";

    return (
      <div className="space-y-6">
        {activeTab === "home" && (
          <div className="mb-6 hidden md:block">
            <StatsCards movies={movies} />
          </div>
        )}

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

        {showCollections ? (
          <GenreCollections movies={movies} onMovieClick={setSelectedMovie} />
        ) : (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-semibold">
                {activeTab === "movies" ? "Movies" : activeTab === "series" ? "Series" : "Your Collection"} ({filteredMovies.length})
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
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20 md:pb-0">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddMovie={() => setShowAddDialog(true)}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 md:hidden">
          <h2 className="text-2xl font-bold mb-2">
            My <span className="gradient-text">CineTracker</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Track your movie journey and discover your watching patterns
          </p>
        </div>

        <div className="hidden md:block mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            My <span className="gradient-text">CineTracker</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Track your movie journey and discover your watching patterns
          </p>
        </div>

        {renderContent()}
      </main>

      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <AddMovieDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddMovie={handleAddMovie}
      />

      <MovieDetailDialog
        movie={selectedMovie}
        open={!!selectedMovie}
        onOpenChange={(open) => !open && setSelectedMovie(null)}
        onDelete={handleDeleteMovie}
      />
    </div>
  );
};

export default Index;
