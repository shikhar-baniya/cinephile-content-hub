
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import MovieCard, { Movie } from "./MovieCard";

interface GenreCollectionsProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const GenreCollections = ({ movies, onMovieClick }: GenreCollectionsProps) => {
  const collections = useMemo(() => {
    // Group by genre
    const byGenre = movies.reduce((acc, movie) => {
      if (!acc[movie.genre]) {
        acc[movie.genre] = [];
      }
      acc[movie.genre].push(movie);
      return acc;
    }, {} as Record<string, Movie[]>);

    // Get most watched movies (highest rated watched movies)
    const mostWatched = movies
      .filter(m => m.status === "watched" && m.rating >= 8)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);

    // Get recently added (last 6 movies)
    const recentlyAdded = [...movies]
      .sort((a, b) => parseInt(b.id) - parseInt(a.id))
      .slice(0, 6);

    // Get currently watching
    const currentlyWatching = movies.filter(m => m.status === "watching");

    return {
      byGenre,
      mostWatched,
      recentlyAdded,
      currentlyWatching
    };
  }, [movies]);

  const CollectionRow = ({ title, movies, subtitle }: { title: string; movies: Movie[]; subtitle?: string }) => {
    if (movies.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <Badge variant="outline" className="text-xs">
            {movies.length} {movies.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-32">
              <MovieCard movie={movie} onClick={onMovieClick} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <CollectionRow 
        title="Most Rated" 
        movies={collections.mostWatched}
        subtitle="Your highest rated movies"
      />
      
      <CollectionRow 
        title="Recently Added" 
        movies={collections.recentlyAdded}
        subtitle="Latest additions to your collection"
      />
      
      {collections.currentlyWatching.length > 0 && (
        <CollectionRow 
          title="Currently Watching" 
          movies={collections.currentlyWatching}
          subtitle="Movies and series you're watching now"
        />
      )}
      
      {Object.entries(collections.byGenre)
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 3)
        .map(([genre, genreMovies]) => (
          <CollectionRow 
            key={genre}
            title={genre}
            movies={genreMovies.slice(0, 6)}
            subtitle={`${genreMovies.length} ${genre.toLowerCase()} ${genreMovies.length === 1 ? 'movie' : 'movies'}`}
          />
        ))}
    </div>
  );
};

export default GenreCollections;
