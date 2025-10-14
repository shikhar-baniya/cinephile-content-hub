import { useEffect, useState } from "react";
import { Flame, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { seriesService } from "@/services/seriesService";

interface DailyActivity {
    date: string;
    episodeCount: number;
    intensity: number;
    dayOfWeek: number;
    weekIndex: number;
}

interface ActivityStats {
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    averagePerDay: number;
    last7Days: number;
    last30Days: number;
}

const ActivityContent = () => {
    const [activities, setActivities] = useState<DailyActivity[]>([]);
    const [stats, setStats] = useState<ActivityStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivityData();
    }, []);

    const fetchActivityData = async () => {
        setLoading(true);
        try {
            const allSeasons = await seriesService.seasons.getAllSeasons();
            const episodePromises = allSeasons.map(season =>
                seriesService.episodes.getSeasonEpisodes(season.id)
            );
            const episodeArrays = await Promise.all(episodePromises);
            const allEpisodes = episodeArrays.flat();

            const watchedEpisodes = allEpisodes.filter(e => e.watched && e.watchDate);

            const activityMap = new Map<string, number>();
            watchedEpisodes.forEach(episode => {
                const date = episode.watchDate!;
                activityMap.set(date, (activityMap.get(date) || 0) + 1);
            });

            // Generate last 90 days
            const numDays = 90;
            const daysData = Array.from({ length: numDays }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (numDays - 1 - i));
                const dateStr = date.toISOString().split('T')[0];
                const count = activityMap.get(dateStr) || 0;

                let intensity = 0;
                if (count > 0) {
                    if (count >= 10) intensity = 4;
                    else if (count >= 7) intensity = 3;
                    else if (count >= 4) intensity = 2;
                    else intensity = 1;
                }

                return {
                    date: dateStr,
                    episodeCount: count,
                    intensity,
                    dayOfWeek: date.getDay(),
                    weekIndex: Math.floor(i / 7)
                };
            });

            setActivities(daysData);

            const currentStreak = calculateCurrentStreak(daysData);
            const longestStreak = calculateLongestStreak(daysData);
            const totalDays = daysData.filter(d => d.episodeCount > 0).length;
            const totalEpisodes = daysData.reduce((sum, d) => sum + d.episodeCount, 0);
            const averagePerDay = totalDays > 0 ? totalEpisodes / totalDays : 0;
            const last7Days = daysData.slice(-7).reduce((sum, d) => sum + d.episodeCount, 0);
            const last30Days = daysData.slice(-30).reduce((sum, d) => sum + d.episodeCount, 0);

            setStats({
                currentStreak,
                longestStreak,
                totalDays,
                averagePerDay,
                last7Days,
                last30Days
            });

        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateCurrentStreak = (activities: DailyActivity[]): number => {
        let streak = 0;
        for (let i = activities.length - 1; i >= 0; i--) {
            if (activities[i].episodeCount > 0) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    const calculateLongestStreak = (activities: DailyActivity[]): number => {
        let longest = 0;
        let current = 0;
        activities.forEach(activity => {
            if (activity.episodeCount > 0) {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 0;
            }
        });
        return longest;
    };

    const getIntensityColor = (intensity: number): string => {
        switch (intensity) {
            case 0: return 'bg-muted/20';
            case 1: return 'bg-blue-500/30';
            case 2: return 'bg-blue-500/50';
            case 3: return 'bg-blue-500/70';
            case 4: return 'bg-blue-500';
            default: return 'bg-muted/20';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading activity...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No Activity Data</p>
                <p className="text-sm text-muted-foreground">
                    Start watching episodes to track your activity
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Current Streak</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-400">
                        {stats.currentStreak} days
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Longest Streak</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">
                        {stats.longestStreak} days
                    </div>
                </div>
            </div>

            {/* Simplified Activity Visualization */}
            <div>
                <h4 className="text-base font-semibold mb-3">Last 90 Days</h4>
                <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 rounded-xl p-4">
                    <div className="flex flex-wrap gap-1">
                        {activities.map((activity, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-sm ${getIntensityColor(activity.intensity)} transition-all`}
                                title={`${activity.date}: ${activity.episodeCount} episodes`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-sm bg-muted/20"></div>
                            <div className="w-3 h-3 rounded-sm bg-blue-500/30"></div>
                            <div className="w-3 h-3 rounded-sm bg-blue-500/50"></div>
                            <div className="w-3 h-3 rounded-sm bg-blue-500/70"></div>
                            <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted/20 rounded-lg p-3">
                    <div className="text-xl font-bold text-blue-400">{stats.last7Days}</div>
                    <div className="text-xs text-muted-foreground">Last 7 Days</div>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                    <div className="text-xl font-bold text-blue-400">{stats.last30Days}</div>
                    <div className="text-xs text-muted-foreground">Last 30 Days</div>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                    <div className="text-xl font-bold text-blue-400">
                        {stats.averagePerDay.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg/Day</div>
                </div>
            </div>
        </div>
    );
};

export default ActivityContent;
