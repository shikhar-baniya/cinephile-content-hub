import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  Clock, 
  Play, 
  Film, 
  Tv, 
  Star, 
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart
} from "lucide-react";
import { Movie } from "./MovieCard";

interface MovieStatsProps {
  movies: Movie[];
}

interface GenreStats {
  name: string;
  count: number;
  averageRating: number;
  percentage: number;
}

interface PlatformStats {
  name: string;
  count: number;
  percentage: number;
}

interface YearStats {
  year: number;
  count: number;
}

const MovieStats = ({ movies }: MovieStatsProps) => {
  const stats = useMemo(() => {
    const total = movies.length;
    if (total === 0) return null;

    // Status counts
    const watched = movies.filter(m => m.status === 'watched').length;
    const watching = movies.filter(m => m.status === 'watching').length;
    const wantToWatch = movies.filter(m => m.status === 'want-to-watch').length;

    // Category counts
    const movieCount = movies.filter(m => m.category === 'Movie').length;
    const seriesCount = movies.filter(m => m.category === 'Series').length;
    const shortFilmCount = movies.filter(m => m.category === 'Short-Film').length;

    // Average rating
    const averageRating = movies.reduce((sum, movie) => sum + movie.rating, 0) / total;

    // Genre analysis
    const genreMap = new Map<string, { count: number; totalRating: number }>();
    movies.forEach(movie => {
      const genres = movie.genre.split(',').map(g => g.trim());
      genres.forEach(genre => {
        if (genre) {
          const existing = genreMap.get(genre) || { count: 0, totalRating: 0 };
          genreMap.set(genre, {
            count: existing.count + 1,
            totalRating: existing.totalRating + movie.rating
          });
        }
      });
    });

    const genreStats: GenreStats[] = Array.from(genreMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        averageRating: data.totalRating / data.count,
        percentage: (data.count / total) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Platform analysis
    const platformMap = new Map<string, number>();
    movies.forEach(movie => {
      const count = platformMap.get(movie.platform) || 0;
      platformMap.set(movie.platform, count + 1);
    });

    const platformStats: PlatformStats[] = Array.from(platformMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Year analysis (for watched movies)
    const watchedMovies = movies.filter(m => m.status === 'watched' && m.watchDate);
    const yearMap = new Map<number, number>();
    watchedMovies.forEach(movie => {
      if (movie.watchDate) {
        const year = new Date(movie.watchDate).getFullYear();
        const count = yearMap.get(year) || 0;
        yearMap.set(year, count + 1);
      }
    });

    const yearStats: YearStats[] = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year - a.year)
      .slice(0, 5);

    // High-rated content (8.0+)
    const highRated = movies.filter(m => m.rating >= 8.0).length;
    const highRatedPercentage = (highRated / total) * 100;

    // Recently added (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyAdded = movies.filter(m => 
      new Date(m.createdAt) >= thirtyDaysAgo
    ).length;

    return {
      total,
      watched,
      watching,
      wantToWatch,
      movieCount,
      seriesCount,
      shortFilmCount,
      averageRating,
      genreStats,
      platformStats,
      yearStats,
      highRated,
      highRatedPercentage,
      recentlyAdded,
      watchedPercentage: (watched / total) * 100,
      watchingPercentage: (watching / total) * 100,
      wantToWatchPercentage: (wantToWatch / total) * 100
    };
  }, [movies]);

  if (!stats) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No movies in your collection yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentlyAdded} added this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watched</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.watched}</div>
            <Progress value={stats.watchedPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.watchedPercentage.toFixed(1)}% of collection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.highRated} highly rated (8.0+)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Watching</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.watching}</div>
            <p className="text-xs text-muted-foreground">
              {stats.wantToWatch} in watchlist
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Content Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  <span className="text-sm">Movies</span>
                </div>
                <Badge variant="outline">{stats.movieCount}</Badge>
              </div>
              <Progress value={(stats.movieCount / stats.total) * 100} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="h-4 w-4" />
                  <span className="text-sm">Series</span>
                </div>
                <Badge variant="outline">{stats.seriesCount}</Badge>
              </div>
              <Progress value={(stats.seriesCount / stats.total) * 100} />
            </div>
            
            {stats.shortFilmCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    <span className="text-sm">Short Films</span>
                  </div>
                  <Badge variant="outline">{stats.shortFilmCount}</Badge>
                </div>
                <Progress value={(stats.shortFilmCount / stats.total) * 100} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Genres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.genreStats.slice(0, 6).map((genre, index) => (
                <div key={genre.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{genre.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{genre.count}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{genre.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={genre.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform & Year Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.platformStats.slice(0, 5).map((platform) => (
                <div key={platform.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{platform.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{platform.count}</Badge>
                    <span className="text-xs text-muted-foreground w-12">
                      {platform.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {stats.yearStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Watch Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.yearStats.map((year) => (
                  <div key={year.year} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{year.year}</span>
                    <Badge variant="outline">{year.count} watched</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600">Watched</span>
                <span className="text-sm">{stats.watched}/{stats.total}</span>
              </div>
              <Progress value={stats.watchedPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {stats.watchedPercentage.toFixed(1)}% completed
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">Watching</span>
                <span className="text-sm">{stats.watching}/{stats.total}</span>
              </div>
              <Progress value={stats.watchingPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {stats.watchingPercentage.toFixed(1)}% in progress
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-600">Watchlist</span>
                <span className="text-sm">{stats.wantToWatch}/{stats.total}</span>
              </div>
              <Progress value={stats.wantToWatchPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {stats.wantToWatchPercentage.toFixed(1)}% planned
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MovieStats;