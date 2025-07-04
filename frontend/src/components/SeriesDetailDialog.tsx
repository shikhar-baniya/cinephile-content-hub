import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Calendar, Play, Eye, Clock, ChevronDown, ChevronRight, Check, X, RefreshCw, Film, Edit, Save, Trash2 } from "lucide-react";
import { Movie } from "./MovieCard";
import { SeriesSeason, SeriesEpisode, seriesService, EpisodeStats } from "@/services/seriesService";
import { tmdbService } from "@/services/tmdbService";
import { enhancedSeriesService } from "@/services/enhancedSeriesService";
import { debugBackend } from "@/utils/debugBackend";
import { cn } from "@/lib/utils";
import { movieService } from "@/services/databaseService.api";
import { useToast } from "@/components/ui/use-toast";

interface SeriesDetailDialogProps {
  series: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onSeriesUpdate: (updatedSeries: Movie) => void;
  onDelete?: () => void;
}

const SeriesDetailDialog = ({ series, isOpen, onClose, onSeriesUpdate, onDelete }: SeriesDetailDialogProps) => {
  const { toast } = useToast();
  const [seasons, setSeasons] = useState<SeriesSeason[]>([]);
  const [episodesBySeason, setEpisodesBySeason] = useState<Record<string, SeriesEpisode[]>>({});
  const [episodeStats, setEpisodeStats] = useState<Record<string, EpisodeStats>>({});
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [isPopulatingTMDB, setIsPopulatingTMDB] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const [seasonRating, setSeasonRating] = useState<number>(5);
  const [seasonNotes, setSeasonNotes] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current season's poster or fallback to series poster
  const getCurrentPoster = () => {
    if (seasons.length === 0) return series?.poster;
    
    // Find the current season being watched (priority: watching > latest watched)
    const watchingSeason = seasons.find(s => s.status === 'watching');
    if (watchingSeason?.posterPath) {
      return `https://image.tmdb.org/t/p/w500${watchingSeason.posterPath}`;
    }
    
    // If no watching season, find the latest completed season
    const completedSeasons = seasons.filter(s => s.status === 'completed').sort((a, b) => b.seasonNumber - a.seasonNumber);
    if (completedSeasons.length > 0 && completedSeasons[0].posterPath) {
      return `https://image.tmdb.org/t/p/w500${completedSeasons[0].posterPath}`;
    }
    
    // Fallback to series poster
    return series?.poster;
  };

  const handleDelete = async () => {
    if (!series) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete "${series.title}"? This action cannot be undone.`);
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      await movieService.deleteMovie(series.id);
      
      toast({
        title: "Success",
        description: "Series deleted from your collection!",
      });
      
      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (error: any) {
      console.error('Error deleting series:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete series. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch series data when dialog opens
  useEffect(() => {
    if (isOpen && series && series.category === 'Series') {
      fetchSeriesData();
    }
  }, [isOpen, series]);

  const fetchSeriesData = async () => {
    if (!series) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching series data for:', series.id, series.title);
      const data = await seriesService.getCompleteSeriesData(series.id);
      console.log('Series data received:', data);
      
      setSeasons(data.seasons);
      setEpisodesBySeason(data.episodesBySeasonId);
      
      // Fetch stats for each season
      if (data.seasons.length > 0) {
        const statsPromises = data.seasons.map(season => 
          seriesService.episodes.getSeasonEpisodeStats(season.id)
        );
        const statsResults = await Promise.all(statsPromises);
        
        const statsMap: Record<string, EpisodeStats> = {};
        data.seasons.forEach((season, index) => {
          statsMap[season.id] = statsResults[index];
        });
        setEpisodeStats(statsMap);
      }
      
    } catch (error) {
      console.error('Error fetching series data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch series data');
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateTMDB = async () => {
    if (!series || !series.tmdbId) {
      setError('No TMDB ID found for this series');
      return;
    }

    setIsPopulatingTMDB(true);
    setError(null);

    try {
      console.log('Populating TMDB data for series:', series.id, 'TMDB ID:', series.tmdbId);
      await tmdbService.populateSeriesWithTMDBData(series.id);
      
      // Refresh the series data after population
      await fetchSeriesData();
      
      console.log('TMDB population completed successfully');
    } catch (error) {
      console.error('Error populating TMDB data:', error);
      setError(error instanceof Error ? error.message : 'Failed to populate TMDB data');
    } finally {
      setIsPopulatingTMDB(false);
    }
  };

  const toggleSeasonExpanded = (seasonId: string) => {
    setExpandedSeasons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seasonId)) {
        newSet.delete(seasonId);
      } else {
        newSet.add(seasonId);
      }
      return newSet;
    });
  };

  const handleEpisodeToggle = async (episode: SeriesEpisode, seasonId: string) => {
    try {
      const newWatchedState = !episode.watched;
      const updatedEpisode = await seriesService.episodes.toggleEpisodeWatched(episode.id, {
        watched: newWatchedState,
        watchDate: newWatchedState ? new Date().toISOString().split('T')[0] : undefined,
      });

      // Update episodes state optimistically
      setEpisodesBySeason(prev => ({
        ...prev,
        [seasonId]: prev[seasonId].map(ep => 
          ep.id === episode.id ? updatedEpisode : ep
        )
      }));

      // Update season state based on episode changes
      const updatedEpisodes = episodesBySeason[seasonId].map(ep => 
        ep.id === episode.id ? updatedEpisode : ep
      );
      const watchedCount = updatedEpisodes.filter(ep => ep.watched).length;
      const totalCount = updatedEpisodes.length;
      
      setSeasons(prevSeasons => 
        prevSeasons.map(season => 
          season.id === seasonId 
            ? { 
                ...season, 
                episodesWatched: watchedCount,
                status: watchedCount === 0 ? 'not-started' : 
                        watchedCount === totalCount ? 'completed' : 'watching',
                watchDate: watchedCount === totalCount ? new Date().toISOString().split('T')[0] : season.watchDate
              }
            : season
        )
      );

      // Update episode stats
      setEpisodeStats(prev => ({
        ...prev,
        [seasonId]: {
          ...prev[seasonId],
          watchedEpisodes: watchedCount,
          unwatchedEpisodes: totalCount - watchedCount,
          watchedPercentage: Math.round((watchedCount / totalCount) * 100),
          isCompleted: watchedCount === totalCount,
          nextEpisodeToWatch: watchedCount === totalCount ? undefined : watchedCount + 1
        }
      }));

      // Update series status based on episode changes
      await enhancedSeriesService.updateSeriesStatusBasedOnSeasons(series.id);

      // Show success message
      setSuccessMessage(`Episode ${episode.episodeNumber} marked as ${newWatchedState ? 'watched' : 'unwatched'}`);
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error('Error toggling episode:', error);
      setError('Failed to update episode status');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleMarkSeasonWatched = async (seasonId: string, watched: boolean) => {
    try {
      const episodes = episodesBySeason[seasonId] || [];
      const episodeNumbers = episodes.map(ep => ep.episodeNumber);
      
      await seriesService.episodes.bulkUpdateEpisodes(seasonId, {
        episodeNumbers,
        watched,
        watchDate: watched ? new Date().toISOString().split('T')[0] : undefined,
      });

      // Update local state optimistically instead of full refresh
      setSeasons(prevSeasons => 
        prevSeasons.map(season => 
          season.id === seasonId 
            ? { 
                ...season, 
                status: watched ? 'completed' : 'not-started',
                episodesWatched: watched ? season.episodeCount : 0,
                watchDate: watched ? new Date().toISOString().split('T')[0] : undefined
              }
            : season
        )
      );

      // Update episodes state
      setEpisodesBySeason(prev => ({
        ...prev,
        [seasonId]: episodes.map(ep => ({
          ...ep,
          watched,
          watchDate: watched ? new Date().toISOString().split('T')[0] : undefined
        }))
      }));

      // Update episode stats
      const totalEpisodes = episodes.length;
      const watchedEpisodes = watched ? totalEpisodes : 0;
      setEpisodeStats(prev => ({
        ...prev,
        [seasonId]: {
          ...prev[seasonId],
          watchedEpisodes,
          unwatchedEpisodes: totalEpisodes - watchedEpisodes,
          watchedPercentage: Math.round((watchedEpisodes / totalEpisodes) * 100),
          isCompleted: watched,
          nextEpisodeToWatch: watched ? undefined : 1
        }
      }));

      // Update series status based on season changes
      await enhancedSeriesService.updateSeriesStatusBasedOnSeasons(series.id);

      // Show success message
      setSuccessMessage(`Season ${seasons.find(s => s.id === seasonId)?.seasonName} marked as ${watched ? 'watched' : 'unwatched'}`);
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error('Error marking season as watched:', error);
      setError('Failed to update season status');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSeasonEdit = (season: SeriesSeason) => {
    setEditingSeasonId(season.id);
    setSeasonRating(season.rating || 5);
    setSeasonNotes(season.notes || '');
  };

  const handleSaveSeasonEdit = async () => {
    if (!editingSeasonId) return;
    
    try {
      await seriesService.seasons.updateSeason(editingSeasonId, {
        rating: seasonRating,
        notes: seasonNotes.trim() || undefined
      });

      // Update local state
      setSeasons(prevSeasons => 
        prevSeasons.map(season => 
          season.id === editingSeasonId 
            ? { ...season, rating: seasonRating, notes: seasonNotes.trim() || undefined }
            : season
        )
      );

      setEditingSeasonId(null);
      setSuccessMessage('Season updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating season:', error);
      setError('Failed to update season');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleCancelSeasonEdit = () => {
    setEditingSeasonId(null);
    setSeasonRating(5);
    setSeasonNotes('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Eye className="h-4 w-4 text-green-400" />;
      case "watching":
        return <Play className="h-4 w-4 text-blue-400" />;
      case "want-to-watch":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "watching":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "want-to-watch":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (!series || series.category !== 'Series') return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getCurrentPoster() && (
              <img 
                src={getCurrentPoster()} 
                alt={series.title}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{series.title}</h2>
              <p className="text-sm text-muted-foreground">{series.genre}</p>
            </div>
            {onDelete && (
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
            )}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
            <p className="text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Header Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {seasons.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Seasons Completed</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {Object.values(episodeStats).reduce((acc, stats) => acc + stats.watchedEpisodes, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Episodes Watched</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {series.overallRating || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Overall Rating</div>
              </div>
            </div>

            {/* Progress Section */}
            {seasons.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Watching Progress
                </h3>
                <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Season Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {seasons.filter(s => s.status === 'completed').length} of {seasons.length} seasons
                    </span>
                  </div>
                  <Progress 
                    value={seasons.length > 0 ? (seasons.filter(s => s.status === 'completed').length / seasons.length) * 100 : 0} 
                    className="h-3"
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Episode Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Object.values(episodeStats).reduce((acc, stats) => acc + stats.watchedEpisodes, 0)} of{' '}
                      {Object.values(episodeStats).reduce((acc, stats) => acc + stats.totalEpisodes, 0)} episodes
                    </span>
                  </div>
                  <Progress 
                    value={
                      Object.values(episodeStats).reduce((acc, stats) => acc + stats.totalEpisodes, 0) > 0
                        ? (Object.values(episodeStats).reduce((acc, stats) => acc + stats.watchedEpisodes, 0) / 
                           Object.values(episodeStats).reduce((acc, stats) => acc + stats.totalEpisodes, 0)) * 100
                        : 0
                    } 
                    className="h-3"
                  />
                </div>
              </div>
            )}

            {/* Series Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  Series Information
                </h3>
                <div className="bg-muted/20 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className={
                      series.status === 'watched' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      series.status === 'watching' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }>
                      {series.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Release Year:</span>
                    <span className="text-sm font-medium">{series.releaseYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Platform:</span>
                    <span className="text-sm font-medium">{series.platform}</span>
                  </div>
                  {series.totalSeasonsAvailable && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Seasons:</span>
                      <span className="text-sm font-medium">{series.totalSeasonsAvailable}</span>
                    </div>
                  )}
                  {series.latestSeasonWatched && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Latest Season Watched:</span>
                      <span className="text-sm font-medium">Season {series.latestSeasonWatched}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Season Status Breakdown */}
              {seasons.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Season Status
                  </h3>
                  <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                    {[
                      { status: 'completed', label: 'Completed', icon: Eye, color: 'text-green-400' },
                      { status: 'watching', label: 'Watching', icon: Play, color: 'text-blue-400' },
                      { status: 'want-to-watch', label: 'Want to Watch', icon: Clock, color: 'text-yellow-400' },
                      { status: 'not-started', label: 'Not Started', icon: Clock, color: 'text-gray-400' }
                    ].map(({ status, label, icon: Icon, color }) => {
                      const count = seasons.filter(s => s.status === status).length;
                      return count > 0 ? (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${color}`} />
                            <span className="text-sm">{label}</span>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {series.overallNotes && (
              <div className="space-y-3">
                <h3 className="font-medium">Notes</h3>
                <div className="bg-muted/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{series.overallNotes}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="seasons" className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading seasons...</div>
            ) : seasons.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">No seasons found.</p>
                {series.tmdbId ? (
                  <Button 
                    onClick={handlePopulateTMDB}
                    disabled={isPopulatingTMDB}
                    className="mx-auto"
                  >
                    {isPopulatingTMDB ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Populating from TMDB...
                      </>
                    ) : (
                      'Populate from TMDB'
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      No TMDB ID found. Please add a TMDB ID to populate seasons.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {seasons.map((season) => {
                  const stats = episodeStats[season.id];
                  return (
                    <div key={season.id} className="bg-muted/20 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-lg">{season.seasonName}</h4>
                            <Badge className={getStatusColor(season.status)}>
                              {getStatusIcon(season.status)}
                              <span className="ml-1 capitalize">{season.status.replace('-', ' ')}</span>
                            </Badge>
                          </div>
                          
                          {stats && (
                            <div className="text-sm text-muted-foreground">
                              {stats.watchedEpisodes} of {stats.totalEpisodes} episodes watched
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (editingSeasonId === season.id) {
                                setEditingSeasonId(null);
                              } else {
                                handleSeasonEdit(season);
                              }
                            }}
                            className="shrink-0"
                          >
                            {editingSeasonId === season.id ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant={season.status === 'completed' ? 'secondary' : 'default'}
                            size="sm"
                            onClick={() => handleMarkSeasonWatched(season.id, season.status !== 'completed')}
                            className="shrink-0"
                          >
                            {season.status === 'completed' ? 'Mark Unwatched' : 'Mark Watched'}
                          </Button>
                        </div>
                      </div>
                      
                      {stats && stats.totalEpisodes > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Progress</span>
                            <span className="text-muted-foreground">{stats.watchedPercentage}%</span>
                          </div>
                          <Progress value={stats.watchedPercentage} className="h-2" />
                        </div>
                      )}

                      {editingSeasonId === season.id ? (
                        <div className="space-y-3 border-t pt-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Rating (1-10)</label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              step="0.1"
                              value={seasonRating}
                              onChange={(e) => setSeasonRating(parseFloat(e.target.value) || 5)}
                              className="w-24"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea
                              value={seasonNotes}
                              onChange={(e) => setSeasonNotes(e.target.value)}
                              placeholder="Add notes about this season..."
                              className="min-h-[60px]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveSeasonEdit}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelSeasonEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            {season.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{season.rating}/10</span>
                              </div>
                            )}
                            
                            {season.watchDate && (
                              <div className="text-muted-foreground">
                                Completed: {new Date(season.watchDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          {season.notes && (
                            <div className="text-xs text-muted-foreground max-w-xs truncate">
                              {season.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="episodes" className="space-y-4">
            <div className="max-h-96 overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center py-4">Loading episodes...</div>
            ) : (
              <div className="space-y-4">
                {seasons.map((season) => {
                  const episodes = episodesBySeason[season.id] || [];
                  const isExpanded = expandedSeasons.has(season.id);
                  const stats = episodeStats[season.id];

                  return (
                    <div key={season.id} className="border rounded-lg">
                      <div 
                        className="p-3 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSeasonExpanded(season.id)}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <h4 className="font-medium">{season.seasonName}</h4>
                          {stats && (
                            <span className="text-sm text-muted-foreground">
                              ({stats.watchedEpisodes}/{stats.totalEpisodes})
                            </span>
                          )}
                        </div>
                        <Badge className={getStatusColor(season.status)}>
                          {season.status.replace('-', ' ')}
                        </Badge>
                      </div>

                      {isExpanded && (
                        <div className="border-t p-3 space-y-2">
                          {episodes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No episodes found</p>
                          ) : (
                            episodes.map((episode) => (
                              <div 
                                key={episode.id}
                                className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-6 w-6"
                                    onClick={() => handleEpisodeToggle(episode, season.id)}
                                  >
                                    {episode.watched ? (
                                      <Check className="h-4 w-4 text-green-400" />
                                    ) : (
                                      <div className="h-4 w-4 border border-gray-400 rounded-sm" />
                                    )}
                                  </Button>
                                  <span className="text-sm">
                                    Episode {episode.episodeNumber}: {episode.episodeName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {episode.watchDate && (
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(episode.watchDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  {episode.rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs">{episode.rating}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
             </div>
              </TabsContent>
         </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SeriesDetailDialog;
