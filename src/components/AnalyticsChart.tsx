
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Movie } from "./MovieCard";

interface AnalyticsChartProps {
  movies: Movie[];
}

const AnalyticsChart = ({ movies }: AnalyticsChartProps) => {
  const [timeRange, setTimeRange] = useState<"days" | "weeks" | "months" | "year">("days");

  const generateChartData = () => {
    const watchedMovies = movies.filter(m => m.status === "watched" && m.watchDate);
    
    if (watchedMovies.length === 0) {
      return [];
    }

    const now = new Date();
    const data: { name: string; movies: number; series: number; total: number }[] = [];

    switch (timeRange) {
      case "days": {
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          const dayMovies = watchedMovies.filter(m => {
            const watchDate = new Date(m.watchDate!);
            return watchDate.toDateString() === date.toDateString();
          });
          
          data.push({
            name: dateStr,
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
          
          const weekMovies = watchedMovies.filter(m => {
            const watchDate = new Date(m.watchDate!);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return watchDate >= weekStart && watchDate <= weekEnd;
          });
          
          data.push({
            name: `Week ${12 - i}`,
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
          
          const monthMovies = watchedMovies.filter(m => {
            const watchDate = new Date(m.watchDate!);
            return watchDate.getMonth() === date.getMonth() && 
                   watchDate.getFullYear() === date.getFullYear();
          });
          
          data.push({
            name: monthName,
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

  return (
    <Card className="bg-card/50 border-border/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Watching Analytics</CardTitle>
          <div className="flex gap-2">
            {(["days", "weeks", "months", "year"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={`${
                  timeRange === range
                    ? "bg-gradient-to-r from-primary via-purple-500 to-pink-500"
                    : "bg-transparent border-border/60 text-muted-foreground hover:text-white"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
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
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;
