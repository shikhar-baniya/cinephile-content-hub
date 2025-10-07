import { Film, Star, Clock } from "lucide-react";
import { useMemo } from "react";
import { Movie } from "./MovieCard";
import AnalyticsChart from "./AnalyticsChart";
import GenreWidget from "./GenreWidget";
import UnlockStatsProgress from "./UnlockStatsProgress";
import LockedStatsPreview from "./LockedStatsPreview";
import { calculateStatsUnlockStatus } from "@/utils/statsUnlockHelper";
import { timeStatsService } from "@/services/timeStatsService";
import { useState, useEffect } from "react";

interface StatsCardsProps {
    movies: Movie[];
}

const StatsCards = ({ movies }: StatsCardsProps) => {
    const userStats = useMemo(() => calculateStatsUnlockStatus(movies), [movies]);
    const [watchTimeHours, setWatchTimeHours] = useState(0);
    const [timeframeLabel, setTimeframeLabel] = useState('This year');

    const watchedMovies = movies.filter(m => m.status === "watched");
    const allMovies = movies.filter(m => m.category === "Movie");
    const allSeries = movies.filter(m => m.category === "Series");
    const watchedSeries = allSeries.filter(m => m.status === "watched");

    const averageRating = watchedMovies.length > 0
        ? (watchedMovies.reduce((acc, movie) => acc + movie.rating, 0) / watchedMovies.length).toFixed(1)
        : "0";

    useEffect(() => {
        const fetchWatchTime = async () => {
            try {
                let watchTime = await timeStatsService.calculateWatchTime(movies, 'thisYear');

                if (watchTime.totalMinutes === 0) {
                    watchTime = await timeStatsService.calculateWatchTime(movies, 'allTime');
                    setTimeframeLabel('All time');
                } else {
                    setTimeframeLabel('This year');
                }

                setWatchTimeHours(watchTime.totalHours);
            } catch (error) {
                console.error('Error fetching watch time:', error);
            }
        };

        fetchWatchTime();
    }, [movies]);

    const formatTime = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.round((hours % 1) * 60);
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
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
        },
        {
            title: "Average Rating",
            value: averageRating,
            icon: Star,
            description: "out of 10",
            color: "text-yellow-400"
        },
        {
            title: "Watch Time",
            value: formatTime(watchTimeHours),
            icon: Clock,
            description: timeframeLabel,
            color: "text-green-400"
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
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {topRowStats.map((stat, index) => (
                    <div key={stat.title} className="floating-card rounded-xl p-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.title}</div>
                            <div className="text-xs text-muted-foreground">{stat.description}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <GenreWidget movies={movies} />
            </div>

            <AnalyticsChart movies={movies} />
        </div>
    );
};

export default StatsCards;
