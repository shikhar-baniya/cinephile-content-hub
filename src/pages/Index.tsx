import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import MovieGrid from "@/components/MovieGrid";
import StatsCards from "@/components/StatsCards";
import FilterBar from "@/components/FilterBar";
import GenreCollections from "@/components/GenreCollections";
import AddMovieDialog from "@/components/AddMovieDialog";
import MovieDetailDialog from "@/components/MovieDetailDialog";
import MobileNavigation from "@/components/MobileNavigation";
import AuthComponent from "@/components/AuthComponent";
import { Movie } from "@/components/MovieCard";
import { movieService } from "@/services/databaseService";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch movies data
  const { data: movies = [], isLoading: moviesLoading, refetch } = useQuery({
    queryKey: ['movies'],
    queryFn: movieService.getMovies,
    enabled: !!user, // Only fetch when user is authenticated
  });

  // Filter movies based on search and tab
  useEffect(() => {
    if (!movies || !Array.isArray(movies)) {
      setFilteredMovies([]);
      return;
    }

    let filtered = [...movies];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(movie => 
        movie?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie?.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tab filter
    switch (activeTab) {
      case "movies":
        filtered = filtered.filter(movie => movie?.category === "Movie");
        break;
      case "series":
        filtered = filtered.filter(movie => movie?.category === "Series");
        break;
      case "analytics":
        // Keep all for analytics view
        break;
      default: // home
        // Keep all for home view
        break;
    }

    setFilteredMovies(filtered);
  }, [movies, searchQuery, activeTab]);

  const handleAddMovie = async () => {
    await refetch();
    setShowAddDialog(false);
  };

  const handleDeleteMovie = async () => {
    await refetch();
    setSelectedMovie(null);
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show auth component if not authenticated
  if (!user) {
    return <AuthComponent onAuthChange={setUser} />;
  }

  const renderContent = () => {
    if (moviesLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading movies...</div>
        </div>
      );
    }

    switch (activeTab) {
      case "analytics":
        return (
          <div className="space-y-6">
            <StatsCards movies={movies || []} />
            <GenreCollections movies={movies || []} onMovieClick={setSelectedMovie} />
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <FilterBar />
            <MovieGrid movies={filteredMovies} onMovieClick={setSelectedMovie} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Header 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
          onAddMovie={() => setShowAddDialog(true)}
        />
        
        {renderContent()}
        
        <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <AddMovieDialog 
          open={showAddDialog} 
          onClose={() => setShowAddDialog(false)}
          onMovieAdded={handleAddMovie}
        />
        
        {selectedMovie && (
          <MovieDetailDialog 
            movie={selectedMovie} 
            open={!!selectedMovie}
            onClose={() => setSelectedMovie(null)}
            onDelete={handleDeleteMovie}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
