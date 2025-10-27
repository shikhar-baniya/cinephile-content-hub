import { useState, useEffect } from "react";
import { Tv, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { Movie } from "./MovieCard";
import { seriesService, SeriesSeason } from "@/services/seriesService";

interface SeriesProgressWidgetProps {
    movies: Movie[];
}

interface SeriesProgress {
    seriesId: string;
    seriesTitle: string;
    posterPath?: string;
    currentSeason: SeriesSeason;
    totalSeasons: number;
    seasonProgress: number;
    episodesWatched: number;
    totalEpisodes: number;
    overallProgress: number;
}

const SeriesProgressWidget = ({ movies }: SeriesProgressWidgetProps) => {
    const [seriesInProgress, setSeriesInProgress] = useState<SeriesProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        fetchSeriesProgress();
    }, [movies]);

    const fetchSeriesProgress = async () => {
        setLoading(true);
        try {
            // Find all series marked as "watching" in movies table
            const watchingSeries = movies.filter(m => m.category === 'Series' && m.status === 'watching');

            if (watchingSeries.length === 0) {
                setSeriesInProgress([]);
                setLoading(false);
                return;
            }

            const allSeasons = await seriesService.seasons.getAllSeasons();
            const progressData: SeriesProgress[] = [];

            for (const seriesInfo of watchingSeries) {
                // Get all seasons for this series
                const seriesSeasons = allSeasons.filter(s => s.seriesId === seriesInfo.id);

                // Find the current watching season (either marked as 'watching' or the most recent incomplete one)
                let currentSeason = seriesSeasons.find(s => s.status === 'watching');

                if (!currentSeason) {
                    // If no season is marked as watching, find the most recent incomplete season
                    const incompleteSeason = seriesSeasons.find(s =>
                        s.status !== 'completed' && s.episodesWatched > 0
                    );

                    if (incompleteSeason) {
                        currentSeason = incompleteSeason;
                    } else {
                        // If no incomplete season, find first not-started or create a placeholder
                        const notStarted = seriesSeasons.find(s => s.status === 'not-started' || s.episodesWatched === 0);
                        currentSeason = notStarted || seriesSeasons[0];
                    }
                }

                if (!currentSeason) {
                    // No seasons found, create a placeholder season
                    progressData.push({
                        seriesId: seriesInfo.id,
                        seriesTitle: seriesInfo.title,
                        posterPath: seriesInfo.poster,
                        currentSeason: {
                            id: 'placeholder',
                            seriesId: seriesInfo.id,
                            seasonNumber: 1,
                            seasonName: 'Season 1',
                            episodeCount: 0,
                            episodesWatched: 0,
                            status: 'watching'
                        } as any,
                        totalSeasons: seriesInfo.totalSeasonsAvailable || 1,
                        seasonProgress: 0,
                        episodesWatched: 0,
                        totalEpisodes: 0,
                        overallProgress: 0
                    });
                    continue;
                }

                // Fetch episodes for the current season
                const episodes = await seriesService.episodes.getSeasonEpisodes(currentSeason.id);
                const watchedEpisodes = episodes.filter(e => e.watched).length;
                const totalEpisodes = currentSeason.episodeCount || episodes.length;

                // Calculate overall progress
                const completedSeasons = seriesSeasons.filter(s => s.status === 'completed').length;
                const totalSeriesSeasons = seriesInfo.totalSeasonsAvailable || seriesSeasons.length || 1;
                const overallProgress = totalSeriesSeasons > 0
                    ? Math.round(((completedSeasons + (watchedEpisodes / (totalEpisodes || 1))) / totalSeriesSeasons) * 100)
                    : 0;

                progressData.push({
                    seriesId: seriesInfo.id,
                    seriesTitle: seriesInfo.title,
                    posterPath: seriesInfo.poster,
                    currentSeason: currentSeason,
                    totalSeasons: totalSeriesSeasons,
                    seasonProgress: totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0,
                    episodesWatched: watchedEpisodes,
                    totalEpisodes: totalEpisodes,
                    overallProgress: overallProgress
                });
            }

            setSeriesInProgress(progressData);
        } catch (error) {
            console.error('Error fetching series progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="floating-card rounded-xl p-4 animate-pulse">
                <div className="h-5 w-5 bg-muted rounded mb-2"></div>
                <div className="h-8 w-32 bg-muted rounded mb-1"></div>
                <div className="h-4 w-24 bg-muted rounded"></div>
            </div>
        );
    }

    if (seriesInProgress.length === 0) {
        return (
            <div className="floating-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Tv className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-sm text-muted-foreground">
                    No series in progress
                </div>
            </div>
        );
    }

    const handleWidgetClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(false);
    };

    return (
        <div
            className={`floating-card rounded-xl transition-all duration-500 ease-out relative overflow-hidden ${isExpanded
                ? 'fixed inset-4 p-6 shadow-2xl border-2 border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-500/5 z-50 max-h-[90vh] overflow-y-auto'
                : 'p-3 cursor-pointer hover:bg-card/80 hover:scale-[1.02] hover:shadow-lg hover:border-purple-500/10 border border-transparent'
                }`}
            onClick={!isExpanded ? handleWidgetClick : undefined}
        >
            {/* Compact View */}
            {!isExpanded && (
                <>
                    <div className="flex items-center justify-between mb-1">
                        <Tv className="h-4 w-4 text-purple-400" />
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="text-xl font-bold">{seriesInProgress.length}</div>
                        <div className="text-[10px] text-muted-foreground">Watching</div>
                        {seriesInProgress[0] && (
                            <div className="text-[10px] text-muted-foreground truncate">
                                {seriesInProgress[0].seriesTitle}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Expanded View */}
            {isExpanded && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Tv className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Currently Watching</h2>
                                <p className="text-sm text-muted-foreground">
                                    {seriesInProgress.length} series in progress
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-muted/50 rounded-lg transition-colors group"
                        >
                            <ChevronUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                        {seriesInProgress.map((series) => (
                            <div
                                key={series.seriesId}
                                className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-xl p-5 hover:border-purple-500/40 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    {series.posterPath && (
                                        <img
                                            src={series.posterPath}
                                            alt={series.seriesTitle}
                                            className="w-16 h-24 object-cover rounded-lg shadow-md"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base mb-1 truncate group-hover:text-purple-400 transition-colors">
                                            {series.seriesTitle}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <span className="font-medium text-purple-400">
                                                Season {series.currentSeason.seasonNumber}
                                            </span>
                                            <span>/</span>
                                            <span>{series.totalSeasons} total</span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Current Season</span>
                                                <span className="font-medium">
                                                    {series.episodesWatched}/{series.totalEpisodes} episodes
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-700 ease-out"
                                                    style={{ width: `${series.seasonProgress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-purple-400">
                                                    {series.seasonProgress}% complete
                                                </span>
                                                {series.overallProgress > 0 && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3" />
                                                        {series.overallProgress}% overall
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeriesProgressWidget;
