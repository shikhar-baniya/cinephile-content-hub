import { TrendingUp, Tv } from "lucide-react";
import { Movie } from "./MovieCard";
import { useEffect, useState } from "react";
import { seriesService, SeriesSeason } from "@/services/seriesService";

interface SeriesProgressContentProps {
    movies: Movie[];
}

interface SeriesProgressData {
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

const SeriesProgressContent = ({ movies }: SeriesProgressContentProps) => {
    const [seriesData, setSeriesData] = useState<SeriesProgressData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSeriesProgress();
    }, [movies]);

    const fetchSeriesProgress = async () => {
        setLoading(true);
        try {
            const watchingSeries = movies.filter(m => m.category === 'Series' && m.status === 'watching');

            if (watchingSeries.length === 0) {
                setSeriesData([]);
                setLoading(false);
                return;
            }

            const allSeasons = await seriesService.seasons.getAllSeasons();
            const progressData: SeriesProgressData[] = [];

            for (const seriesInfo of watchingSeries) {
                const seriesSeasons = allSeasons.filter(s => s.seriesId === seriesInfo.id);

                let currentSeason = seriesSeasons.find(s => s.status === 'watching');

                if (!currentSeason) {
                    const incompleteSeason = seriesSeasons.find(s =>
                        s.status !== 'completed' && s.episodesWatched > 0
                    );

                    if (incompleteSeason) {
                        currentSeason = incompleteSeason;
                    } else {
                        const notStarted = seriesSeasons.find(s => s.status === 'not-started' || s.episodesWatched === 0);
                        currentSeason = notStarted || seriesSeasons[0];
                    }
                }

                if (!currentSeason) continue;

                const episodes = await seriesService.episodes.getSeasonEpisodes(currentSeason.id);
                const watchedEpisodes = episodes.filter(e => e.watched).length;
                const totalEpisodes = currentSeason.episodeCount || episodes.length;

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

            setSeriesData(progressData);
        } catch (error) {
            console.error('Error fetching series progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading series...</p>
            </div>
        );
    }

    if (seriesData.length === 0) {
        return (
            <div className="text-center py-12">
                <Tv className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No Series in Progress</p>
                <p className="text-sm text-muted-foreground">
                    Start watching a series to see your progress here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-semibold">Currently Watching</h4>
                <span className="text-sm text-muted-foreground">{seriesData.length} series</span>
            </div>

            {seriesData.map((series) => (
                <div
                    key={series.seriesId}
                    className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all"
                >
                    <div className="flex gap-4">
                        {series.posterPath && (
                            <img
                                src={series.posterPath}
                                alt={series.seriesTitle}
                                className="w-16 h-24 object-cover rounded-lg shadow-lg flex-shrink-0"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base mb-1 truncate text-purple-100">
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
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Current Season</span>
                                    <span className="font-medium">
                                        {series.episodesWatched}/{series.totalEpisodes} episodes
                                    </span>
                                </div>
                                <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-700"
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
    );
};

export default SeriesProgressContent;
