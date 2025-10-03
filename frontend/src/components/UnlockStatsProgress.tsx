import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Film, Tv, Lock, TrendingUp } from "lucide-react";
import { UserStats } from "@/services/userStatsService";

interface UnlockStatsProgressProps {
    stats: UserStats;
}

const UnlockStatsProgress = ({ stats }: UnlockStatsProgressProps) => {
    const motivationalMessage = useMemo(() => {
        const { progressPercentage, moviesRemaining, seriesRemaining } = stats;

        if (progressPercentage === 0) {
            return "🎬 Start your journey! Watch content to unlock detailed analytics";
        } else if (progressPercentage < 25) {
            return "🚀 Great start! Keep watching to unlock your analytics";
        } else if (progressPercentage < 50) {
            return "⭐ You're making progress! Keep going";
        } else if (progressPercentage < 75) {
            const total = moviesRemaining + seriesRemaining;
            return `🎉 Almost there! Only ${total} more to unlock all stats`;
        } else if (progressPercentage < 100) {
            if (moviesRemaining > 0 && seriesRemaining > 0) {
                return `🔥 So close! Just ${moviesRemaining} ${moviesRemaining === 1 ? 'movie' : 'movies'} and ${seriesRemaining} ${seriesRemaining === 1 ? 'series' : 'series'} to go!`;
            } else if (moviesRemaining > 0) {
                return moviesRemaining === 1
                    ? "🎬 Last one! One more movie to unlock everything!"
                    : `🎬 Only ${moviesRemaining} movies to go - you can do it!`;
            } else {
                return seriesRemaining === 1
                    ? "📺 Almost done! Just 1 more series!"
                    : `📺 Just ${seriesRemaining} more series - you've got this!`;
            }
        }
        return "🎉 Stats unlocked!";
    }, [stats]);

    const movieProgress = (stats.moviesWatchedCount / stats.moviesRequired) * 100;
    const seriesProgress = (stats.seriesWatchedCount / stats.seriesRequired) * 100;

    const getProgressEmoji = (count: number, required: number) => {
        const ratio = count / required;
        if (ratio >= 1) return "✅";
        if (ratio >= 0.66) return "🔥";
        if (ratio >= 0.33) return "💪";
        return "🎯";
    };

    return (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Lock className="h-5 w-5 text-primary" />
                    Unlock Your Analytics Dashboard
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                    {motivationalMessage}
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Film className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">Movies</span>
                            </div>
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <span className="font-bold text-foreground">{stats.moviesWatchedCount}</span>
                                <span>/</span>
                                <span>{stats.moviesRequired}</span>
                                <span className="ml-1">{getProgressEmoji(stats.moviesWatchedCount, stats.moviesRequired)}</span>
                            </span>
                        </div>
                        <Progress
                            value={movieProgress}
                            className="h-3 bg-muted"
                        />
                        {stats.moviesRemaining > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {stats.moviesRemaining === 1
                                    ? "Only 1 movie to go, you can do it! 🎬"
                                    : `${stats.moviesRemaining} movies remaining`}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Tv className="h-4 w-4 text-purple-500" />
                                <span className="font-medium">Series</span>
                            </div>
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <span className="font-bold text-foreground">{stats.seriesWatchedCount}</span>
                                <span>/</span>
                                <span>{stats.seriesRequired}</span>
                                <span className="ml-1">{getProgressEmoji(stats.seriesWatchedCount, stats.seriesRequired)}</span>
                            </span>
                        </div>
                        <Progress
                            value={seriesProgress}
                            className="h-3 bg-muted"
                        />
                        {stats.seriesRemaining > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {stats.seriesRemaining === 1
                                    ? "Just 1 more series! 🍿"
                                    : `${stats.seriesRemaining} series remaining`}
                            </p>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Overall Progress</span>
                        </div>
                        <span className="text-sm font-bold">{stats.progressPercentage}%</span>
                    </div>
                    <Progress value={stats.progressPercentage} className="h-2" />
                </div>

                {stats.progressPercentage >= 90 && (
                    <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm font-medium text-primary">
                            🎊 You're almost there! Complete the requirements to unlock detailed insights!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UnlockStatsProgress;
