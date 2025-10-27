import { useState, useEffect, useRef } from "react";
import { Clock, ChevronDown, ChevronUp, X, TrendingUp } from "lucide-react";
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
    const [isAnimating, setIsAnimating] = useState(false);
    const widgetRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchWatchTime();
    }, [movies]);

    useEffect(() => {
        // Handle expansion animation
        if (isExpanded) {
            setIsAnimating(true);
            // Scroll the expanded widget into view
            setTimeout(() => {
                widgetRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }, 100);
        } else {
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [isExpanded]);

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

    const handleWidgetClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(false);
    };

    return (
        <div
            ref={widgetRef}
            className={`floating-card rounded-xl transition-all duration-500 ease-out relative overflow-hidden ${isExpanded
                    ? 'fixed inset-4 p-6 shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 z-50 max-h-[90vh] overflow-y-auto'
                    : 'p-3 cursor-pointer hover:bg-card/80 hover:scale-[1.02] hover:shadow-lg hover:border-primary/10 border border-transparent'
                }`}
            onClick={!isExpanded ? handleWidgetClick : undefined}
            style={{
                transformOrigin: 'top left',
            }}
        >
            {/* Compact Widget View */}
            {!isExpanded && (
                <>
                    <div className="flex items-center justify-between mb-1">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="text-xl font-bold">
                            {watchTimeStats ? formatTime(
                                Math.floor(watchTimeStats.totalHours),
                                Math.round((watchTimeStats.totalHours % 1) * 60)
                            ) : '0h'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Watch Time</div>
                        <div className="text-[10px] text-muted-foreground">{timeframeLabel}</div>
                    </div>
                </>
            )}

            {/* Expanded View */}
            {isExpanded && (
                <div
                    ref={contentRef}
                    className={`mt-4 space-y-6 animate-in slide-in-from-top-2 duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'
                        } transition-opacity duration-300`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Watch Time Analytics</h2>
                                <p className="text-sm text-muted-foreground">Detailed viewing insights</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-muted/50 rounded-lg transition-colors group"
                        >
                            <ChevronUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    {watchTimeStats && (
                        <div className="space-y-6">
                            {/* Main Stats with Trending Animation */}
                            <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl p-6 text-center border border-blue-500/20 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
                                <div className="relative z-10">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-in zoom-in-50 duration-700">
                                        {formatTime(Math.floor(watchTimeStats.totalHours), Math.round((watchTimeStats.totalHours % 1) * 60))}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span>({watchTimeStats.totalDays.toFixed(1)} days) • {timeframeLabel}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Breakdown by Type with Enhanced Animations */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                                    Breakdown by Type
                                </h4>
                                <div className="space-y-6">
                                    <div className="space-y-3 group">
                                        <div className="flex justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                                                <span className="font-medium">Movies</span>
                                                <span className="text-muted-foreground">({watchTimeStats.movieCount})</span>
                                            </span>
                                            <span className="font-bold text-purple-400">
                                                {formatTime(watchTimeStats.breakdown.movies.hours, watchTimeStats.breakdown.movies.minutes)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left"
                                                style={{ width: `${watchTimeStats.breakdown.movies.percentage}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-muted-foreground text-right font-medium">
                                            {watchTimeStats.breakdown.movies.percentage}%
                                        </div>
                                    </div>

                                    <div className="space-y-3 group">
                                        <div className="flex justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                                                <span className="font-medium">Series</span>
                                                <span className="text-muted-foreground">({watchTimeStats.episodeCount} episodes)</span>
                                            </span>
                                            <span className="font-bold text-blue-400">
                                                {formatTime(watchTimeStats.breakdown.series.hours, watchTimeStats.breakdown.series.minutes)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left delay-200"
                                                style={{ width: `${watchTimeStats.breakdown.series.percentage}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-muted-foreground text-right font-medium">
                                            {watchTimeStats.breakdown.series.percentage}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Averages with Enhanced Cards */}
                            <div className="border-t border-border/40 pt-6">
                                <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                                    Viewing Averages
                                </h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 hover:scale-105 transition-transform duration-300">
                                        <div className="text-xl font-bold text-green-400 animate-in zoom-in-50 duration-500">
                                            {Math.round(watchTimeStats.dailyAverage)}m
                                        </div>
                                        <div className="text-xs text-muted-foreground">Per Day</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 hover:scale-105 transition-transform duration-300">
                                        <div className="text-xl font-bold text-blue-400 animate-in zoom-in-50 duration-500 delay-100">
                                            {formatTime(Math.floor(watchTimeStats.weeklyAverage / 60), Math.round(watchTimeStats.weeklyAverage % 60))}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Per Week</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 hover:scale-105 transition-transform duration-300">
                                        <div className="text-xl font-bold text-purple-400 animate-in zoom-in-50 duration-500 delay-200">
                                            {formatTime(Math.floor(watchTimeStats.monthlyAverage / 60), Math.round(watchTimeStats.monthlyAverage % 60))}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Per Month</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WatchTimeWidget;
