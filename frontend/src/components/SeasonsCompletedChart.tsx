import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { seriesService, SeriesSeason } from "@/services/seriesService";

const RANGE_CONFIG = {
  days: { window: 7, label: "Days" },
  weeks: { window: 12, label: "Weeks" },
  months: { window: 12, label: "Months" },
  year: { window: 5, label: "Year" },
} as const;

type TimeRange = keyof typeof RANGE_CONFIG;

const SeasonsCompletedChart = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("days");
  const [seasons, setSeasons] = useState<SeriesSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAllSeasons();
  }, []);

  const fetchAllSeasons = async () => {
    setLoading(true);
    try {
      const allSeasons = await seriesService.seasons.getAllSeasons();
      setSeasons(allSeasons);
    } catch (error) {
      console.error('Error fetching seasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    const completedSeasons = seasons.filter(s => s.status === "completed" && s.watchDate);
    if (completedSeasons.length === 0) return [];
    
    const now = new Date();
    const data: { 
      name: string; 
      label: string; 
      fullDate: string;
      dayName: string;
      seasons: number;
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
          const daySeasons = completedSeasons.filter(s => {
            const watchDate = new Date(s.watchDate!);
            return watchDate.toDateString() === date.toDateString();
          });
          data.push({
            name: dateStr,
            label: dateStr,
            fullDate,
            dayName,
            seasons: daySeasons.length
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
          const weekSeasons = completedSeasons.filter(s => {
            const watchDate = new Date(s.watchDate!);
            return watchDate >= weekStart && watchDate <= weekEnd;
          });
          data.push({
            name: weekLabel,
            label: weekLabel,
            fullDate,
            dayName: '',
            seasons: weekSeasons.length
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
          const monthSeasons = completedSeasons.filter(s => {
            const watchDate = new Date(s.watchDate!);
            return watchDate.getMonth() === date.getMonth() && 
                   watchDate.getFullYear() === date.getFullYear();
          });
          data.push({
            name: monthName,
            label: monthName,
            fullDate,
            dayName: '',
            seasons: monthSeasons.length
          });
        }
        break;
      }
      case "year": {
        const currentYear = now.getFullYear();
        for (let i = 4; i >= 0; i--) {
          const year = currentYear - i;
          const yearSeasons = completedSeasons.filter(s => {
            const watchDate = new Date(s.watchDate!);
            return watchDate.getFullYear() === year;
          });
          data.push({
            name: year.toString(),
            label: year.toString(),
            fullDate: year.toString(),
            dayName: '',
            seasons: yearSeasons.length
          });
        }
        break;
      }
    }
    return data;
  };

  const chartData = generateChartData();
  
  const chartConfig = {
    seasons: {
      label: "Seasons",
      color: "#10b981",
    },
  };

  const CustomTooltip = ({ active, payload }: any) => {
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
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span className="text-sm">Seasons</span>
                </div>
                <span className="font-medium text-sm">{data.seasons}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

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
          <div className="text-muted-foreground">Loading seasons data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/60">
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center justify-center w-full">
          <h3 className="text-lg font-semibold mb-4">Seasons Completed</h3>
          <div className="flex gap-2 mb-4">
            {Object.keys(RANGE_CONFIG).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range as TimeRange)}
                className={`${
                  timeRange === range
                    ? "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"
                    : "bg-transparent border-border/60 text-muted-foreground hover:text-white"
                }`}
              >
                {RANGE_CONFIG[range as TimeRange].label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No season completion data available for this range.
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
                    <linearGradient id="seasonsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
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
                    dataKey="seasons"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#seasonsGradient)"
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

export default SeasonsCompletedChart;
