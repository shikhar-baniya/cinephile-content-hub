/**
 * UI/UX Improvements:
 * - Remove the title
 * - Center the range options
 * - Add a slider to scroll through the chart data
 * - Adjust chart margins for better fit
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
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

  // Debug: log incoming movies
  console.log("AnalyticsChart movies prop:", movies);

  // Generate all chart data for the selected range
  const generateChartData = () => {
    const watchedMovies = movies.filter(m => m.status === "watched" && m.updatedAt);
    if (watchedMovies.length === 0) return [];
    const now = new Date();
    const data: { name: string; label: string; movies: number; series: number; total: number }[] = [];
    switch (timeRange) {
      case "days": {
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const dayMovies = watchedMovies.filter(m => {
            const updatedAt = new Date(m.updatedAt);
            return updatedAt.toDateString() === date.toDateString();
          });
          data.push({
            name: (30 - i).toString(), // 1, 2, 3, ...
            label: dateStr,
            movies: dayMovies.filter(m => m.category === "Movie").length,
            series: dayMovies.filter(m => m.category === "Series").length,
            total: dayMovies.length
          });
        }
        break;
      }
      case "weeks": {
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekMovies = watchedMovies.filter(m => {
            const updatedAt = new Date(m.updatedAt);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return updatedAt >= weekStart && updatedAt <= weekEnd;
          });
          data.push({
            name: (24 - i).toString(),
            label: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            movies: weekMovies.filter(m => m.category === "Movie").length,
            series: weekMovies.filter(m => m.category === "Series").length,
            total: weekMovies.length
          });
        }
        break;
      }
      case "months": {
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          const monthMovies = watchedMovies.filter(m => {
            const updatedAt = new Date(m.updatedAt);
            return updatedAt.getMonth() === date.getMonth() && 
                   updatedAt.getFullYear() === date.getFullYear();
          });
          data.push({
            name: (24 - i).toString(),
            label: monthName,
            movies: monthMovies.filter(m => m.category === "Movie").length,
            series: monthMovies.filter(m => m.category === "Series").length,
            total: monthMovies.length
          });
        }
        break;
      }
      case "year": {
        const currentYear = now.getFullYear();
        for (let i = 9; i >= 0; i--) {
          const year = currentYear - i;
          const yearMovies = watchedMovies.filter(m => {
            const updatedAt = new Date(m.updatedAt);
            return updatedAt.getFullYear() === year;
          });
          data.push({
            name: (10 - i).toString(),
            label: year.toString(),
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

  const chartData = generateChartData();
  const chartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--primary))",
    },
    movies: {
      label: "Movies",
      color: "#8b5cf6",
    },
    series: {
      label: "Series",
      color: "#ec4899",
    },
  };

  // Reset slider when range changes
  const handleRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  // Chart label for x axis
  const xAxisLabel = {
    days: "Day",
    weeks: "Week",
    months: "Month",
    year: "Year"
  }[timeRange];

  // Debug: log allChartData and chartData after generation
  useEffect(() => {
    console.log("allChartData:", chartData);
    // Check for valid updatedAt
    movies.forEach(m => {
      if (m.status === "watched" && (!m.updatedAt || isNaN(new Date(m.updatedAt).getTime()))) {
        console.warn("Movie with invalid updatedAt:", m);
      }
    });
  }, [movies, chartData]);

  return (
    <Card className="bg-card/50 border-border/60">
      <CardHeader className="pb-0">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex gap-2 mb-2">
            {Object.keys(RANGE_CONFIG).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => handleRangeChange(range as TimeRange)}
                className={`$ {
                  timeRange === range
                    ? "bg-gradient-to-r from-primary via-purple-500 to-pink-500"
                    : "bg-transparent border-border/60 text-muted-foreground hover:text-white"
                }`}
              >
                {RANGE_CONFIG[range as TimeRange].label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No data available for this range.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-transparent" style={{ width: '100%' }}>
            <ChartContainer config={chartConfig} className="!aspect-auto min-w-[700px]" style={{ height: 320, minWidth: 700 }}>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    minTickGap={0}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    domain={[0, 'dataMax + 1']}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#totalGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-center mt-2 text-xs text-muted-foreground">
                <span>{xAxisLabel}</span>
              </div>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;
