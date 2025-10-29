/**
 * Enhanced Analytics Chart - Hybrid Approach
 * Tracks Movies, Series Seasons, and Episodes separately for comprehensive viewing analytics
 */
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Movie } from "./MovieCard";
import { seriesService } from "@/services/seriesService";
import { TrendingUp, Film, Tv, Play, ChevronDown, ChevronUp } from "lucide-react";

interface EnhancedAnalyticsChartProps {
  movies: Movie[];
}

interface ChartDataPoint {
  name: string;
  label: string;
  fullDate: string;
  dayName: string;
  movies: number;
  seasons: number;
  episodes: number;
  total: number;
}

interface SeasonData {
  id: string;
  seriesId: string;
  seasonNumber: number;
  status: string;
  watchDate?: string;
}

interface EpisodeData {
  id: string;
  seasonId: string;
  watched: boolean;
  watchDate?: string;
}

const RANGE_CONFIG = {
  days: { window: 30, label: "Days" },
  weeks: { window: 12, label: "Weeks" },
  months: { window: 12, label: "Months" },
  year: { window: 5, label: "Year" },
} as const;

type TimeRange = keyof typeof RANGE_CONFIG;

const EnhancedAnalyticsChart = ({ movies }: EnhancedAnalyticsChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("days");
  const [filterCategory, setFilterCategory] = useState<"all" | "movies" | "seasons" | "episodes">("all");
  const [seasonsData, setSeasonsData] = useState<SeasonData[]>([]);
  const [episodesData, setEpisodesData] = useState<EpisodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch seasons and episodes data
  useEffect(() => {
    const fetchSeriesData = async () => {
      setLoading(true);
      try {
        const allSeasons = await seriesService.seasons.getAllSeasons();
        setSeasonsData(allSeasons);

        // Fetch episodes for all seasons
        const episodePromises = allSeasons.map(season =>
          seriesService.episodes.getSeasonEpisodes(season.id)
        );
        const episodeArrays = await Promise.all(episodePromises);
        const allEpisodes = episodeArrays.flat();
        setEpisodesData(allEpisodes);
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesData();
  }, []);

  // Generate comprehensive chart data
  const generateChartData = (): ChartDataPoint[] => {
    if (loading) return [];

    const watchedMovies = movies.filter(m => m.status === "watched" && m.watchDate);
    const completedSeasons = seasonsData.filter(s => s.status === "completed" && s.watchDate);
    const watchedEpisodes = episodesData.filter(e => e.watched && e.watchDate);

    const now = new Date();
    const data: ChartDataPoint[] = [];
    
    switch (timeRange) {
      case "days": {
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const fullDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          const dayMovies = watchedMovies.filter(m => {
            const watchDate = new Date(m.watchDate!);
            return watchDate.toDateString() === date.toDateString();
          }).length;

          const daySeasons = completedSeasons.filter(s => {
            const watchDate = new Date(s.watchDate!);
            return watchDate.toDateString() === date.toDateString();
          }).length;

          const dayEpisodes = watchedEpisodes.filter(e => {
            const watchDate = new Date(e.watchDate!);
            return watchDate.toDateString() === date.toDateString();
          }).length;

          data.push({
            name: dateStr,
            label: dateStr,
            fullDate,
            dayName,
            movies: dayMovies,
            seasons: daySeasons,
            episodes: dayEpisodes,
            total: dayMovies + daySeasons + dayEpisodes
          });
        }
        break;
      }
      case "weeks": {
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          const fullDate = `Week of ${weekStart.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric' 
          })} - ${weekEnd.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}`;

          const weekMovies = watchedMovies.filter(m => {
            const watchDate = new Date(m.watchDate!);
            return watchDate >= weekStart && watchDate <= weekEnd;
          }).length;

          const weekSeasons = completedSeasons.filter(s => {
            const watchDate = new Date(s.watchDate!);
            return watchDate >= weekStart && watchDate <= weekEnd;
          }).length;

          const weekEpisodes = watchedEpisodes.filter(e => {
            const watchDate = new Date(e.watchDate!);
            return watchDate >= weekStart && watchDate <= weekEnd;
          }).length;

          data.push({
            name: weekLabel,
            label: weekLabel,
            fullDate,
            dayName: '',
            movies: weekMovies,
            seasons: weekSeasons,
            episodes: weekEpisodes,
            total: weekMovies + weekSeasons + weekEpisodes
          });
        }
        break;
      }
      case "months": {
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          const fullDate = date.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          });

          const monthMovies = watchedMovies.filter(m => {
            const watchDate = new Date(m.watchDate!);
            return watchDate.getMonth() === date.getMonth() && 
                   watchDate.getFullYear() === date.getFullYear();
          }).length;

          const monthSeasons = completedSeasons.filter(s => {
            const watchDate = new Date(s.watchDate!);
            return watchDate.getMonth() === date.getMonth() && 
                   watchDate.getFullYear() === date.getFullYear();
          }).length;

          const monthEpisodes = watchedEpisodes.filter(e => {
            const watchDate = new Date(e.watchDate!);
            return watchDate.getMonth() === date.getMonth() && 
                   watchDate.getFullYear() === date.getFullYear();
          }).length;

          data.push({
            name: monthName,
            label: monthName,
            fullDate,
            dayName: '',
            movies: monthMovies,
            seasons: monthSeasons,
            episodes: monthEpisodes,
            total: monthMovies + monthSeasons + monthEpisodes
          });
        }
        break;
      }
      case "year": {
        const currentYear = now.getFullYear();
        for (let i = 4; i >= 0; i--) {
          const year = currentYear - i;

          const yearMovies = watchedMovies.filter(m => {
            const watchDate = new Date(m.watchDate!);
            return watchDate.getFullYear() === year;
          }).length;

          const yearSeasons = completedSeasons.filter(s => {
            const watchDate = new Date(s.watchDate!);
            return watchDate.getFullYear() === year;
          }).length;

          const yearEpisodes = watchedEpisodes.filter(e => {
            const watchDate = new Date(e.watchDate!);
            return watchDate.getFullYear() === year;
          }).length;

          data.push({
            name: year.toString(),
            label: year.toString(),
            fullDate: year.toString(),
            dayName: '',
            movies: yearMovies,
            seasons: yearSeasons,
            episodes: yearEpisodes,
            total: yearMovies + yearSeasons + yearEpisodes
          });
        }
        break;
      }
    }
    return data;
  };

  const allChartData = generateChartData();
  
  const chartData = filterCategory === "all" 
    ? allChartData 
    : allChartData.map(item => ({
        ...item,
        movies: filterCategory === "movies" ? item.movies : 0,
        seasons: filterCategory === "seasons" ? item.seasons : 0,
        episodes: filterCategory === "episodes" ? item.episodes : 0,
      }));
  
  const chartConfig = {
    movies: {
      label: "Movies",
      color: "#8b5cf6",
    },
    seasons: {
      label: "Seasons",
      color: "#06b6d4",
    },
    episodes: {
      label: "Episodes",
      color: "#ec4899",
    },
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 border border-border/60 rounded-lg p-3 shadow-lg backdrop-blur-sm">
          <div className="space-y-2">
            <div className="font-medium text-sm">
              {data.fullDate}
            </div>
            {data.dayName && (
              <div className="text-xs text-muted-foreground">
                {data.dayName}
              </div>
            )}
            <div className="space-y-1">
              {payload.map((entry: any, index: number) => {
                if (entry.value === 0) return null;
                return (
                  <div key={index} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm capitalize">{entry.dataKey}</span>
                    </div>
                    <span className="font-medium text-sm">{entry.value}</span>
                  </div>
                );
              })}
              <div className="border-t border-border/40 pt-1 mt-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">Total Activity</span>
                  <span className="font-medium text-sm">{data.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate summary stats
  const totalStats = allChartData.reduce(
    (acc, item) => ({
      movies: acc.movies + item.movies,
      seasons: acc.seasons + item.seasons,
      episodes: acc.episodes + item.episodes,
      total: acc.total + item.total,
    }),
    { movies: 0, seasons: 0, episodes: 0, total: 0 }
  );

  // Reset scroll when range changes
  useEffect(() => {
    if (scrollContainerRef.current && chartData.length > 0) {
      const container = scrollContainerRef.current;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      container.scrollLeft = scrollWidth - clientWidth;
    }
  }, [chartData, timeRange]);

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/60">
        <CardContent className="flex items-center justify-center h-80">
          <div className="text-muted-foreground">Loading enhanced analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/60">
      <CardHeader className="pb-4">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-muted/20 rounded-lg p-2 -m-2 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Enhanced Viewing Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {isExpanded ? RANGE_CONFIG[timeRange].label : 'Click to expand'}
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Detailed breakdown of your viewing activity
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Film className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-muted-foreground">Movies</span>
                </div>
                <div className="text-xl font-bold text-purple-400">{totalStats.movies}</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Tv className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs text-muted-foreground">Seasons</span>
                </div>
                <div className="text-xl font-bold text-cyan-400">{totalStats.seasons}</div>
              </div>
              <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Play className="h-4 w-4 text-pink-400" />
                  <span className="text-xs text-muted-foreground">Episodes</span>
                </div>
                <div className="text-xl font-bold text-pink-400">{totalStats.episodes}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
                <div className="text-xl font-bold text-green-400">{totalStats.total}</div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-full">
              {/* Time Range Selector */}
              <div className="flex gap-2 mb-4">
                {Object.keys(RANGE_CONFIG).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range as TimeRange)}
                    className={`${
                      timeRange === range
                        ? "bg-gradient-to-r from-primary via-purple-500 to-pink-500"
                        : "bg-transparent border-border/60 text-muted-foreground hover:text-white"
                    }`}
                  >
                    {RANGE_CONFIG[range as TimeRange].label}
                  </Button>
                ))}
              </div>
              
              {/* Legend - Clickable filters */}
              <div className="flex items-center gap-6 text-sm">
                <button 
                  onClick={() => setFilterCategory(filterCategory === "movies" ? "all" : "movies")}
                  className={`flex items-center gap-2 transition-opacity hover:opacity-100 cursor-pointer ${
                    filterCategory !== "all" && filterCategory !== "movies" ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                  <span className="text-muted-foreground">Movies</span>
                </button>
                <button 
                  onClick={() => setFilterCategory(filterCategory === "seasons" ? "all" : "seasons")}
                  className={`flex items-center gap-2 transition-opacity hover:opacity-100 cursor-pointer ${
                    filterCategory !== "all" && filterCategory !== "seasons" ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-[#06b6d4]" />
                  <span className="text-muted-foreground">Seasons</span>
                </button>
                <button 
                  onClick={() => setFilterCategory(filterCategory === "episodes" ? "all" : "episodes")}
                  className={`flex items-center gap-2 transition-opacity hover:opacity-100 cursor-pointer ${
                    filterCategory !== "all" && filterCategory !== "episodes" ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-[#ec4899]" />
                  <span className="text-muted-foreground">Episodes</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent className="px-6 pb-6">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-80 text-muted-foreground">
              No data available for this range.
            </div>
          ) : (
            <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide w-full">
            <ChartContainer 
              config={chartConfig} 
              className="!aspect-auto min-w-[800px]" 
              style={{ height: 350, minWidth: 800 }}
            >
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 30, right: 30, left: 20, bottom: 30 }}
                >
                  <defs>
                    <linearGradient id="moviesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="seasonsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="episodesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    minTickGap={20}
                    interval="preserveStartEnd"
                    angle={timeRange === 'days' ? -45 : 0}
                    textAnchor={timeRange === 'days' ? 'end' : 'middle'}
                    height={timeRange === 'days' ? 60 : 40}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[0, 'dataMax + 1']}
                    allowDecimals={false}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} trigger="click" />
                  <Area
                    type="monotone"
                    dataKey="movies"
                    stackId="1"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#moviesGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="seasons"
                    stackId="1"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#seasonsGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="episodes"
                    stackId="1"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fill="url(#episodesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedAnalyticsChart;