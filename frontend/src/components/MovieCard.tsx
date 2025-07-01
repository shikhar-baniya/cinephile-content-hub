import { Star, Calendar, Play, Eye, Clock, Film } from "lucide-react";
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
  createdAt: string;
  updatedAt: string;
}

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

const MovieCard = ({ movie, onClick }: MovieCardProps) => {
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
      className="movie-card cursor-pointer group animate-fade-in h-full flex flex-col"
      onClick={() => onClick(movie)}
    >
      <div className="relative aspect-[2/3] bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl mb-3 overflow-hidden flex-shrink-0">
        {movie.poster ? (
          <img 
            src={movie.poster} 
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
      
      <div className="space-y-2 flex-grow flex flex-col px-1">
        <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {movie.releaseYear}
          </span>
          <span className="text-xs text-muted-foreground/80 truncate max-w-[60%]">
            {movie.platform}
          </span>
        </div>
        
        {/* Season info for Series */}
        {movie.category === "Series" && movie.season && (
          <div className="flex items-center gap-1 text-xs text-primary/80">
            <Play className="h-3 w-3" />
            <span>{movie.season}</span>
          </div>
        )}
        
        {/* Watch date for watched movies */}
        {movie.status === "watched" && movie.watchDate && (
          <div className="flex items-center gap-1 text-xs text-green-400/80">
            <Eye className="h-3 w-3" />
            <span>Watched {new Date(movie.watchDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
