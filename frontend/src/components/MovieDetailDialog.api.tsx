import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Calendar, Play, Eye, Clock, Film, Edit, Trash2, RefreshCw } from "lucide-react";
import { Movie } from "./MovieCard";
import { movieService } from "@/services/databaseService.api";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

interface MovieDetailDialogProps {
  movie: Movie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (movie: Movie) => void;
  onDelete?: () => void;
  onUpdate?: () => void;
}

const MovieDetailDialog = ({ movie, open, onOpenChange, onEdit, onDelete, onUpdate }: MovieDetailDialogProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Movie['status']>(movie?.status || 'want-to-watch');

  // Update current status when movie changes
  useEffect(() => {
    if (movie) {
      setCurrentStatus(movie.status);
    }
  }, [movie]);

  if (!movie) return null;

  const getStatusIcon = (status: Movie['status'] = currentStatus) => {
    switch (status) {
      case "watched":
        return <Eye className="h-4 w-4" />;
      case "watching":
        return <Play className="h-4 w-4" />;
      case "want-to-watch":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Movie['status'] = currentStatus) => {
    switch (status) {
      case "watched":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "watching":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "want-to-watch":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getStatusText = (status: Movie['status'] = currentStatus) => {
    switch (status) {
      case "watched":
        return "Watched";
      case "watching":
        return "Currently Watching";
      case "want-to-watch":
        return "Want to Watch";
      default:
        return "Want to Watch";
    }
  };

  const handleStatusUpdate = async (newStatus: Movie['status']) => {
    if (!movie?.id || newStatus === currentStatus || isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      await movieService.updateMovie(movie.id, { status: newStatus });
      
      setCurrentStatus(newStatus);
      
      toast({
        title: "Success",
        description: "Movie status updated successfully!",
      });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error updating movie status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update movie status. Please try again.",
        variant: "destructive",
      });
      // Reset to original status on error
      if (movie?.status) {
        setCurrentStatus(movie.status);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!movie?.id) return;
    
    setIsDeleting(true);
    
    try {
      await movieService.deleteMovie(movie.id);
      
      toast({
        title: "Success",
        description: "Movie deleted from your collection!",
      });
      
      if (onDelete) {
        onDelete();
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error deleting movie:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete movie. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-lg border-border/40 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-0">
          <div className="flex items-start gap-4">
            <div className="aspect-[2/3] w-32 bg-gradient-to-br from-secondary to-secondary/50 rounded-lg overflow-hidden flex-shrink-0">
              {movie.poster ? (
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold gradient-text mb-2 line-clamp-2">
                {movie.title}
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(currentStatus)} text-sm`}>
                      {getStatusIcon(currentStatus)}
                      <span className="ml-1">{getStatusText(currentStatus)}</span>
                    </Badge>
                    {isUpdating && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                </div>
                
                {/* Status Change Section */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm font-medium text-muted-foreground">Change Status:</span>
                  <Select
                    value={currentStatus}
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-auto min-w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="want-to-watch">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          Want to Watch
                        </div>
                      </SelectItem>
                      <SelectItem value="watching">
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4 text-blue-500" />
                          Currently Watching
                        </div>
                      </SelectItem>
                      <SelectItem value="watched">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-green-500" />
                          Watched
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{movie.releaseYear}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{movie.rating}/10</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-sm">
                    {movie.genre}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {movie.platform}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {movie.watchDate && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Watch Date</h3>
              <p className="text-sm text-muted-foreground">{movie.watchDate}</p>
            </div>
          )}
          
          {movie.notes && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Notes & Review</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{movie.notes}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(movie)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              className="gap-2"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailDialog;