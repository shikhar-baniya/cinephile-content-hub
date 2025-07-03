import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Calendar, Play, Eye, Clock, Film, Edit, Trash2, RefreshCw, Save, X } from "lucide-react";
import { Movie } from "./MovieCard";
import { movieService } from "@/services/databaseService.api";
import { fetchTVShowDetails } from "@/services/movieService";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import SeriesDetailDialog from "./SeriesDetailDialog";

interface MovieDetailDialogProps {
  movie: Movie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (movie: Movie) => void;
  onDelete?: () => void;
  onUpdate?: () => void;
}

const MovieDetailDialog = ({ movie, open, onOpenChange, onEdit, onDelete, onUpdate }: MovieDetailDialogProps) => {
  // If this is a series, use the SeriesDetailDialog instead
  if (movie?.category === 'Series') {
    return (
      <SeriesDetailDialog
        series={movie}
        isOpen={open}
        onClose={() => onOpenChange(false)}
        onSeriesUpdate={(updatedSeries) => {
          if (onUpdate) onUpdate();
        }}
      />
    );
  }
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Movie['status']>(movie?.status || 'want-to-watch');
  
  // Additional editing states
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedRating, setEditedRating] = useState(movie?.rating || 5);
  const [editedSeason, setEditedSeason] = useState(movie?.season || '');
  const [editedNotes, setEditedNotes] = useState(movie?.notes || '');
  const [editedPoster, setEditedPoster] = useState(movie?.poster || '');
  const [editedWatchDate, setEditedWatchDate] = useState(movie?.watchDate || '');
  const [availableSeasons, setAvailableSeasons] = useState<{ season_number: number; name: string; poster_path?: string; vote_average?: number }[]>([]);
  const [isFetchingSeasons, setIsFetchingSeasons] = useState(false);
  const [showPosterPreview, setShowPosterPreview] = useState(false);

  // Update current status when movie changes
  useEffect(() => {
    if (movie) {
      setCurrentStatus(movie.status);
      setEditedRating(movie.rating || 5);
      setEditedSeason(movie.season || '');
      setEditedNotes(movie.notes || '');
      setEditedPoster(movie.poster || '');
      setEditedWatchDate(movie.watchDate || '');
      setIsEditingDetails(false);
      setAvailableSeasons([]);
      setShowPosterPreview(false);
    }
  }, [movie]);

  // Fetch seasons when editing a series
  const fetchSeasonsForSeries = async () => {
    if (!movie || movie.category !== 'Series') return;
    
    setIsFetchingSeasons(true);
    try {
      if (movie.tmdbId) {
        console.log('Fetching seasons for TMDB ID:', movie.tmdbId);
        const details = await fetchTVShowDetails(movie.tmdbId);
        console.log('TV show details received:', details);
        
        if (details && details.seasons) {
          const seasons = details.seasons.map((s: any) => ({
            season_number: s.season_number,
            name: s.name || `Season ${s.season_number}`,
            poster_path: s.poster_path,
            vote_average: s.vote_average
          }));
          console.log('Processed seasons:', seasons);
          setAvailableSeasons(seasons);
        }
      } else {
        console.log('No TMDB ID available for season fetching');
        setAvailableSeasons([]);
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
      setAvailableSeasons([]);
    } finally {
      setIsFetchingSeasons(false);
    }
  };

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
      
      // If status changed to "watched", show editing options and set watch date
      if (newStatus === 'watched') {
        setIsEditingDetails(true);
        fetchSeasonsForSeries();
        // Set watch date to today if not already set
        if (!editedWatchDate) {
          setEditedWatchDate(new Date().toISOString().split('T')[0]);
        }
      }
      
      toast({
        title: "Success",
        description: "Movie status updated successfully!",
      });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
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

  const handleSaveDetails = async () => {
    if (!movie?.id || isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      const updates: any = {
        rating: editedRating,
        notes: editedNotes,
        poster: editedPoster,
        watch_date: editedWatchDate || null,
      };
      
      // Only add season if it's a series
      if (movie.category === 'Series') {
        updates.season = editedSeason;
      }
      
      await movieService.updateMovie(movie.id, updates);
      
      toast({
        title: "Success",
        description: "Movie details updated successfully!",
      });
      
      setIsEditingDetails(false);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update movie details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSeasonChange = (seasonNumber: string) => {
    setEditedSeason(seasonNumber);
    
    // Update poster and rating if season has specific data
    if (availableSeasons.length > 0) {
      const selectedSeason = availableSeasons.find(s => s.season_number.toString() === seasonNumber);
      if (selectedSeason) {
        if (selectedSeason.poster_path) {
          const newPoster = `https://image.tmdb.org/t/p/w500${selectedSeason.poster_path}`;
          setEditedPoster(newPoster);
          setShowPosterPreview(true);
        }
        if (selectedSeason.vote_average) {
          const seasonRating = Math.round(selectedSeason.vote_average * 10) / 10;
          setEditedRating(seasonRating);
        }
      }
    }
  };

  const handleCancelEditing = () => {
    setIsEditingDetails(false);
    setEditedRating(movie?.rating || 5);
    setEditedSeason(movie?.season || '');
    setEditedNotes(movie?.notes || '');
    setEditedPoster(movie?.poster || '');
    setEditedWatchDate(movie?.watchDate || '');
    setShowPosterPreview(false);
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
      <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-lg border-border/40 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-0">
          <div className="flex items-start gap-4">
            <div className="aspect-[2/3] w-32 bg-gradient-to-br from-secondary to-secondary/50 rounded-lg overflow-hidden flex-shrink-0">
              {(isEditingDetails ? editedPoster : movie.poster) ? (
                <img 
                  src={isEditingDetails ? editedPoster : movie.poster} 
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
                
                {/* Edit Details Button for Watched Movies */}
                {currentStatus === 'watched' && !isEditingDetails && (
                  <div className="flex items-center gap-3 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditingDetails(true);
                        fetchSeasonsForSeries();
                      }}
                      className="gap-2"
                    >
                      <Edit className="h-3 w-3" />
                      Edit Details
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{movie.releaseYear}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{isEditingDetails ? editedRating : movie.rating}/10</span>
                  </div>
                  {movie.category === "Series" && (movie.season || editedSeason) && (
                    <div className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      <span>{isEditingDetails ? editedSeason : movie.season}</span>
                    </div>
                  )}
                  {currentStatus === "watched" && (movie.watchDate || editedWatchDate) && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">
                        {isEditingDetails && editedWatchDate 
                          ? new Date(editedWatchDate).toLocaleDateString('en-US', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : movie.watchDate 
                            ? new Date(movie.watchDate).toLocaleDateString('en-US', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })
                            : 'Today'
                        }
                      </span>
                    </div>
                  )}
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
        
        {/* Editing Section for Watched Movies */}
        {currentStatus === 'watched' && isEditingDetails && (
          <div className="border rounded-lg mx-6 mt-4 p-4 space-y-4 bg-secondary/20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Update Details</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveDetails} disabled={isUpdating}>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEditing}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Rating */}
              <div className="space-y-2">
                <Label htmlFor="rating" className="text-sm">Rating (1-10)</Label>
                <Input
                  id="rating"
                  type="number"
                  value={editedRating}
                  onChange={(e) => setEditedRating(parseFloat(e.target.value) || 5)}
                  min="1"
                  max="10"
                  step="0.1"
                  className="w-full"
                />
              </div>
              
              {/* Season (only for Series) */}
              {movie.category === 'Series' && (
                <div className="space-y-2">
                  <Label htmlFor="season" className="text-sm">Season</Label>
                  {availableSeasons.length > 0 ? (
                    <Select
                      value={editedSeason}
                      onValueChange={handleSeasonChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSeasons.map((season) => (
                          <SelectItem key={season.season_number} value={season.season_number.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{season.name}</span>
                              {season.vote_average && (
                                <span className="text-xs text-muted-foreground">
                                  ⭐ {season.vote_average.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="season"
                      value={editedSeason}
                      onChange={(e) => handleSeasonChange(e.target.value)}
                      placeholder="e.g., Season 1, S1, 1"
                      className="w-full"
                    />
                  )}
                  {isFetchingSeasons && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Loading seasons...
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Notes & Review</Label>
                <Textarea
                  id="notes"
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Add your thoughts, review, or notes..."
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>
            
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-4" style={{marginTop: currentStatus === 'watched' && isEditingDetails ? '16px' : '24px'}}>

          
          {(movie.notes || (isEditingDetails && editedNotes)) && !isEditingDetails && (
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
              size="sm"
              disabled={isDeleting}
              className="p-2"
              title={isDeleting ? "Deleting..." : "Delete"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailDialog;