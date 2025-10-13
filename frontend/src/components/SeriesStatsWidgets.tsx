import { Movie } from "./MovieCard";
import SeriesProgressWidget from "./SeriesProgressWidget";
import EpisodeActivityWidget from "./EpisodeActivityWidget";

interface SeriesStatsWidgetsProps {
    movies: Movie[];
}

/**
 * SeriesStatsWidgets - Container for series-specific analytics widgets
 * 
 * This component displays two key widgets:
 * 1. Series Progress Tracker - Shows currently watching series with progress bars
 * 2. Episode Activity Heat Map - GitHub-style activity calendar showing watch patterns
 * 
 * Usage:
 * ```tsx
 * <SeriesStatsWidgets movies={movies} />
 * ```
 * 
 * Or use widgets individually:
 * ```tsx
 * <SeriesProgressWidget movies={movies} />
 * <EpisodeActivityWidget />
 * ```
 */
const SeriesStatsWidgets = ({ movies }: SeriesStatsWidgetsProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6 auto-rows-[minmax(150px,auto)]">
            <SeriesProgressWidget movies={movies} />
            <EpisodeActivityWidget />
        </div>
    );
};

export default SeriesStatsWidgets;
