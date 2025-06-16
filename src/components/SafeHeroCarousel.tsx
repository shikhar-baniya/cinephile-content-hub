// Safe wrapper for HeroCarousel with extensive error checking
import { useState, useEffect } from "react";
import { Movie } from "./MovieCard";
import HeroCarousel from "./HeroCarousel";

interface SafeHeroCarouselProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const SafeHeroCarousel = ({ movies, onMovieClick }: SafeHeroCarouselProps) => {
  const [safeMovies, setSafeMovies] = useState<Movie[]>([]);

  useEffect(() => {
    // Comprehensive validation and sanitization
    const validated = (movies || [])
      .filter((movie, index) => {
        try {
          // Check if movie exists and is an object
          if (!movie || typeof movie !== 'object') {
            console.warn(`SafeHeroCarousel: Invalid movie at index ${index}:`, movie);
            return false;
          }

          // Check required properties
          const requiredProps = ['id', 'title'];
          for (const prop of requiredProps) {
            if (!movie[prop as keyof Movie]) {
              console.warn(`SafeHeroCarousel: Missing required property '${prop}' at index ${index}:`, movie);
              return false;
            }
          }

          // Check if properties are the right type
          if (typeof movie.title !== 'string') {
            console.warn(`SafeHeroCarousel: Invalid title type at index ${index}:`, movie);
            return false;
          }

          if (typeof movie.rating !== 'number' || movie.rating < 0 || movie.rating > 10) {
            console.warn(`SafeHeroCarousel: Invalid rating at index ${index}:`, movie);
            return false;
          }

          return true;
        } catch (error) {
          console.error(`SafeHeroCarousel: Error validating movie at index ${index}:`, error);
          return false;
        }
      })
      .map(movie => ({
        ...movie,
        // Ensure poster has a fallback
        poster: movie.poster || undefined,
        // Ensure genre is a string
        genre: movie.genre || 'Unknown',
        // Ensure platform is a string
        platform: movie.platform || 'Unknown',
        // Ensure status is valid
        status: ['watched', 'watching', 'want-to-watch'].includes(movie.status) 
          ? movie.status 
          : 'want-to-watch' as const,
      }));

    setSafeMovies(validated);

    if (process.env.NODE_ENV === 'development') {
      console.log(`SafeHeroCarousel: Validated ${validated.length} out of ${movies?.length || 0} movies`);
    }
  }, [movies]);

  const handleMovieClick = (movie: Movie) => {
    try {
      if (movie && movie.id && movie.title) {
        onMovieClick(movie);
      } else {
        console.error('SafeHeroCarousel: Attempted to click invalid movie:', movie);
      }
    } catch (error) {
      console.error('SafeHeroCarousel: Error handling movie click:', error);
    }
  };

  try {
    return <HeroCarousel movies={safeMovies} onMovieClick={handleMovieClick} />;
  } catch (error) {
    console.error('SafeHeroCarousel: Error rendering HeroCarousel:', error);
    return (
      <div className="h-96 md:h-[500px] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl mb-6 flex items-center justify-center">
        <div className="text-white/70 text-center">
          <div className="text-4xl mb-2">🎬</div>
          <div>Featured content temporarily unavailable</div>
        </div>
      </div>
    );
  }
};

export default SafeHeroCarousel;