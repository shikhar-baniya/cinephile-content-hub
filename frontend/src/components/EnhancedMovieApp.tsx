import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Movie } from "./MovieCard";
import MovieList from "./MovieList";
import MovieDetailDialog from "./MovieDetailDialog.api";
import AddMovieDialog from "./AddMovieDialog.api";
import { movieService } from "@/services/databaseService.api";
import { seriesPopulationService } from "@/services/seriesPopulationService";

/**
 * Enhanced Movie App with all new features:
 * 1. TMDB ID storage and season fetching
 * 2. Watch date functionality
 * 3. Advanced filtering and search
 * 4. Statistics dashboard
 * 5. Poster preview
 * 6. Season-specific posters and ratings
 * 7. Export functionality
 * 8. Smart auto-completion
 */
const EnhancedMovieApp = () => {
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [populationUpdate, setPopulationUpdate] = useState(0);

  // Load movies
  const loadMovies = async () => {
    setIsLoading(true);
    try {
      const data = await movieService.getMovies();
      setMovies(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load movies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
    
    // Subscribe to population changes
    const unsubscribe = seriesPopulationService.subscribe(() => {
      setPopulationUpdate(prev => prev + 1);
    });

    // Subscribe to completion notifications
    const unsubscribeCompletion = seriesPopulationService.subscribeToCompletion((seriesId) => {
      // Find the series name for the notification
      const completedSeries = movies.find(m => m.id === seriesId);
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

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDetailDialogOpen(true);
  };

  const handleAddMovie = () => {
    setIsAddDialogOpen(true);
  };

  const handleMovieAdded = () => {
    loadMovies();
    setIsAddDialogOpen(false);
    // Force update of population status
    setPopulationUpdate(prev => prev + 1);
    toast({
      title: "🎬 Series Added!",
      description: "Your series is being curated with all episodes and seasons. This may take 1-2 minutes.",
    });
  };

  const handleMovieUpdated = () => {
    loadMovies();
    setIsDetailDialogOpen(false);
    toast({
      title: "Success",
      description: "Movie updated successfully!",
    });
  };

  const handleMovieDeleted = () => {
    loadMovies();
    setIsDetailDialogOpen(false);
    toast({
      title: "Success",
      description: "Movie removed from your collection!",
    });
  };

  const handleEditMovie = (movie: Movie) => {
    // Close detail dialog and open edit dialog
    setIsDetailDialogOpen(false);
    setSelectedMovie(movie);
    // You can implement edit functionality here
    // For now, we'll just show a toast
    toast({
      title: "Edit Mode",
      description: "Edit functionality can be implemented here",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading your collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MovieList
        key={populationUpdate}
        movies={movies.map(movie => ({
          ...movie,
          isPopulating: seriesPopulationService.isPopulating(movie.id)
        }))}
        onMovieClick={handleMovieClick}
        onAddMovie={handleAddMovie}
        onEditMovie={handleEditMovie}
        onDeleteMovie={handleMovieDeleted}
        onUpdateMovies={loadMovies}
      />

      {/* Movie Detail Dialog */}
      <MovieDetailDialog
        movie={selectedMovie}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onEdit={handleEditMovie}
        onDelete={handleMovieDeleted}
        onUpdate={handleMovieUpdated}
      />

      {/* Add Movie Dialog */}
      <AddMovieDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddMovie={handleMovieAdded}
      />
    </div>
  );
};

export default EnhancedMovieApp;