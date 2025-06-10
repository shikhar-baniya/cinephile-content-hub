
import MovieCard, { Movie } from "./MovieCard";

interface MovieGridProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const MovieGrid = ({ movies, onMovieClick }: MovieGridProps) => {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">No movies found</div>
        <div className="text-sm text-muted-foreground mt-2">
          Try adjusting your search or add your first movie!
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onClick={onMovieClick}
        />
      ))}
    </div>
  );
};

export default MovieGrid;
