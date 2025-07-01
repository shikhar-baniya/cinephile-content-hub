import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  Calendar,
  Eye,
  Play,
  Clock,
  Film,
  Tv,
  RotateCcw
} from "lucide-react";
import { Movie } from "./MovieCard";

export interface FilterOptions {
  search: string;
  status: string;
  category: string;
  genre: string;
  platform: string;
  ratingMin: number;
  ratingMax: number;
  yearMin: number;
  yearMax: number;
  watchDateFrom: string;
  watchDateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface MovieFiltersProps {
  movies: Movie[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

const MovieFilters = ({ movies, filters, onFiltersChange, onReset }: MovieFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Extract unique values from movies for filter options
  const uniqueGenres = Array.from(
    new Set(
      movies.flatMap(movie => 
        movie.genre.split(',').map(g => g.trim()).filter(g => g)
      )
    )
  ).sort();
  
  const uniquePlatforms = Array.from(
    new Set(movies.map(movie => movie.platform).filter(p => p))
  ).sort();
  
  const yearRange = movies.length > 0 ? {
    min: Math.min(...movies.map(m => m.releaseYear)),
    max: Math.max(...movies.map(m => m.releaseYear))
  } : { min: 2000, max: new Date().getFullYear() };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.genre !== 'all') count++;
    if (filters.platform !== 'all') count++;
    if (filters.ratingMin > 0) count++;
    if (filters.ratingMax < 10) count++;
    if (filters.yearMin > yearRange.min) count++;
    if (filters.yearMax < yearRange.max) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search movies, series..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.status === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('status', 'all')}
          >
            All
          </Button>
          <Button
            variant={filters.status === 'watched' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('status', 'watched')}
            className="gap-2"
          >
            <Eye className="h-3 w-3" />
            Watched
          </Button>
          <Button
            variant={filters.status === 'watching' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('status', 'watching')}
            className="gap-2"
          >
            <Play className="h-3 w-3" />
            Watching
          </Button>
          <Button
            variant={filters.status === 'want-to-watch' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('status', 'want-to-watch')}
            className="gap-2"
          >
            <Clock className="h-3 w-3" />
            Watchlist
          </Button>
        </div>

        {isExpanded && (
          <>
            <Separator />
            
            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Movie">
                      <div className="flex items-center gap-2">
                        <Film className="h-4 w-4" />
                        Movies
                      </div>
                    </SelectItem>
                    <SelectItem value="Series">
                      <div className="flex items-center gap-2">
                        <Tv className="h-4 w-4" />
                        Series
                      </div>
                    </SelectItem>
                    <SelectItem value="Short-Film">Short Films</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <Label>Genre</Label>
                <Select
                  value={filters.genre}
                  onValueChange={(value) => handleFilterChange('genre', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {uniqueGenres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={filters.platform}
                  onValueChange={(value) => handleFilterChange('platform', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {uniquePlatforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rating Range */}
            <div className="space-y-2">
              <Label>Rating Range</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Min:</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={filters.ratingMin}
                    onChange={(e) => handleFilterChange('ratingMin', parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Max:</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={filters.ratingMax}
                    onChange={(e) => handleFilterChange('ratingMax', parseFloat(e.target.value) || 10)}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{filters.ratingMin} - {filters.ratingMax}</span>
                </div>
              </div>
            </div>

            {/* Year Range */}
            <div className="space-y-2">
              <Label>Release Year Range</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">From:</Label>
                  <Input
                    type="number"
                    min={yearRange.min}
                    max={yearRange.max}
                    value={filters.yearMin}
                    onChange={(e) => handleFilterChange('yearMin', parseInt(e.target.value) || yearRange.min)}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">To:</Label>
                  <Input
                    type="number"
                    min={yearRange.min}
                    max={yearRange.max}
                    value={filters.yearMax}
                    onChange={(e) => handleFilterChange('yearMax', parseInt(e.target.value) || yearRange.max)}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{filters.yearMin} - {filters.yearMax}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Added</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="releaseYear">Release Year</SelectItem>
                    <SelectItem value="watchDate">Watch Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: 'asc' | 'desc') => handleFilterChange('sortOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MovieFilters;