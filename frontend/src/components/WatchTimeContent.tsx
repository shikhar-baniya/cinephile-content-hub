import { TrendingUp } from "lucide-react";
import { WatchTimeStats } from "@/services/timeStatsService";

interface WatchTimeContentProps {
    stats: WatchTimeStats | null;
    timeframeLabel: string;
}

const WatchTimeContent = ({ stats, timeframeLabel }: WatchTimeContentProps) => {
    const formatTime = (hours: number, minutes: number) => {
        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    };

    if (!stats) {
        return <div className="text-center text-muted-foreground py-8">No data available</div>;
    }

    return (
        <div className="space-y-6">
            {/* Main Stats */}
            <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl p-6 text-center border border-blue-500/20">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {formatTime(Math.floor(stats.totalHours), Math.round((stats.totalHours % 1) * 60))}
                </div>
                <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>({stats.totalDays.toFixed(1)} days) • {timeframeLabel}</span>
                </div>
            </div>

            {/* Breakdown by Type */}
            <div className="space-y-4">
                <h4 className="text-base font-semibold">Breakdown by Type</h4>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                                <span className="font-medium">Movies</span>
                                <span className="text-muted-foreground">({stats.movieCount})</span>
                            </span>
                            <span className="font-bold text-purple-400">
                                {formatTime(stats.breakdown.movies.hours, stats.breakdown.movies.minutes)}
                            </span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${stats.breakdown.movies.percentage}%` }}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground text-right font-medium">
                            {stats.breakdown.movies.percentage}%
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                                <span className="font-medium">Series</span>
                                <span className="text-muted-foreground">({stats.episodeCount} episodes)</span>
                            </span>
                            <span className="font-bold text-blue-400">
                                {formatTime(stats.breakdown.series.hours, stats.breakdown.series.minutes)}
                            </span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${stats.breakdown.series.percentage}%` }}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground text-right font-medium">
                            {stats.breakdown.series.percentage}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Averages */}
            <div className="border-t border-border/40 pt-6">
                <h4 className="text-base font-semibold mb-4">Viewing Averages</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                        <div className="text-xl font-bold text-green-400">
                            {Math.round(stats.dailyAverage)}m
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Per Day</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="text-xl font-bold text-blue-400">
                            {formatTime(Math.floor(stats.weeklyAverage / 60), Math.round(stats.weeklyAverage % 60))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Per Week</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                        <div className="text-xl font-bold text-purple-400">
                            {formatTime(Math.floor(stats.monthlyAverage / 60), Math.round(stats.monthlyAverage % 60))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Per Month</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchTimeContent;
