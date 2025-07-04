import { Star, Calendar, Play, Eye, Clock, Film, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Movie {
  id: string;
  title: string;
  genre: string;
  category: "Movie" | "Series" | "Short-Film";
  releaseYear: number;
  platform: string;
  rating: number;
  status: "watched" | "watching" | "want-to-watch";
  poster?: string;
  notes?: string;
  season?: string;
  tmdbId?: number;
  watchDate?: string;
  latestSeasonWatched?: number;
  totalSeasonsAvailable?: number;
  overallRating?: number;
  overallNotes?: string;
  createdAt: string;
  updatedAt: string;
  isPopulating?: boolean;
}

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  showWatchedDate?: boolean;
}

const MovieCard = ({ movie, onClick, showWatchedDate = true }: MovieCardProps) => {
  // Get current season's poster for series
  const getCurrentPoster = () => {
    if (movie.category !== 'Series') return movie.poster;
    
    // For series, we would need season data to determine the current season's poster
    // This would require fetching season data which might be expensive for the card view
    // For now, use the main poster, but this could be enhanced with cached season data
    return movie.poster;
  };
  const getStatusIcon = () => {
    switch (movie.status) {
      case "watched":
        return <Eye className="h-3 w-3" />;
      case "watching":
        return <Play className="h-3 w-3" />;
      case "want-to-watch":
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (movie.status) {
      case "watched":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "watching":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "want-to-watch":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  return (
    <div 
      className={`movie-card group animate-fade-in h-full flex flex-col w-full min-w-0 ${
        movie.isPopulating ? 'cursor-wait' : 'cursor-pointer'
      }`}
      onClick={() => {
        if (!movie.isPopulating) {
          onClick(movie);
        }
      }}
    >
      <div className="relative aspect-[2/3] bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl mb-3 overflow-hidden flex-shrink-0">
        {getCurrentPoster() ? (
          <img 
            src={getCurrentPoster()} 
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-pink-900/50">
            <Film className="h-12 w-12 text-white/60" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Loading overlay for series being populated */}
        {movie.isPopulating && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-white text-sm">Loading episodes...</p>
            </div>
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge className={`${getStatusColor()} text-xs px-2 py-1`}>
            {getStatusIcon()}
          </Badge>
        </div>

        {/* Rating */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-xs font-medium">{movie.rating}</span>
          </div>
        </div>

        {/* Genre tags at bottom */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex flex-wrap gap-1">
            {movie.genre.split(',').slice(0, 2).map((genre, index) => (
              <Badge 
                key={index} 
                className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm"
              >
                #{genre.trim().toLowerCase()}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-2 flex-grow flex flex-col px-1 min-w-0 overflow-hidden">
        <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground min-w-0">
          <span className="flex items-center gap-1 shrink-0">
            <Calendar className="h-3 w-3" />
            {movie.releaseYear}
          </span>
          <span className="text-xs text-muted-foreground/80 truncate min-w-0 max-w-[60%]">
            {movie.platform}
          </span>
        </div>
        
        {/* Season info for Series */}
        {movie.category === "Series" && movie.season && (
          <div className="flex items-center gap-1 text-xs text-primary/80 min-w-0">
            <Play className="h-3 w-3 shrink-0" />
            <span className="truncate min-w-0">{movie.season}</span>
          </div>
        )}
        
        {/* Watch date for watched movies */}
        {showWatchedDate && movie.status === "watched" && movie.watchDate && (
          <div className="flex items-center gap-1 text-xs text-green-400/80 min-w-0">
            <Eye className="h-3 w-3 shrink-0" />
            <span className="truncate min-w-0">Watched {new Date(movie.watchDate).toLocaleDateString('en-US', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
