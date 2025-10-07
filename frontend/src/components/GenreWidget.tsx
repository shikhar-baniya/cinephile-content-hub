import { useState, useMemo } from "react";
import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Movie } from "./MovieCard";

interface GenreWidgetProps {
    movies: Movie[];
}

interface GenreData {
    name: string;
    count: number;
    percentage: number;
    lastWatched: Date | null;
}

const GenreWidget = ({ movies }: GenreWidgetProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const genreData = useMemo(() => {
        const genreMap = new Map<string, { count: number; lastWatched: Date | null }>();

        movies.forEach(movie => {
            const genres = movie.genre.split(',').map(g => g.trim());

            genres.forEach(genre => {
                if (!genre) return;

                const existing = genreMap.get(genre);
                const movieDate = movie.watchDate ? new Date(movie.watchDate) : null;

                if (existing) {
                    existing.count++;
                    if (movieDate && (!existing.lastWatched || movieDate > existing.lastWatched)) {
                        existing.lastWatched = movieDate;
                    }
                } else {
                    genreMap.set(genre, { count: 1, lastWatched: movieDate });
                }
            });
        });

        const totalMovies = movies.length;
        const data: GenreData[] = Array.from(genreMap.entries()).map(([name, info]) => ({
            name,
            count: info.count,
            percentage: (info.count / totalMovies) * 100,
            lastWatched: info.lastWatched
        }));

        return data.sort((a, b) => b.count - a.count);
    }, [movies]);

    const topGenre = genreData[0];

    const formatLastWatched = (date: Date | null) => {
        if (!date) return 'Never';

        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    return (
        <div className="floating-card rounded-xl p-4 col-span-2">
            <div
                className="cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
                <div className="space-y-1">
                    <div className="text-2xl font-bold">{topGenre?.name || 'None'}</div>
                    <div className="text-xs text-muted-foreground">Top Genre</div>
                    <div className="text-xs text-muted-foreground">{topGenre?.count || 0} items</div>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-6 space-y-3 animate-fade-in">
                    <div className="border-t border-border/40 pt-4">
                        <h4 className="text-sm font-medium mb-4">Genre Distribution</h4>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                            {genreData.map((genre, index) => (
                                <div key={genre.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-muted-foreground font-mono text-xs w-5 flex-shrink-0">
                                                {index + 1}.
                                            </span>
                                            <span className="font-medium truncate">{genre.name}</span>
                                            <span className="text-muted-foreground text-xs flex-shrink-0">
                                                ({genre.count})
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                                            <span className="text-xs text-muted-foreground">
                                                {formatLastWatched(genre.lastWatched)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 relative">
                                            <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-2 rounded-full transition-all duration-500 ease-out"
                                                    style={{
                                                        width: `${genre.percentage}%`,
                                                        background: `linear-gradient(90deg, 
                                                            hsl(${280 - index * 20}, 70%, 60%), 
                                                            hsl(${280 - index * 20}, 70%, 50%))`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground w-12 text-right flex-shrink-0">
                                            {genre.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {genreData.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No genres to display
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenreWidget;
