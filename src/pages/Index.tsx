
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import MovieGrid from "@/components/MovieGrid";
import FilterBar from "@/components/FilterBar";
import StatsCards from "@/components/StatsCards";
import AddMovieDialog from "@/components/AddMovieDialog";
import MobileNavigation from "@/components/MobileNavigation";
import MovieDetailDialog from "@/components/MovieDetailDialog";
import GenreCollections from "@/components/GenreCollections";
import AuthComponent from "@/components/AuthComponent";
import { Movie } from "@/components/MovieCard";
import { movieService } from "@/services/databaseService";
import { toast } from "sonner";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);

  const queryClient = useQueryClient();

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Fetch movies from database
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['movies'],
    queryFn: movieService.getMovies,
    enabled: !!user,
  });

  // Add movie mutation
  const addMovieMutation = useMutation({
    mutationFn: movieService.addMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success("Movie added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add movie");
    },
  });

  // Delete movie mutation
  const deleteMovieMutation = useMutation({
    mutationFn: movieService.deleteMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success("Movie deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete movie");
    },
  });

  // Show auth component if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthComponent onAuthChange={setUser} />;
  }

  // Get unique values for filters
  const genres = useMemo(() => [...new Set(movies.map(m => m.genre))].sort(), [movies]);
  const platforms = useMemo(() => [...new Set(movies.map(m => m.platform))].sort(), [movies]);

  // Filter movies based on search and filters
  const filteredMovies = useMemo(() => {
    let filtered = movies;

    // Filter by tab type first
    if (activeTab === "movies") {
      filtered = movies.filter(movie => movie.category === "Movie");
    } else if (activeTab === "series") {
      filtered = movies.filter(movie => movie.category === "Series");
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
    addMovieMutation.mutate(movieData);
  };

  const handleDeleteMovie = (movieId: string) => {
    deleteMovieMutation.mutate(movieId);
    setSelectedMovie(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading your collection...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20 md:pb-0">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddMovie={() => setShowAddDialog(true)}
        onSignOut={handleSignOut}
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
