import { useState, useEffect, useRef } from "react";
import { Clock, ChevronDown, ChevronUp, X } from "lucide-react";
import { Movie } from "./MovieCard";
import { timeStatsService, WatchTimeStats } from "@/services/timeStatsService";

interface WatchTimeWidgetProps {
    movies: Movie[];
}

const WatchTimeWidget = ({ movies }: WatchTimeWidgetProps) => {
    const [watchTimeStats, setWatchTimeStats] = useState<WatchTimeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeframeLabel, setTimeframeLabel] = useState('This year');
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const widgetRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchWatchTime();
    }, [movies]);

    useEffect(() => {
        // Handle overlay animation
        if (isOverlayOpen) {
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setTimeout(() => setIsAnimating(false), 300);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOverlayOpen]);

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
        setIsOverlayOpen(true);
    };

    const handleCloseOverlay = () => {
        setIsOverlayOpen(false);
    };

    return (
        <>
            <div
                ref={widgetRef}
                className="floating-card rounded-xl p-4 cursor-pointer hover:bg-card/80 transition-colors"
                onClick={handleWidgetClick}
            >
                <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
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

            {/* Overlay */}
            {(isOverlayOpen || isAnimating) && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
                        isOverlayOpen ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
                    } transition-all duration-300`}
                    onClick={handleCloseOverlay}
                >
                    <div
                        ref={overlayRef}
                        className={`bg-card border border-border/60 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
                            isOverlayOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                        } transition-all duration-300 ease-out`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-6 w-6 text-blue-400" />
                                    <h2 className="text-xl font-bold">Watch Time Analytics</h2>
                                </div>
                                <button
                                    onClick={handleCloseOverlay}
                                    className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {watchTimeStats && (
                                <div className="space-y-6">
                                    {/* Main Stats */}
                                    <div className="bg-muted/30 rounded-lg p-6 text-center">
                                        <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                            {formatTime(Math.floor(watchTimeStats.totalHours), Math.round((watchTimeStats.totalHours % 1) * 60))}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-2">
                                            ({watchTimeStats.totalDays.toFixed(1)} days) • {timeframeLabel}
                                        </div>
                                    </div>

                                    {/* Breakdown by Type */}
                                    <div>
                                        <h4 className="text-lg font-medium mb-4">Breakdown by Type</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="flex items-center gap-2">
                                                        🎬 Movies
                                                        <span className="text-muted-foreground">({watchTimeStats.movieCount})</span>
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatTime(watchTimeStats.breakdown.movies.hours, watchTimeStats.breakdown.movies.minutes)}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-muted/30 rounded-full h-3">
                                                    <div
                                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                                                        style={{ width: `${watchTimeStats.breakdown.movies.percentage}%` }}
                                                    />
                                                </div>
                                                <div className="text-xs text-muted-foreground text-right">
                                                    {watchTimeStats.breakdown.movies.percentage}%
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="flex items-center gap-2">
                                                        📺 Series
                                                        <span className="text-muted-foreground">({watchTimeStats.episodeCount} episodes)</span>
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatTime(watchTimeStats.breakdown.series.hours, watchTimeStats.breakdown.series.minutes)}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-muted/30 rounded-full h-3">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
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
                                    <div className="border-t border-border/40 pt-6">
                                        <h4 className="text-lg font-medium mb-4">Averages</h4>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="bg-muted/20 rounded-lg p-4">
                                                <div className="text-xl font-bold">
                                                    {Math.round(watchTimeStats.dailyAverage)}m
                                                </div>
                                                <div className="text-xs text-muted-foreground">Per Day</div>
                                            </div>
                                            <div className="bg-muted/20 rounded-lg p-4">
                                                <div className="text-xl font-bold">
                                                    {formatTime(Math.floor(watchTimeStats.weeklyAverage / 60), Math.round(watchTimeStats.weeklyAverage % 60))}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Per Week</div>
                                            </div>
                                            <div className="bg-muted/20 rounded-lg p-4">
                                                <div className="text-xl font-bold">
                                                    {formatTime(Math.floor(watchTimeStats.monthlyAverage / 60), Math.round(watchTimeStats.monthlyAverage % 60))}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Per Month</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WatchTimeWidget;
