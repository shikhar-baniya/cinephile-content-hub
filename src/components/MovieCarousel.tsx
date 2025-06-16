
import { useMemo } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import MovieCard, { Movie } from "./MovieCard";

interface MovieCarouselProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const MovieCarousel = ({ movies, onMovieClick }: MovieCarouselProps) => {
  const collections = useMemo(() => {
    if (!movies || !Array.isArray(movies) || movies.length === 0) {
      return {
        recentlyAdded: [],
        highlyRated: [],
        currentlyWatching: []
      };
    }

    // Get recently added (by createdAt date)
    const recentlyAdded = [...movies]
      .filter(m => m && m.createdAt)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);

    // Get highly rated movies (8+ rating)
    const highlyRated = movies
      .filter(m => m && m.status === "watched" && typeof m.rating === 'number' && m.rating >= 8)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);

    // Get currently watching
    const currentlyWatching = movies.filter(m => m && m.status === "watching").slice(0, 10);

    return {
      recentlyAdded,
      highlyRated,
      currentlyWatching
    };
  }, [movies]);

  const CarouselSection = ({ title, movies, badgeCount }: { title: string; movies: Movie[]; badgeCount: number }) => {
    if (!movies || movies.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Badge variant="outline" className="text-xs">
            {badgeCount} {badgeCount === 1 ? 'item' : 'items'}
          </Badge>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {movies.map((movie) => (
              <CarouselItem key={movie.id} className="pl-2 md:pl-4 basis-36">
                <div className="p-1">
                  <MovieCard movie={movie} onClick={onMovieClick} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 h-8 w-8 bg-black/50 border-white/20 text-white hover:bg-black/70" />
          <CarouselNext className="right-2 h-8 w-8 bg-black/50 border-white/20 text-white hover:bg-black/70" />
        </Carousel>
      </div>
    );
  };

  // Don't render anything if no movies
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground">No movies in your collection yet. Add some movies to see collections!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CarouselSection 
        title="Recently Added" 
        movies={collections.recentlyAdded}
        badgeCount={collections.recentlyAdded.length}
      />
      
      <CarouselSection 
        title="Highly Rated" 
        movies={collections.highlyRated}
        badgeCount={collections.highlyRated.length}
      />
      
      {collections.currentlyWatching.length > 0 && (
        <CarouselSection 
          title="Currently Watching" 
          movies={collections.currentlyWatching}
          badgeCount={collections.currentlyWatching.length}
        />
      )}
    </div>
  );
};

export default MovieCarousel;
