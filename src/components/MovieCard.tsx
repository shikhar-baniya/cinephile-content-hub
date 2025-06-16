
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
  watchDate?: string;
  notes?: string;
  createdAt: string;
}

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

const MovieCard = ({ movie, onClick }: MovieCardProps) => {
  const getStatusIcon = () => {
    switch (movie.status) {
      case "watched":
        return <Eye className="h-4 w-4" />;
      case "watching":
        return <Play className="h-4 w-4" />;
      case "want-to-watch":
        return <Clock className="h-4 w-4" />;
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
      <div className="aspect-[2/3] bg-gradient-to-br from-secondary to-secondary/50 rounded-lg mb-3 overflow-hidden relative flex-shrink-0">
        {movie.poster ? (
          <img 
            src={movie.poster} 
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className={`${getStatusColor()} text-xs`}>
            {getStatusIcon()}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2 flex-grow flex flex-col">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors flex-grow">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <span>{movie.releaseYear}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{movie.rating}/10</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs border-border/60 truncate max-w-[70%]">
            {movie.genre.split(',')[0].trim()}
          </Badge>
          <span className="text-xs text-muted-foreground truncate max-w-[50%]">{movie.platform}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
