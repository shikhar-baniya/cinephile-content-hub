
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import MovieCard, { Movie } from "./MovieCard";

interface GenreCollectionsProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const GenreCollections = ({ movies, onMovieClick }: GenreCollectionsProps) => {
  const collections = useMemo(() => {
    // Add safety check for movies array
    if (!movies || !Array.isArray(movies) || movies.length === 0) {
      return {
        byGenre: {},
        mostWatched: [],
        recentlyAdded: [],
        currentlyWatching: []
      };
    }

    // Group by genre (handle comma-separated genres)
    const byGenre = movies.reduce((acc, movie) => {
      if (!movie || !movie.genre) return acc;
      
      // Split comma-separated genres and process each one
      const movieGenres = movie.genre.split(',').map(g => g.trim());
      
      movieGenres.forEach(genre => {
        if (!acc[genre]) {
          acc[genre] = [];
        }
        acc[genre].push(movie);
      });
      
      return acc;
    }, {} as Record<string, Movie[]>);

    // Get most watched movies (highest rated watched movies)
    const mostWatched = movies
      .filter(m => m && m.status === "watched" && typeof m.rating === 'number' && m.rating >= 8)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);

    // Get recently added (by createdAt date)
    const recentlyAdded = [...movies]
      .filter(m => m && m.createdAt)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 6);

    // Get currently watching
    const currentlyWatching = movies.filter(m => m && m.status === "watching");

    return {
      byGenre,
      mostWatched,
      recentlyAdded,
      currentlyWatching
    };
  }, [movies]);

  const CollectionRow = ({ title, movies }: { title: string; movies: Movie[] }) => {
    if (!movies || movies.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Badge variant="outline" className="text-xs">
            {movies.length} {movies.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-36">
              <MovieCard movie={movie} onClick={onMovieClick} showWatchedDate={false} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Don't render anything if no movies
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No movies in your collection yet. Add some movies to see collections!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CollectionRow 
        title="Recently Added" 
        movies={collections.recentlyAdded}
      />
      
      <CollectionRow 
        title="Highly Rated" 
        movies={collections.mostWatched}
      />
      
      {collections.currentlyWatching.length > 0 && (
        <CollectionRow 
          title="Currently Watching" 
          movies={collections.currentlyWatching}
        />
      )}
      
      {Object.entries(collections.byGenre)
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 4)
        .map(([genre, genreMovies]) => (
          <CollectionRow 
            key={genre}
            title={`${genre} Collection`}
            movies={genreMovies.slice(0, 6)}
          />
        ))}
    </div>
  );
};

export default GenreCollections;
