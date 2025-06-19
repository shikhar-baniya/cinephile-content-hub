
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterBarProps {
  statusFilter: string;
  genreFilter: string;
  platformFilter: string;
  onStatusChange: (status: string) => void;
  onGenreChange: (genre: string) => void;
  onPlatformChange: (platform: string) => void;
  onClearFilters: () => void;
  genres: string[];
  platforms: string[];
}

const FilterBar = ({
  statusFilter,
  genreFilter,
  platformFilter,
  onStatusChange,
  onGenreChange,
  onPlatformChange,
  onClearFilters,
  genres,
  platforms,
}: FilterBarProps) => {
  const hasActiveFilters = statusFilter !== "all" || genreFilter !== "all" || platformFilter !== "all";

  return (
    <div className="bg-card/20 backdrop-blur-xl border border-border/20 rounded-xl p-3 mb-6 animate-slide-up">
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
        </div>
        
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[100px] md:w-[140px] bg-background/50 border-border/60 text-xs md:text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-lg border-border/40">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="watched">Watched</SelectItem>
            <SelectItem value="watching">Watching</SelectItem>
            <SelectItem value="want-to-watch">Want to Watch</SelectItem>
          </SelectContent>
        </Select>

        <Select value={genreFilter} onValueChange={onGenreChange}>
          <SelectTrigger className="w-[100px] md:w-[140px] bg-background/50 border-border/60 text-xs md:text-sm">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-lg border-border/40">
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={platformFilter} onValueChange={onPlatformChange}>
          <SelectTrigger className="w-[100px] md:w-[140px] bg-background/50 border-border/60 text-xs md:text-sm">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-lg border-border/40">
            <SelectItem value="all">All Platforms</SelectItem>
            {platforms.map((platform) => (
              <SelectItem key={platform} value={platform}>
                {platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="border-border/60 hover:bg-destructive/20 hover:border-destructive/40 text-xs md:text-sm p-2 md:px-3"
          >
            <X className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
            <span className="hidden md:inline">Clear Filters</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
