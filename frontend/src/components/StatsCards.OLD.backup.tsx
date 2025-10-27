import { Film, Star } from "lucide-react";
import { useMemo } from "react";
import { Movie } from "./MovieCard";
import AnalyticsChart from "./AnalyticsChart";
import GenreWidget from "./GenreWidget";
import WatchTimeWidget from "./WatchTimeWidget";
import SeriesProgressWidget from "./SeriesProgressWidget";
import EpisodeActivityWidget from "./EpisodeActivityWidget";
import UnlockStatsProgress from "./UnlockStatsProgress";
import LockedStatsPreview from "./LockedStatsPreview";
import { calculateStatsUnlockStatus } from "@/utils/statsUnlockHelper";

interface StatsCardsProps {
    movies: Movie[];
}

const StatsCards = ({ movies }: StatsCardsProps) => {
    const userStats = useMemo(() => calculateStatsUnlockStatus(movies), [movies]);

    const watchedMovies = movies.filter(m => m.status === "watched");
    const allMovies = movies.filter(m => m.category === "Movie");
    const allSeries = movies.filter(m => m.category === "Series");
    const watchedSeries = allSeries.filter(m => m.status === "watched");

    const averageRating = watchedMovies.length > 0
        ? (watchedMovies.reduce((acc, movie) => acc + movie.rating, 0) / watchedMovies.length).toFixed(1)
        : "0";

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
            {/* Compact Stats Grid - All in one row */}
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
                <WatchTimeWidget movies={movies} />
            </div>

            {/* Series Widgets & Genre - Compact 2-column layout */}
            <div className="grid grid-cols-2 gap-3">
                <SeriesProgressWidget movies={movies} />
                <EpisodeActivityWidget />
            </div>

            {/* Genre Widget - Compact */}
            <GenreWidget movies={movies} />

            {/* Analytics Chart */}
            <AnalyticsChart movies={movies} />
        </div>
    );
};

export default StatsCards;
