import { useState, useEffect } from "react";
import { Calendar, ChevronDown, ChevronUp, Flame, TrendingUp } from "lucide-react";
import { seriesService, SeriesEpisode } from "@/services/seriesService";

interface EpisodeActivityWidgetProps {
    // You can add props if needed
}

interface DailyActivity {
    date: string;
    episodeCount: number;
    intensity: number; // 0-4 for heat map coloring
}

interface ActivityStats {
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    averagePerDay: number;
    last7Days: number;
    last30Days: number;
}

const GitHubStyleHeatMap = ({
    activities,
    getIntensityColor
}: {
    activities: DailyActivity[],
    getIntensityColor: (intensity: number) => string
}) => {
    // Organize activities into weeks (columns) and days (rows)
    const weeks: DailyActivity[][] = [];
    let currentWeek: DailyActivity[] = [];

    // Start from first Sunday or pad with empty days
    const firstDate = activities[0] ? new Date(activities[0].date) : new Date();
    const firstDayOfWeek = firstDate.getDay(); // 0 = Sunday

    // Pad the beginning if not starting on Sunday
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({
            date: '',
            episodeCount: 0,
            intensity: 0
        });
    }

    // Group into weeks
    activities.forEach((activity) => {
        const date = new Date(activity.date);
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 0 && currentWeek.length > 0) {
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
        currentWeek.push(activity);
    });

    // Add the last week if it has items
    if (currentWeek.length > 0) {
        // Pad to 7 days
        while (currentWeek.length < 7) {
            currentWeek.push({
                date: '',
                episodeCount: 0,
                intensity: 0
            });
        }
        weeks.push(currentWeek);
    }

    // Get month labels for columns
    const getMonthLabel = (weekIndex: number): string | null => {
        if (weekIndex >= weeks.length) return null;
        const firstDayOfWeek = weeks[weekIndex][0];
        if (!firstDayOfWeek.date) return null;

        const date = new Date(firstDayOfWeek.date);
        // Only show month label if it's the first week of that month
        if (weekIndex === 0) return date.toLocaleDateString('en-US', { month: 'short' });

        const prevWeek = weeks[weekIndex - 1];
        const prevDate = prevWeek.find(d => d.date)?.date;
        if (!prevDate) return null;

        const prevMonth = new Date(prevDate).getMonth();
        const currentMonth = date.getMonth();

        return prevMonth !== currentMonth ? date.toLocaleDateString('en-US', { month: 'short' }) : null;
    };

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="inline-block min-w-max">
            {/* Month labels */}
            <div className="flex mb-2">
                <div className="w-8"></div> {/* Space for day labels */}
                {weeks.map((_, weekIndex) => (
                    <div key={weekIndex} className="flex-shrink-0 w-3 mx-0.5">
                        <div className="text-[10px] text-muted-foreground">
                            {getMonthLabel(weekIndex)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid with day labels */}
            {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <div key={dayIndex} className="flex items-center mb-1">
                    {/* Day label */}
                    <div className="w-8 pr-2">
                        <span className="text-[10px] text-muted-foreground">
                            {dayIndex % 2 === 1 ? dayLabels[dayIndex] : ''}
                        </span>
                    </div>

                    {/* Week cells */}
                    {weeks.map((week, weekIndex) => {
                        const activity = week[dayIndex];
                        if (!activity || !activity.date) {
                            return (
                                <div
                                    key={weekIndex}
                                    className="w-3 h-3 mx-0.5 flex-shrink-0"
                                />
                            );
                        }

                        return (
                            <div
                                key={weekIndex}
                                className={`w-3 h-3 mx-0.5 rounded-sm ${getIntensityColor(activity.intensity)} transition-all hover:scale-125 hover:ring-1 hover:ring-blue-400 cursor-pointer flex-shrink-0`}
                                title={`${activity.date}: ${activity.episodeCount} episodes`}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

const EpisodeActivityWidget = ({ }: EpisodeActivityWidgetProps) => {
    const [activities, setActivities] = useState<DailyActivity[]>([]);
    const [stats, setStats] = useState<ActivityStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        fetchEpisodeActivity();
    }, []);

    const fetchEpisodeActivity = async () => {
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

            const maxEpisodes = Math.max(...Array.from(activityMap.values()), 0);

            const last90Days = Array.from({ length: 90 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (89 - i));
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
                    intensity
                };
            });

            setActivities(last90Days);

            const currentStreak = calculateCurrentStreak(last90Days);
            const longestStreak = calculateLongestStreak(last90Days);
            const totalDays = last90Days.filter(d => d.episodeCount > 0).length;
            const totalEpisodes = last90Days.reduce((sum, d) => sum + d.episodeCount, 0);
            const averagePerDay = totalDays > 0 ? totalEpisodes / totalDays : 0;
            const last7Days = last90Days.slice(-7).reduce((sum, d) => sum + d.episodeCount, 0);
            const last30Days = last90Days.slice(-30).reduce((sum, d) => sum + d.episodeCount, 0);

            setStats({
                currentStreak,
                longestStreak,
                totalDays,
                averagePerDay,
                last7Days,
                last30Days
            });

        } catch (error) {
            console.error('Error fetching episode activity:', error);
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
            className={`floating-card rounded-xl transition-all duration-500 ease-out relative overflow-hidden ${isExpanded
                ? 'fixed inset-4 p-6 shadow-2xl border-2 border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 z-50 max-h-[90vh] overflow-y-auto'
                : 'p-3 cursor-pointer hover:bg-card/80 hover:scale-[1.02] hover:shadow-lg hover:border-blue-500/10 border border-transparent'
                }`}
            onClick={!isExpanded ? handleWidgetClick : undefined}
        >
            {/* Compact View */}
            {!isExpanded && (
                <>
                    <div className="flex items-center justify-between mb-1">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="text-xl font-bold flex items-center gap-1.5">
                            {stats?.currentStreak || 0}
                            {stats && stats.currentStreak > 0 && (
                                <Flame className="h-4 w-4 text-orange-500" />
                            )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Day Streak</div>
                        <div className="text-[10px] text-muted-foreground">
                            {stats?.last7Days || 0} eps/week
                        </div>
                    </div>
                </>
            )}

            {/* Expanded View */}
            {isExpanded && stats && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Calendar className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Episode Activity</h2>
                                <p className="text-sm text-muted-foreground">Last 90 days</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-muted/50 rounded-lg transition-colors group"
                        >
                            <ChevronUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Flame className="h-4 w-4 text-orange-500" />
                                <span className="text-xs text-muted-foreground">Current Streak</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-400">
                                {stats.currentStreak} days
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                <span className="text-xs text-muted-foreground">Longest Streak</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-400">
                                {stats.longestStreak} days
                            </div>
                        </div>
                    </div>

                    {/* Heat Map */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                            Activity Map
                        </h4>

                        <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 rounded-xl p-4 overflow-x-auto">
                            <GitHubStyleHeatMap activities={activities} getIntensityColor={getIntensityColor} />

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
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
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
                            <div className="text-xs text-muted-foreground">Avg/Active Day</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EpisodeActivityWidget;
