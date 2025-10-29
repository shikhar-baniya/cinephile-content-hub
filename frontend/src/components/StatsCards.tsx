import { Film, Star, Clock, Tv, Calendar } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Movie } from "./MovieCard";
import AnalyticsChart from "./AnalyticsChart";
import EnhancedAnalyticsChart from "./EnhancedAnalyticsChart";
import GenreWidget from "./GenreWidget";
import StatsBottomSheet from "./StatsBottomSheet";
import WatchTimeContent from "./WatchTimeContent";
import SeriesProgressContent from "./SeriesProgressContent";
import ActivityContent from "./ActivityContent";
import UnlockStatsProgress from "./UnlockStatsProgress";
import LockedStatsPreview from "./LockedStatsPreview";
import { calculateStatsUnlockStatus } from "@/utils/statsUnlockHelper";
import { timeStatsService, WatchTimeStats } from "@/services/timeStatsService";
import { seriesService } from "@/services/seriesService";

interface StatsCardsProps {
    movies: Movie[];
}

const StatsCards = ({ movies }: StatsCardsProps) => {
    const userStats = useMemo(() => calculateStatsUnlockStatus(movies), [movies]);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [activeStatTab, setActiveStatTab] = useState<'watchTime' | 'seriesProgress' | 'activity'>('watchTime');

    // Stats data
    const [watchTimeStats, setWatchTimeStats] = useState<WatchTimeStats | null>(null);
    const [timeframeLabel, setTimeframeLabel] = useState('This year');
    const [seriesProgress, setSeriesProgress] = useState<any[]>([]);
    const [activityStats, setActivityStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);

    const watchedMovies = movies.filter(m => m.status === "watched");
    const allMovies = movies.filter(m => m.category === "Movie");
    const allSeries = movies.filter(m => m.category === "Series");
    const watchedSeries = allSeries.filter(m => m.status === "watched");
    const watchingSeries = movies.filter(m => m.category === 'Series' && m.status === 'watching');

    const averageRating = watchedMovies.length > 0
        ? (watchedMovies.reduce((acc, movie) => acc + movie.rating, 0) / watchedMovies.length).toFixed(1)
        : "0";

    useEffect(() => {
        fetchAllStats();
    }, [movies]);

    const fetchAllStats = async () => {
        try {
            // Fetch watch time
            let watchTime = await timeStatsService.calculateWatchTime(movies, 'thisYear');
            if (watchTime.totalMinutes === 0) {
                watchTime = await timeStatsService.calculateWatchTime(movies, 'allTime');
                setTimeframeLabel('All time');
            } else {
                setTimeframeLabel('This year');
            }
            setWatchTimeStats(watchTime);

            // Fetch series progress (simplified - you'd need proper implementation)
            const watchingSeriesList = movies.filter(m => m.category === 'Series' && m.status === 'watching');
            setSeriesProgress(watchingSeriesList.map(s => ({
                seriesId: s.id,
                seriesTitle: s.title,
                posterPath: s.poster,
                // Add more fields as needed
            })));

            // Fetch activity stats (simplified)
            // You'd implement this properly with your actual data
            setActivityStats({
                currentStreak: 0,
                longestStreak: 0,
                last7Days: 0,
                last30Days: 0,
                averagePerDay: 0
            });
            setActivities([]);

        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleStatClick = (tab: 'watchTime' | 'seriesProgress' | 'activity') => {
        setActiveStatTab(tab);
        setIsStatsOpen(true);
    };

    const topRowStats = [
        {
            title: "Total Movies",
            value: allMovies.length.toString(),
            icon: Film,
            description: `${allMovies.filter(m => m.status === "watched").length} watched`,
            color: "text-blue-400"
        },
        {
            title: "Total Series",
            value: allSeries.length.toString(),
            icon: Film,
            description: `${watchedSeries.length} watched`,
            color: "text-cyan-400"
        }
    ];

    const bottomRowStats = [
        {
            title: "Average Rating",
            value: averageRating,
            icon: Star,
            description: "out of 10",
            color: "text-yellow-400"
        }
    ];

    if (!userStats.isUnlocked) {
        return (
            <div className="space-y-6">
                <UnlockStatsProgress stats={userStats} />
                <LockedStatsPreview />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Compact Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {topRowStats.map((stat, index) => (
                    <div key={stat.title} className="floating-card rounded-xl p-3 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            <div className="text-xs text-muted-foreground">{stat.title}</div>
                        </div>
                        <div className="text-xl font-bold">{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground">{stat.description}</div>
                    </div>
                ))}
                {bottomRowStats.map((stat, index) => (
                    <div key={stat.title} className="floating-card rounded-xl p-3 animate-fade-in" style={{ animationDelay: `${(topRowStats.length + index) * 0.1}s` }}>
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            <div className="text-xs text-muted-foreground">{stat.title}</div>
                        </div>
                        <div className="text-xl font-bold">{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground">{stat.description}</div>
                    </div>
                ))}
                {/* Watch Time - Clickable */}
                <div
                    className="floating-card rounded-xl p-3 cursor-pointer hover:bg-card/80 hover:scale-[1.02] transition-all"
                    onClick={() => handleStatClick('watchTime')}
                >
                    <div className="flex items-center justify-between mb-1">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <div className="text-[10px] text-blue-400">View details →</div>
                    </div>
                    <div className="text-xl font-bold">
                        {watchTimeStats ?
                            `${Math.floor(watchTimeStats.totalHours)}h ${Math.round((watchTimeStats.totalHours % 1) * 60)}m`
                            : '0h'}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Watch Time</div>
                </div>
            </div>

            {/* Series Widgets - Clickable */}
            <div className="grid grid-cols-2 gap-3">
                <div
                    className="floating-card rounded-xl p-3 cursor-pointer hover:bg-card/80 hover:scale-[1.02] transition-all"
                    onClick={() => handleStatClick('seriesProgress')}
                >
                    <div className="flex items-center justify-between mb-1">
                        <Tv className="h-4 w-4 text-purple-400" />
                        <div className="text-[10px] text-purple-400">View details →</div>
                    </div>
                    <div className="text-xl font-bold">{watchingSeries.length}</div>
                    <div className="text-[10px] text-muted-foreground">Watching</div>
                </div>

                <div
                    className="floating-card rounded-xl p-3 cursor-pointer hover:bg-card/80 hover:scale-[1.02] transition-all"
                    onClick={() => handleStatClick('activity')}
                >
                    <div className="flex items-center justify-between mb-1">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <div className="text-[10px] text-blue-400">View details →</div>
                    </div>
                    <div className="text-xl font-bold">{activityStats?.currentStreak || 0}</div>
                    <div className="text-[10px] text-muted-foreground">Day Streak</div>
                </div>
            </div>

            {/* Genre Widget */}
            <GenreWidget movies={movies} />

            {/* Analytics Chart */}
            <AnalyticsChart movies={movies} />

            {/* Enhanced Analytics Chart */}
            <EnhancedAnalyticsChart movies={movies} />

            {/* Bottom Sheet with all detailed stats */}
            <StatsBottomSheet
                isOpen={isStatsOpen}
                onClose={() => setIsStatsOpen(false)}
                initialTab={activeStatTab}
                movies={movies}
                watchTimeContent={
                    <WatchTimeContent
                        stats={watchTimeStats}
                        timeframeLabel={timeframeLabel}
                    />
                }
                seriesProgressContent={
                    <SeriesProgressContent movies={movies} />
                }
                activityContent={
                    <ActivityContent />
                }
            />
        </div>
    );
};

export default StatsCards;
