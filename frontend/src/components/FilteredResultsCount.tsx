import { Film, Tv, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Movie } from "./MovieCard";
import { DateFilterValue } from "./DateFilter";

interface FilteredResultsCountProps {
  movies: Movie[];
  dateFilter: DateFilterValue | null;
}

const FilteredResultsCount = ({ movies, dateFilter }: FilteredResultsCountProps) => {
  if (!dateFilter) return null;

  const movieCount = movies.filter(m => m.category === "Movie").length;
  const seriesCount = movies.filter(m => m.category === "Series").length;
  const totalCount = movies.length;

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-foreground">Filtered Results</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {dateFilter.label}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Total Count */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{totalCount}</div>
          </div>

          {/* Movies Count */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Film className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">Movies</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{movieCount}</div>
          </div>

          {/* Series Count */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Tv className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-muted-foreground">Series</span>
            </div>
            <div className="text-2xl font-bold text-cyan-400">{seriesCount}</div>
          </div>

          {/* Watch Status */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-xs text-muted-foreground">Watched</span>
            </div>
            <div className="text-lg font-bold text-yellow-400">
              {movies.filter(m => m.status === 'watched').length}
            </div>
          </div>
        </div>

        {totalCount === 0 && (
          <div className="text-center mt-4 p-4 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              No content found for the selected {dateFilter.type === 'specific' ? 'date' : 'month'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try selecting a different date or clear the filter to see all content
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilteredResultsCount;