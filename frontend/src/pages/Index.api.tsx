import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MovieGrid from "@/components/MovieGrid";
import StatsCards from "@/components/StatsCards";
import FilterBar from "@/components/FilterBar";
import GenreCollections from "@/components/GenreCollections";
import FilteredResultsCount from "@/components/FilteredResultsCount";
import { DateFilterValue } from "@/components/DateFilter";
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
import { useAuth } from "@/lib/auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PageTransition from "@/components/PageTransition";
import LoadingBar from "@/components/LoadingBar";
import FuturisticBackground from "@/components/FuturisticBackground";
import { seriesPopulationService } from "@/services/seriesPopulationService";
import { useToast } from "@/components/ui/use-toast";
import "@/utils/sessionDebug"; // Import for dev debugging

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasCompletedOnboarding } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [populationUpdate, setPopulationUpdate] = useState(0);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilterValue | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const { user: currentUser, session } = await authService.getSession();
        
        console.log('Session check result:', { user: currentUser, session: !!session });
        
        if (currentUser && session) {
          setUser(currentUser);
          
          // If user is authenticated but hasn't completed onboarding, redirect to welcome
          if (!hasCompletedOnboarding) {
            navigate('/welcome', { replace: true });
            return;
          }
        } else {
          // No valid session found
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const unsubscribe = authService.onAuthStateChange((newUser) => {
      console.log('Auth state changed:', newUser);
      setUser(newUser);
      
      // If user is authenticated but hasn't completed onboarding, redirect to welcome
      if (newUser && !hasCompletedOnboarding) {
        navigate('/welcome', { replace: true });
      }
    });

    return unsubscribe;
  }, [hasCompletedOnboarding, navigate]); // Add dependencies

  // Fetch movies data
  const { data: movies = [], isLoading: moviesLoading, refetch } = useQuery({
    queryKey: ['movies'],
    queryFn: movieService.getMovies,
    enabled: !!user, // Only fetch when user is authenticated
  });

  // Series population service subscriptions
  useEffect(() => {
    // Subscribe to population changes
    const unsubscribe = seriesPopulationService.subscribe(() => {
      setPopulationUpdate(prev => prev + 1);
    });

    // Subscribe to completion notifications
    const unsubscribeCompletion = seriesPopulationService.subscribeToCompletion((seriesId) => {
      // Find the series name for the notification
      const completedSeries = movies?.find(m => m.id === seriesId);
      toast({
        title: "🎉 Series Ready!",
        description: `${completedSeries?.title || 'Your series'} has been fully curated with all episodes and seasons!`,
      });
    });
    
    return () => {
      unsubscribe();
      unsubscribeCompletion();
    };
  }, [movies, toast]);

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
    ).map(movie => ({
      ...movie,
      isPopulating: seriesPopulationService.isPopulating(movie.id)
    }));
    
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
    
    // Date filter logic
    if (dateFilter) {
      filtered = filtered.filter(movie => {
        if (!movie.watchDate) return false;
        
        const movieDate = new Date(movie.watchDate);
        
        if (dateFilter.type === 'specific' && dateFilter.date) {
          const filterDate = new Date(dateFilter.date);
          return movieDate.toDateString() === filterDate.toDateString();
        }
        
        if (dateFilter.type === 'month' && dateFilter.month) {
          const [year, month] = dateFilter.month.split('-');
          return movieDate.getFullYear() === parseInt(year) && 
                 movieDate.getMonth() === parseInt(month) - 1;
        }
        
        return false;
      });
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
  }, [movies, searchQuery, activeTab, statusFilter, genreFilter, platformFilter, dateFilter, selectedGenre, populationUpdate]);

  const handleAddMovie = async () => {
    await refetch();
    setShowAddDialog(false);
    // Force update of population status
    setPopulationUpdate(prev => prev + 1);
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
    setDateFilter(null);
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
              dateFilter={dateFilter}
              onStatusChange={setStatusFilter}
              onGenreChange={setGenreFilter}
              onPlatformChange={setPlatformFilter}
              onDateFilterChange={setDateFilter}
              onClearFilters={clearFilters}
              genres={uniqueGenres}
              platforms={uniquePlatforms}
            />
            {dateFilter && (
              <FilteredResultsCount 
                movies={filteredMovies} 
                dateFilter={dateFilter} 
              />
            )}
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
          user={user}
        />

        <div className="mt-6">
          <PageTransition triggerKey={activeTab}>
            {renderContent()}
          </PageTransition>
        </div>
        
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