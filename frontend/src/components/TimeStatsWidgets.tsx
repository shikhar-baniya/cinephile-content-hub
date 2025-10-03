import { useState, useEffect } from "react";
import { Clock, Flame, Target, ChevronDown, ChevronUp } from "lucide-react";
import { Movie } from "./MovieCard";
import { timeStatsService, WatchTimeStats, BingeStats, CompletionForecastStats } from "@/services/timeStatsService";

interface TimeStatsWidgetsProps {
    movies: Movie[];
}

const TimeStatsWidgets = ({ movies }: TimeStatsWidgetsProps) => {
    const [watchTimeStats, setWatchTimeStats] = useState<WatchTimeStats | null>(null);
    const [bingeStats, setBingeStats] = useState<BingeStats | null>(null);
    const [forecastStats, setForecastStats] = useState<CompletionForecastStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeframeLabel, setTimeframeLabel] = useState('This year');

    const [expandedWidget, setExpandedWidget] = useState<'watchTime' | 'binge' | 'forecast' | null>(null);

    useEffect(() => {
        fetchAllStats();
    }, [movies]);

    const fetchAllStats = async () => {
        setLoading(true);
        try {
            // Try this year first, fallback to all time if no data
            let watchTime = await timeStatsService.calculateWatchTime(movies, 'thisYear');
            
            // If no data this year, try all time
            if (watchTime.totalMinutes === 0) {
                console.log('📊 No data for this year, fetching all time...');
                watchTime = await timeStatsService.calculateWatchTime(movies, 'allTime');
                setTimeframeLabel('All time');
            } else {
                setTimeframeLabel('This year');
            }
            
            const [binge, forecast] = await Promise.all([
                timeStatsService.calculateBingeStats(),
                timeStatsService.calculateCompletionForecast(movies)
            ]);

            setWatchTimeStats(watchTime);
            setBingeStats(binge);
            setForecastStats(forecast);
        } catch (error) {
            console.error('Error fetching time stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpanded = (widget: 'watchTime' | 'binge' | 'forecast') => {
        setExpandedWidget(expandedWidget === widget ? null : widget);
    };

    const formatTime = (hours: number, minutes: number) => {
        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="floating-card rounded-xl p-4 animate-pulse">
                        <div className="h-5 w-5 bg-muted rounded mb-2"></div>
                        <div className="h-8 w-20 bg-muted rounded mb-1"></div>
                        <div className="h-4 w-24 bg-muted rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4 mb-6">
            {/* Widget Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Watch Time Widget */}
                <div
                    className="floating-card rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => toggleExpanded('watchTime')}
                >
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="h-5 w-5 text-blue-400" />
                        {expandedWidget === 'watchTime' ? (
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

                {/* Binge Stats Widget */}
                <div
                    className="floating-card rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => toggleExpanded('binge')}
                >
                    <div className="flex items-center justify-between mb-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        {expandedWidget === 'binge' ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold">
                            {bingeStats?.longestBinge?.episodeCount || 0} eps
                        </div>
                        <div className="text-xs text-muted-foreground">Longest Binge</div>
                        <div className="text-xs text-muted-foreground truncate">
                            {bingeStats?.longestBinge?.date
                                ? new Date(bingeStats.longestBinge.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : 'No data'}
                        </div>
                    </div>
                </div>

                {/* Completion Forecast Widget */}
                <div
                    className="floating-card rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => toggleExpanded('forecast')}
                >
                    <div className="flex items-center justify-between mb-2">
                        <Target className="h-5 w-5 text-green-400" />
                        {expandedWidget === 'forecast' ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold">
                            {forecastStats?.fastestToFinish
                                ? `${forecastStats.fastestToFinish.weeksRemaining}w`
                                : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">To Finish</div>
                        <div className="text-xs text-muted-foreground truncate">
                            {forecastStats?.fastestToFinish?.seriesTitle || 'No active series'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expandable Details */}
            {expandedWidget === 'watchTime' && watchTimeStats && (
                <div className="floating-card rounded-xl p-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <h3 className="text-lg font-semibold">Watch Time Breakdown</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Main Stats */}
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                {formatTime(Math.floor(watchTimeStats.totalHours), Math.round((watchTimeStats.totalHours % 1) * 60))}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                ({watchTimeStats.totalDays.toFixed(1)} days)
                            </div>
                        </div>

                        {/* Breakdown by Type */}
                        <div>
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

            {expandedWidget === 'binge' && bingeStats && (
                <div className="floating-card rounded-xl p-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <h3 className="text-lg font-semibold">Binge-Watching Stats</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Binge Score */}
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                                {bingeStats.bingeScore}/10 🔥
                            </div>
                            <div className="text-sm font-medium mt-1">{bingeStats.bingeLevel}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {bingeStats.averageEpisodesPerSession} episodes per session
                            </div>
                        </div>

                        {/* Longest Binge */}
                        {bingeStats.longestBinge && (
                            <div>
                                <h4 className="text-sm font-medium mb-3">Longest Binge Session</h4>
                                <div className="bg-muted/20 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-semibold">
                                                🏆 {bingeStats.longestBinge.episodeCount} episodes in 1 day
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {new Date(bingeStats.longestBinge.date).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Duration: {formatTime(
                                                    Math.floor(bingeStats.longestBinge.totalMinutes / 60),
                                                    bingeStats.longestBinge.totalMinutes % 60
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Binge Days */}
                        {bingeStats.topBingeDays.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-3">Top 5 Binge Days</h4>
                                <div className="space-y-2">
                                    {bingeStats.topBingeDays.slice(0, 5).map((session, index) => (
                                        <div key={index} className="flex items-center justify-between bg-muted/20 rounded-lg p-3">
                                            <span className="text-sm">
                                                {index + 1}. {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="text-sm font-medium">{session.episodeCount} episodes</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="border-t border-border/40 pt-4">
                            <h4 className="text-sm font-medium mb-3">Last 30 Days</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted/20 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold">{bingeStats.last30DaysEpisodes}</div>
                                    <div className="text-xs text-muted-foreground">Episodes Watched</div>
                                </div>
                                <div className="bg-muted/20 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold">{bingeStats.last30DaysAverage.toFixed(1)}</div>
                                    <div className="text-xs text-muted-foreground">Per Day</div>
                                </div>
                            </div>
                            {bingeStats.trendPercentage !== 0 && (
                                <div className="text-xs text-center mt-2">
                                    <span className={bingeStats.trendPercentage > 0 ? 'text-green-400' : 'text-red-400'}>
                                        {bingeStats.trendPercentage > 0 ? '↗' : '↘'} {Math.abs(bingeStats.trendPercentage)}% from last month
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {expandedWidget === 'forecast' && forecastStats && (
                <div className="floating-card rounded-xl p-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-green-400" />
                        <h3 className="text-lg font-semibold">Completion Forecast</h3>
                    </div>

                    {forecastStats.currentlyWatching.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No series currently being watched</p>
                            <p className="text-sm mt-2">Start watching a series to see forecasts!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Summary */}
                            <div className="bg-muted/30 rounded-lg p-4 text-center">
                                <div className="text-sm text-muted-foreground mb-1">Currently Watching</div>
                                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                    {forecastStats.totalSeriesWatching} {forecastStats.totalSeriesWatching === 1 ? 'series' : 'series'}
                                </div>
                                {forecastStats.totalWeeksToFinishAll > 0 && (
                                    <div className="text-xs text-muted-foreground mt-2">
                                        ~{forecastStats.totalWeeksToFinishAll} weeks to finish all
                                    </div>
                                )}
                            </div>

                            {/* Individual Series */}
                            <div className="space-y-3">
                                {forecastStats.currentlyWatching.map((forecast, index) => (
                                    <div key={index} className="bg-muted/20 rounded-lg p-4 space-y-3">
                                        <div>
                                            <div className="font-semibold">{forecast.seriesTitle}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {forecast.seasonName}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">
                                                    {forecast.watchedEpisodes}/{forecast.totalEpisodes} episodes
                                                </span>
                                                <span className="font-medium">{forecast.progressPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-muted/30 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${forecast.progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-muted/30 rounded p-2">
                                                <div className="text-muted-foreground">Pace</div>
                                                <div className="font-medium">{forecast.episodesPerWeek} eps/week</div>
                                            </div>
                                            <div className="bg-muted/30 rounded p-2">
                                                <div className="text-muted-foreground">Est. Finish</div>
                                                <div className="font-medium">{forecast.estimatedFinishDate}</div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            ⏱️ {formatTime(
                                                Math.floor(forecast.remainingMinutes / 60),
                                                forecast.remainingMinutes % 60
                                            )} remaining
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total Remaining Time */}
                            {forecastStats.totalRemainingMinutes > 0 && (
                                <div className="border-t border-border/40 pt-4 text-center">
                                    <div className="text-xs text-muted-foreground mb-1">Total Time Remaining</div>
                                    <div className="text-xl font-bold">
                                        {formatTime(
                                            Math.floor(forecastStats.totalRemainingMinutes / 60),
                                            forecastStats.totalRemainingMinutes % 60
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TimeStatsWidgets;
