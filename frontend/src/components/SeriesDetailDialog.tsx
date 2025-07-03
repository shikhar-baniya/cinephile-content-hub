import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Calendar, Play, Eye, Clock, ChevronDown, ChevronRight, Check, X, RefreshCw } from "lucide-react";
import { Movie } from "./MovieCard";
import { SeriesSeason, SeriesEpisode, seriesService, EpisodeStats } from "@/services/seriesService";
import { tmdbService } from "@/services/tmdbService";
import { debugBackend } from "@/utils/debugBackend";
import { cn } from "@/lib/utils";

interface SeriesDetailDialogProps {
  series: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onSeriesUpdate: (updatedSeries: Movie) => void;
}

const SeriesDetailDialog = ({ series, isOpen, onClose, onSeriesUpdate }: SeriesDetailDialogProps) => {
  const [seasons, setSeasons] = useState<SeriesSeason[]>([]);
  const [episodesBySeason, setEpisodesBySeason] = useState<Record<string, SeriesEpisode[]>>({});
  const [episodeStats, setEpisodeStats] = useState<Record<string, EpisodeStats>>({});
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [isPopulatingTMDB, setIsPopulatingTMDB] = useState(false);

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
      const updatedEpisode = await seriesService.episodes.toggleEpisodeWatched(episode.id, {
        watched: !episode.watched,
        watchDate: !episode.watched ? new Date().toISOString().split('T')[0] : undefined,
      });

      // Update local state
      setEpisodesBySeason(prev => ({
        ...prev,
        [seasonId]: prev[seasonId].map(ep => 
          ep.id === episode.id ? updatedEpisode : ep
        )
      }));

      // Refresh stats for this season
      const updatedStats = await seriesService.episodes.getSeasonEpisodeStats(seasonId);
      setEpisodeStats(prev => ({
        ...prev,
        [seasonId]: updatedStats
      }));

      // Refresh seasons to get updated progress
      await fetchSeriesData();
    } catch (error) {
      console.error('Error toggling episode:', error);
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

      // Refresh data
      await fetchSeriesData();
    } catch (error) {
      console.error('Error marking season as watched:', error);
    }
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
            {series.poster && (
              <img 
                src={series.poster} 
                alt={series.title}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{series.title}</h2>
              <p className="text-sm text-muted-foreground">{series.genre}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Series Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Status:</span> {series.status}</p>
                  <p><span className="font-medium">Release Year:</span> {series.releaseYear}</p>
                  <p><span className="font-medium">Platform:</span> {series.platform}</p>
                  {series.totalSeasonsAvailable && (
                    <p><span className="font-medium">Total Seasons:</span> {series.totalSeasonsAvailable}</p>
                  )}
                  {series.latestSeasonWatched && (
                    <p><span className="font-medium">Latest Season Watched:</span> {series.latestSeasonWatched}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Progress Summary</h3>
                {seasons.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Seasons Completed</span>
                      <span>{seasons.filter(s => s.status === 'completed').length} / {seasons.length}</span>
                    </div>
                    <Progress 
                      value={(seasons.filter(s => s.status === 'completed').length / seasons.length) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span>Total Episodes Watched</span>
                      <span>
                        {Object.values(episodeStats).reduce((acc, stats) => acc + stats.watchedEpisodes, 0)} / 
                        {Object.values(episodeStats).reduce((acc, stats) => acc + stats.totalEpisodes, 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {series.overallNotes && (
              <div className="space-y-2">
                <h3 className="font-medium">Notes</h3>
                <p className="text-sm text-muted-foreground">{series.overallNotes}</p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && (
              <div className="border-t pt-4 space-y-2">
                <h3 className="font-medium text-sm">Debug Information</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => debugBackend.testBackendConnection()}
                  >
                    Test Backend
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => debugBackend.testSeriesEndpoint(series.id)}
                  >
                    Test Series API
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => debugBackend.getAllSeriesDebugInfo()}
                  >
                    Debug All Series
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Series ID: {series.id}</p>
                  <p>TMDB ID: {series.tmdbId || 'None'}</p>
                  <p>Category: {series.category}</p>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => debugBackend.testSeriesEndpoint(series.id)}
                    >
                      Debug API Connection
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {seasons.map((season) => {
                  const stats = episodeStats[season.id];
                  return (
                    <div key={season.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{season.seasonName}</h4>
                          <Badge className={getStatusColor(season.status)}>
                            {getStatusIcon(season.status)}
                            <span className="ml-1 capitalize">{season.status.replace('-', ' ')}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {stats && (
                            <span className="text-sm text-muted-foreground">
                              {stats.watchedEpisodes}/{stats.totalEpisodes} episodes
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkSeasonWatched(season.id, season.status !== 'completed')}
                          >
                            {season.status === 'completed' ? 'Mark Unwatched' : 'Mark Watched'}
                          </Button>
                        </div>
                      </div>
                      
                      {stats && stats.totalEpisodes > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{stats.watchedPercentage}%</span>
                          </div>
                          <Progress value={stats.watchedPercentage} className="h-2" />
                        </div>
                      )}

                      {season.rating && (
                        <div className="mt-2 flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{season.rating}/10</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="episodes" className="space-y-4 max-h-96 overflow-y-auto">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SeriesDetailDialog;
