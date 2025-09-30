/**
 * UI/UX Improvements:
 * - Dual area charts for movies and series
 * - Improved tooltip with date information
 * - Better label formatting and spacing
 * - Hidden scrollbar with maintained scroll functionality
 * - Click-based tooltip interaction
 */
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Movie } from "./MovieCard";

interface AnalyticsChartProps {
  movies: Movie[];
}

const RANGE_CONFIG = {
  days: { window: 7, label: "Days" },
  weeks: { window: 12, label: "Weeks" },
  months: { window: 12, label: "Months" },
  year: { window: 5, label: "Year" },
} as const;

type TimeRange = keyof typeof RANGE_CONFIG;

const AnalyticsChart = ({ movies }: AnalyticsChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("days");
  const [filterCategory, setFilterCategory] = useState<"all" | "Movie" | "Series">("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate all chart data for the selected range
  const generateChartData = () => {
    const watchedMovies = movies.filter(m => m.status === "watched" && m.watchDate);
    if (watchedMovies.length === 0) return [];
    const now = new Date();
    const data: { 
      name: string; 
      label: string; 
      fullDate: string;
      dayName: string;
      movies: number; 
      series: number; 
      total: number 
    }[] = [];
    
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
          });
          data.push({
            name: dateStr,
            label: dateStr,
            fullDate,
            dayName,
            movies: dayMovies.filter(m => m.category === "Movie").length,
            series: dayMovies.filter(m => m.category === "Series").length,
            total: dayMovies.length
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
          });
          data.push({
            name: weekLabel,
            label: weekLabel,
            fullDate,
            dayName: '',
            movies: weekMovies.filter(m => m.category === "Movie").length,
            series: weekMovies.filter(m => m.category === "Series").length,
            total: weekMovies.length
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
          });
          data.push({
            name: monthName,
            label: monthName,
            fullDate,
            dayName: '',
            movies: monthMovies.filter(m => m.category === "Movie").length,
            series: monthMovies.filter(m => m.category === "Series").length,
            total: monthMovies.length
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
          });
          data.push({
            name: year.toString(),
            label: year.toString(),
            fullDate: year.toString(),
            dayName: '',
            movies: yearMovies.filter(m => m.category === "Movie").length,
            series: yearMovies.filter(m => m.category === "Series").length,
            total: yearMovies.length
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
        movies: filterCategory === "Movie" ? item.movies : 0,
        series: filterCategory === "Series" ? item.series : 0,
      }));
  
  const chartConfig = {
    movies: {
      label: "Movies",
      color: "#8b5cf6",
    },
    series: {
      label: "Series",
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
              {payload.map((entry: any, index: number) => (
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
              ))}
              <div className="border-t border-border/40 pt-1 mt-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">Total</span>
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

  // Reset slider when range changes
  const handleRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  useEffect(() => {
    movies.forEach(m => {
      if (m.status === "watched" && (!m.watchDate || isNaN(new Date(m.watchDate).getTime()))) {
        // Movie with invalid watchDate - handled silently
      }
    });
  }, [movies, chartData]);

  useEffect(() => {
    if (scrollContainerRef.current && chartData.length > 0) {
      const container = scrollContainerRef.current;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      container.scrollLeft = scrollWidth - clientWidth;
    }
  }, [chartData, timeRange]);

  return (
    <Card className="bg-card/50 border-border/60">
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex gap-2 mb-4">
            {Object.keys(RANGE_CONFIG).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => handleRangeChange(range as TimeRange)}
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
              onClick={() => setFilterCategory(filterCategory === "Movie" ? "all" : "Movie")}
              className={`flex items-center gap-2 transition-opacity hover:opacity-100 cursor-pointer ${
                filterCategory === "Series" ? "opacity-30" : "opacity-100"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
              <span className="text-muted-foreground">Movies</span>
            </button>
            <button 
              onClick={() => setFilterCategory(filterCategory === "Series" ? "all" : "Series")}
              className={`flex items-center gap-2 transition-opacity hover:opacity-100 cursor-pointer ${
                filterCategory === "Movie" ? "opacity-30" : "opacity-100"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#ec4899]" />
              <span className="text-muted-foreground">Series</span>
            </button>
          </div>
        </div>
      </CardHeader>
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
                    <linearGradient id="seriesGradient" x1="0" y1="0" x2="0" y2="1">
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
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#moviesGradient)"
                    strokeDasharray="0"
                  />
                  <Area
                    type="monotone"
                    dataKey="series"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fill="url(#seriesGradient)"
                    strokeDasharray="0"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;
