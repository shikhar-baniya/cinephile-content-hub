
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Movie } from "./MovieCard";

interface HeroCarouselProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const HeroCarousel = ({ movies, onMovieClick }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get featured movies (highly rated or recently added)
  const featuredMovies = (movies || [])
    .filter(movie => {
      // Extra validation
      const isValid = movie && 
                     movie.id && 
                     movie.title && 
                     movie.poster && 
                     (movie.rating >= 7 || movie.status === "watching");
      
      if (process.env.NODE_ENV === 'development' && !isValid && movie) {
        console.warn('HeroCarousel: Filtering out invalid movie', {
          id: movie.id,
          title: movie.title,
          poster: !!movie.poster,
          rating: movie.rating,
          status: movie.status
        });
      }
      
      return isValid;
    })
    .slice(0, 5);

  // Reset currentIndex when featuredMovies changes or becomes empty
  useEffect(() => {
    if (featuredMovies.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= featuredMovies.length) {
      setCurrentIndex(0);
    }
  }, [featuredMovies.length, currentIndex]);

  useEffect(() => {
    // Don't start auto-play if there are no featured movies
    if (featuredMovies.length <= 1) return;

    const timer = setInterval(() => {
      if (!isAnimating && featuredMovies.length > 1) {
        nextSlide();
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, isAnimating, featuredMovies.length]);

  const nextSlide = () => {
    if (isAnimating || featuredMovies.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevSlide = () => {
    if (isAnimating || featuredMovies.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Early return if no featured movies or empty array
  if (!featuredMovies || featuredMovies.length === 0) {
    return null;
  }

  // Ensure currentIndex is within bounds and valid
  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, featuredMovies.length - 1));
  const currentMovie = featuredMovies[safeCurrentIndex];

  // Additional safety check for currentMovie
  if (!currentMovie || !currentMovie.id || !currentMovie.title) {
    console.warn('HeroCarousel: Invalid currentMovie', { currentMovie, featuredMovies, currentIndex, safeCurrentIndex });
    return null;
  }

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden rounded-2xl mb-6">
      {/* Background Image */}
      <div className="absolute inset-0">
        {currentMovie.poster ? (
          <img
            src={currentMovie.poster}
            alt={currentMovie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
            <div className="text-white/50 text-6xl">🎬</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 line-clamp-2">
            {currentMovie.title}
          </h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white font-medium">{currentMovie.rating}/10</span>
            </div>
            <Badge variant="outline" className="text-white border-white/30">
              {currentMovie.genre}
            </Badge>
            <span className="text-white/80">{currentMovie.releaseYear}</span>
          </div>

          <Button 
            onClick={() => onMovieClick(currentMovie)}
            className="bg-white text-black hover:bg-white/90 font-semibold mb-4"
          >
            <Play className="h-4 w-4 mr-2" />
            View Details
          </Button>

          {/* Dots Indicator - moved below button and centered */}
          {featuredMovies.length > 1 && (
            <div className="flex justify-center gap-2">
              {featuredMovies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setCurrentIndex(index);
                      setTimeout(() => setIsAnimating(false), 300);
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      {featuredMovies.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            disabled={isAnimating}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            disabled={isAnimating}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
};

export default HeroCarousel;
