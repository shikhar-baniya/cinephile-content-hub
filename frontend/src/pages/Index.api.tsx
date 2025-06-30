import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import MovieGrid from "@/components/MovieGrid";
import StatsCards from "@/components/StatsCards";
import FilterBar from "@/components/FilterBar";
import GenreCollections from "@/components/GenreCollections";
import AddMovieDialog from "@/components/AddMovieDialog.api";
import MovieDetailDialog from "@/components/MovieDetailDialog.api";
import MobileNavigation from "@/components/MobileNavigation";
import AuthComponent from "@/components/AuthComponent.api";
import MovieCarousel from "@/components/MovieCarousel";
import HeroCarousel from "@/components/HeroCarousel";
import GenreFilterBar from "@/components/GenreFilterBar";
import { Movie } from "@/components/MovieCard";
import { movieService } from "@/services/databaseService.api";
import { authService, User } from "@/services/authService";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PageTransition from "@/components/PageTransition";
import LoadingBar from "@/components/LoadingBar";
import FuturisticBackground from "@/components/FuturisticBackground";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { user: currentUser } = await authService.getSession();
        setUser(currentUser);
      } catch (error) {
        // Session check failed - handled silently
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const unsubscribe = authService.onAuthStateChange((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []); // Empty dependency array to run only once

  // Fetch movies data
  const { data: movies = [], isLoading: moviesLoading, refetch } = useQuery({
    queryKey: ['movies'],
    queryFn: movieService.getMovies,
    enabled: !!user, // Only fetch when user is authenticated
  });

  // Filter movies based on search and tab (useMemo instead of useEffect)
  const filteredMovies = useMemo(() => {
    if (!movies || !Array.isArray(movies)) {
      return [];
    }
    let filtered = movies.filter(movie => 
      movie &&
      typeof movie === 'object' &&
      movie.id &&
      movie.title
    );
    if (searchQuery) {
      filtered = filtered.filter(movie => 
        movie?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie?.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeTab === "home" && selectedGenre !== "All") {
      filtered = filtered.filter(movie => 
        movie?.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(movie => movie?.status === statusFilter);
    }
    if (genreFilter !== "all") {
      filtered = filtered.filter(movie => movie?.genre === genreFilter);
    }
    if (platformFilter !== "all") {
      filtered = filtered.filter(movie => movie?.platform === platformFilter);
    }
    switch (activeTab) {
      case "movies":
        filtered = filtered.filter(movie => movie?.category === "Movie");
        break;
      case "series":
        filtered = filtered.filter(movie => movie?.category === "Series");
        break;
      case "analytics":
        break;
      default:
        break;
    }
    return filtered;
  }, [movies, searchQuery, activeTab, statusFilter, genreFilter, platformFilter, selectedGenre]);

  const handleAddMovie = async () => {
    await refetch();
    setShowAddDialog(false);
  };

  const handleDeleteMovie = async () => {
    await refetch();
    setSelectedMovie(null);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setGenreFilter("all");
    setPlatformFilter("all");
  };

  // Get unique genres and platforms for filter options
  const uniqueGenres = Array.from(new Set(movies?.flatMap(movie => 
    movie.genre.split(',').map(g => g.trim())
  ).filter(Boolean))) || [];
  const uniquePlatforms = Array.from(new Set(movies?.map(movie => movie.platform).filter(Boolean))) || [];

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <FuturisticBackground />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg font-medium">Loading your cinematic universe...</div>
          <div className="text-white/60 text-sm mt-2">Preparing your movies and series</div>
        </div>
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
          </div>
        );
      case "home":
        return (
          <div className="space-y-6">
            {/* Hero Carousel for Mobile */}
            <div className="md:hidden">
              <ErrorBoundary>
                <HeroCarousel 
                  movies={(filteredMovies || []).filter(movie => movie && movie.id && movie.title)} 
                  onMovieClick={setSelectedMovie} 
                />
              </ErrorBoundary>
              <GenreFilterBar 
                genres={uniqueGenres}
                selectedGenre={selectedGenre}
                onGenreSelect={setSelectedGenre}
              />
              <MovieCarousel movies={filteredMovies || []} onMovieClick={setSelectedMovie} />
            </div>
            
            {/* Desktop/Tablet Collections */}
            <div className="hidden md:block">
              <GenreCollections movies={movies || []} onMovieClick={setSelectedMovie} />
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <FilterBar 
              statusFilter={statusFilter}
              genreFilter={genreFilter}
              platformFilter={platformFilter}
              onStatusChange={setStatusFilter}
              onGenreChange={setGenreFilter}
              onPlatformChange={setPlatformFilter}
              onClearFilters={clearFilters}
              genres={uniqueGenres}
              platforms={uniquePlatforms}
            />
            <MovieGrid movies={filteredMovies} onMovieClick={setSelectedMovie} />
          </div>
        );
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) {
      setIsPageTransitioning(true);
      setActiveTab(tab);
      
      // Reset transition state after animation
      setTimeout(() => {
        setIsPageTransitioning(false);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen relative">
      <ErrorBoundary fallback={
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      }>
        <FuturisticBackground />
      </ErrorBoundary>
      <LoadingBar isLoading={isPageTransitioning} />
      
      <div className="relative z-10 container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddMovie={() => setShowAddDialog(true)}
          onSignOut={handleSignOut}
        />

        <PageTransition triggerKey={activeTab}>
          {renderContent()}
        </PageTransition>
        
        <MobileNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          onAddMovie={() => setShowAddDialog(true)}
        />
        
        <AddMovieDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
          onAddMovie={handleAddMovie}
        />
        
        {selectedMovie && (
          <MovieDetailDialog 
            movie={selectedMovie} 
            open={!!selectedMovie}
            onOpenChange={() => setSelectedMovie(null)}
            onDelete={handleDeleteMovie}
            onUpdate={refetch}
          />
        )}
      </div>
    </div>
  );
};

export default Index;