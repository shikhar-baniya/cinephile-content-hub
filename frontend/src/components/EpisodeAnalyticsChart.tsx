/**
 * Episode and Season Analytics Chart
 * Shows detailed episode watching patterns and season completion metrics
 */
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";
import { episodeAnalyticsService, EpisodeAnalyticsData, SeasonAnalyticsData } from "@/services/episodeAnalyticsService";

const RANGE_CONFIG = {
  days: { window: 7, label: "Days" },
  weeks: { window: 12, label: "Weeks" },
  months: { window: 12, label: "Months" },
  year: { window: 5, label: "Year" },
} as const;

type TimeRange = keyof typeof RANGE_CONFIG;
type ChartType = "episodes" | "seasons";

const EpisodeAnalyticsChart = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("days");
  const [chartType, setChartType] = useState<ChartType>("episodes");
  const [episodeData, setEpisodeData] = useState<EpisodeAnalyticsData[]>([]);
  const [seasonData, setSeasonData] = useState<SeasonAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate date range for API calls
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "days":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "weeks":
        startDate.setDate(endDate.getDate() - (12 * 7));
        break;
      case "months":
        startDate.setMonth(endDate.getMonth() - 12);
        break;
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
    }

    return { startDate, endDate };
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      const [episodeResult, seasonResult] = await Promise.all([
        episodeAnalyticsService.getEpisodeWatchData(startDate, endDate),
        episodeAnalyticsService.getSeasonCompletionData(startDate, endDate)
      ]);

      setEpisodeData(episodeResult);
      setSeasonData(seasonResult);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  // Auto-scroll to latest data
  useEffect(() => {
    if (scrollContainerRef.current && !loading) {
      const container = scrollContainerRef.current;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      container.scrollLeft = scrollWidth - clientWidth;
    }
  }, [episodeData, seasonData, loading]);

  const chartConfig = {
    episodes: {
      label: "Episodes",
      color: "#8b5cf6",
    },
    seasons: {
      label: "Seasons",
      color: "#ec4899",
    },
    series: {
      label: "Series",
      color: "#06b6d4",
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 border border-border/60 rounded-lg p-3 shadow-lg backdrop-blur-sm">
          <div className="space-y-2">
            <div className="font-medium text-sm">
              {data.date}
            </div>
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
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      );
    }

    const data = chartType === "episodes" ? episodeData : seasonData;

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          No data available for this range.
        </div>
      );
    }

    return (
      <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide w-full">
        <ChartContainer
          config={chartConfig}
          className="!aspect-auto min-w-[800px]"
          style={{ height: 350, minWidth: 800 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            {chartType === "episodes" ? (
              <AreaChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 30 }}>
                <defs>
                  <linearGradient id="episodesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="seasonsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
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
                  dataKey="episodes"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#episodesGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="seasons"
                  stroke="#ec4899"
                  strokeWidth={2}
                  fill="url(#seasonsGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 30 }}>
                <XAxis
                  dataKey="date"
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
                <Bar
                  dataKey="seasonsCompleted"
                  fill="#8b5cf6"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="seriesCompleted"
                  fill="#ec4899"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  };

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

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-6 text-sm">
            <button
              onClick={() => setChartType("episodes")}
              className={`flex items-center gap-2 transition-opacity hover:opacity-100 cursor-pointer ${
                chartType === "seasons" ? "opacity-30" : "opacity-100"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
              <span className="text-muted-foreground">Episodes</span>
            </button>
            <button
              onClick={() => setChartType("seasons")}
              className={`flex items-center gap-2 transition-opacity hover:opacity-100 cursor-pointer ${
                chartType === "episodes" ? "opacity-30" : "opacity-100"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#ec4899]" />
              <span className="text-muted-foreground">Seasons</span>
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default EpisodeAnalyticsChart;