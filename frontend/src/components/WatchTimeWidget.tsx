import { useState, useEffect } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Movie } from "./MovieCard";
import { timeStatsService, WatchTimeStats } from "@/services/timeStatsService";

interface WatchTimeWidgetProps {
    movies: Movie[];
}

const WatchTimeWidget = ({ movies }: WatchTimeWidgetProps) => {
    const [watchTimeStats, setWatchTimeStats] = useState<WatchTimeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeframeLabel, setTimeframeLabel] = useState('This year');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        fetchWatchTime();
    }, [movies]);

    const fetchWatchTime = async () => {
        setLoading(true);
        try {
            let watchTime = await timeStatsService.calculateWatchTime(movies, 'thisYear');

            if (watchTime.totalMinutes === 0) {
                watchTime = await timeStatsService.calculateWatchTime(movies, 'allTime');
                setTimeframeLabel('All time');
            } else {
                setTimeframeLabel('This year');
            }

            setWatchTimeStats(watchTime);
        } catch (error) {
            console.error('Error fetching watch time:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (hours: number, minutes: number) => {
        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="floating-card rounded-xl p-4 animate-pulse">
                <div className="h-5 w-5 bg-muted rounded mb-2"></div>
                <div className="h-8 w-20 bg-muted rounded mb-1"></div>
                <div className="h-4 w-24 bg-muted rounded"></div>
            </div>
        );
    }

    return (
        <div className="floating-card rounded-xl p-4">
            <div
                className="cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
                <div className="space-y-1">
                    <div className="text-2xl font-bold">
                        {watchTimeStats ? formatTime(
                            Math.floor(watchTimeStats.totalHours),
                            Math.round((watchTimeStats.totalHours % 1) * 60)
                        ) : '0h'}
                    </div>
                    <div className="text-xs text-muted-foreground">Watch Time</div>
                    <div className="text-xs text-muted-foreground">{timeframeLabel}</div>
                </div>
            </div>

            {isExpanded && watchTimeStats && (
                <div className="mt-6 space-y-6 animate-fade-in">
                    <div className="border-t border-border/40 pt-4">
                        {/* Main Stats */}
                        <div className="bg-muted/30 rounded-lg p-4 text-center mb-6">
                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                {formatTime(Math.floor(watchTimeStats.totalHours), Math.round((watchTimeStats.totalHours % 1) * 60))}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                ({watchTimeStats.totalDays.toFixed(1)} days)
                            </div>
                        </div>

                        {/* Breakdown by Type */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium mb-3">Breakdown by Type</h4>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            🎬 Movies
                                            <span className="text-muted-foreground">({watchTimeStats.movieCount})</span>
                                        </span>
                                        <span className="font-medium">
                                            {formatTime(watchTimeStats.breakdown.movies.hours, watchTimeStats.breakdown.movies.minutes)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted/30 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                            style={{ width: `${watchTimeStats.breakdown.movies.percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                        {watchTimeStats.breakdown.movies.percentage}%
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            📺 Series
                                            <span className="text-muted-foreground">({watchTimeStats.episodeCount} episodes)</span>
                                        </span>
                                        <span className="font-medium">
                                            {formatTime(watchTimeStats.breakdown.series.hours, watchTimeStats.breakdown.series.minutes)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted/30 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                                            style={{ width: `${watchTimeStats.breakdown.series.percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                        {watchTimeStats.breakdown.series.percentage}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Averages */}
                        <div className="border-t border-border/40 pt-4">
                            <h4 className="text-sm font-medium mb-3">Averages</h4>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-muted/20 rounded-lg p-3">
                                    <div className="text-lg font-bold">
                                        {Math.round(watchTimeStats.dailyAverage)}m
                                    </div>
                                    <div className="text-xs text-muted-foreground">Per Day</div>
                                </div>
                                <div className="bg-muted/20 rounded-lg p-3">
                                    <div className="text-lg font-bold">
                                        {formatTime(Math.floor(watchTimeStats.weeklyAverage / 60), Math.round(watchTimeStats.weeklyAverage % 60))}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Per Week</div>
                                </div>
                                <div className="bg-muted/20 rounded-lg p-3">
                                    <div className="text-lg font-bold">
                                        {formatTime(Math.floor(watchTimeStats.monthlyAverage / 60), Math.round(watchTimeStats.monthlyAverage % 60))}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Per Month</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WatchTimeWidget;
