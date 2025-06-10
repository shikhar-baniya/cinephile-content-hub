
import { useState, useMemo } from "react";
import { Film } from "lucide-react";
import Header from "@/components/Header";
import MovieGrid from "@/components/MovieGrid";
import FilterBar from "@/components/FilterBar";
import StatsCards from "@/components/StatsCards";
import AddMovieDialog from "@/components/AddMovieDialog";
import { Movie } from "@/components/MovieCard";

// Sample data for demonstration
const sampleMovies: Movie[] = [
  {
    id: "1",
    title: "The Dark Knight",
    genre: "Action",
    releaseYear: 2008,
    platform: "HBO Max",
    rating: 9,
    status: "watched",
    poster: "https://images.unsplash.com/photo-1489599894652-aba9c665dcaa?w=300&h=450&fit=crop"
  },
  {
    id: "2",
    title: "Inception",
    genre: "Sci-Fi",
    releaseYear: 2010,
    platform: "Netflix",
    rating: 8,
    status: "watched",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop"
  },
  {
    id: "3",
    title: "Dune: Part Two",
    genre: "Sci-Fi",
    releaseYear: 2024,
    platform: "Prime Video",
    rating: 0,
    status: "want-to-watch",
    poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop"
  },
  {
    id: "4",
    title: "The Grand Budapest Hotel",
    genre: "Comedy",
    releaseYear: 2014,
    platform: "Disney+",
    rating: 8,
    status: "watched",
    poster: "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?w=300&h=450&fit=crop"
  },
  {
    id: "5",
    title: "Stranger Things 4",
    genre: "Horror",
    releaseYear: 2022,
    platform: "Netflix",
    rating: 0,
    status: "watching",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop"
  },
  {
    id: "6",
    title: "Oppenheimer",
    genre: "Drama",
    releaseYear: 2023,
    platform: "Cinema",
    rating: 9,
    status: "watched",
    poster: "https://images.unsplash.com/photo-1478720568477-b2709d01a0fc?w=300&h=450&fit=crop"
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
    <div className="min-h-screen">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddMovie={() => setShowAddDialog(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">Cinephile</span>
          </h2>
          <p className="text-muted-foreground">
            Track your movie journey and discover your watching patterns
          </p>
        </div>

        <StatsCards movies={movies} />

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

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">
            Your Collection ({filteredMovies.length})
          </h3>
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
