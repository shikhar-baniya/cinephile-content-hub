# Hybrid Bottom Sheet + Story Mode Implementation Guide

## ✅ Components Created

1. **BottomSheet.tsx** - Draggable bottom sheet with snap points
2. **StoryMode.tsx** - Full-screen story-style viewer with swipe navigation
3. **StatsBottomSheet.tsx** - Container with tabs and mode switching
4. **WatchTimeContent.tsx** - Standalone watch time content component

## 🚀 How to Integrate

### Step 1: Update StatsCards.tsx

Replace the individual stat widgets with a unified approach:

```tsx
import { useState } from "react";
import StatsBottomSheet from "./StatsBottomSheet";
import WatchTimeContent from "./WatchTimeContent";
// ... other imports

const StatsCards = ({ movies }: StatsCardsProps) => {
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [activeStatTab, setActiveStatTab] = useState<'watchTime' | 'seriesProgress' | 'activity'>('watchTime');
    
    // Fetch all stats data
    const [watchTimeStats, setWatchTimeStats] = useState<WatchTimeStats | null>(null);
    const [seriesProgressData, setSeriesProgressData] = useState(null);
    const [activityData, setActivityData] = useState(null);
    
    // ... fetch functions

    const handleStatClick = (tab: 'watchTime' | 'seriesProgress' | 'activity') => {
        setActiveStatTab(tab);
        setIsStatsOpen(true);
    };

    return (
        <div className="space-y-4">
            {/* Compact stat cards */}
            <div className="grid grid-cols-2 gap-3">
                {/* ... basic stats ... */}
                
                {/* Clickable Watch Time Widget */}
                <div 
                    className="floating-card rounded-xl p-3 cursor-pointer"
                    onClick={() => handleStatClick('watchTime')}
                >
                    {/* Compact view */}
                </div>
            </div>

            {/* Series widgets */}
            <div className="grid grid-cols-2 gap-3">
                <div onClick={() => handleStatClick('seriesProgress')}>
                    {/* Series Progress compact */}
                </div>
                <div onClick={() => handleStatClick('activity')}>
                    {/* Activity compact */}
                </div>
            </div>

            {/* Bottom Sheet with all stats */}
            <StatsBottomSheet
                isOpen={isStatsOpen}
                onClose={() => setIsStatsOpen(false)}
                initialTab={activeStatTab}
                movies={movies}
                watchTimeContent={
                    <WatchTimeContent 
                        stats={watchTimeStats} 
                        timeframeLabel={timeframeLabel}
                    />
                }
                seriesProgressContent={
                    <SeriesProgressContent data={seriesProgressData} />
                }
                activityContent={
                    <ActivityContent data={activityData} />
                }
            />
        </div>
    );
};
```

### Step 2: Create SeriesProgressContent.tsx

```tsx
import { TrendingUp } from "lucide-react";

interface SeriesProgressContentProps {
    data: any; // Use your SeriesProgress type
}

const SeriesProgressContent = ({ data }: SeriesProgressContentProps) => {
    if (!data || data.length === 0) {
        return <div className="text-center py-8">No series in progress</div>;
    }

    return (
        <div className="space-y-4">
            <h4 className="text-base font-semibold">Currently Watching</h4>
            {data.map((series: any) => (
                <div 
                    key={series.seriesId}
                    className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-xl p-4"
                >
                    <div className="flex gap-4">
                        {series.posterPath && (
                            <img 
                                src={series.posterPath}
                                alt={series.seriesTitle}
                                className="w-16 h-24 object-cover rounded-lg"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-bold text-base mb-1">{series.seriesTitle}</h3>
                            <div className="text-sm text-muted-foreground mb-2">
                                Season {series.currentSeason.seasonNumber} / {series.totalSeasons}
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span>{series.episodesWatched}/{series.totalEpisodes} episodes</span>
                                    <span className="font-medium">{series.seasonProgress}%</span>
                                </div>
                                <div className="w-full bg-muted/30 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                        style={{ width: `${series.seasonProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SeriesProgressContent;
```

### Step 3: Create ActivityContent.tsx

```tsx
import { Flame, TrendingUp, Calendar } from "lucide-react";
import GitHubStyleHeatMap from "./GitHubStyleHeatMap"; // Extract from EpisodeActivityWidget

interface ActivityContentProps {
    stats: ActivityStats | null;
    activities: DailyActivity[];
}

const ActivityContent = ({ stats, activities }: ActivityContentProps) => {
    if (!stats) {
        return <div className="text-center py-8">No activity data</div>;
    }

    const getIntensityColor = (intensity: number): string => {
        switch (intensity) {
            case 0: return 'bg-muted/20';
            case 1: return 'bg-blue-500/30';
            case 2: return 'bg-blue-500/50';
            case 3: return 'bg-blue-500/70';
            case 4: return 'bg-blue-500';
            default: return 'bg-muted/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Current Streak</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-400">
                        {stats.currentStreak} days
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Longest Streak</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">
                        {stats.longestStreak} days
                    </div>
                </div>
            </div>

            {/* Heat Map */}
            <div>
                <h4 className="text-base font-semibold mb-3">Activity Map</h4>
                <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 rounded-xl p-4 overflow-x-auto">
                    <GitHubStyleHeatMap 
                        activities={activities} 
                        getIntensityColor={getIntensityColor} 
                    />
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted/20 rounded-lg p-3">
                    <div className="text-xl font-bold text-blue-400">{stats.last7Days}</div>
                    <div className="text-xs text-muted-foreground">Last 7 Days</div>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                    <div className="text-xl font-bold text-blue-400">{stats.last30Days}</div>
                    <div className="text-xs text-muted-foreground">Last 30 Days</div>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                    <div className="text-xl font-bold text-blue-400">
                        {stats.averagePerDay.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg/Day</div>
                </div>
            </div>
        </div>
    );
};

export default ActivityContent;
```

## 🎨 Features

### Bottom Sheet:
- ✅ Drag to resize (snap points: 65vh, 90vh)
- ✅ Swipe down to dismiss
- ✅ Tabs for switching between stats
- ✅ Smooth animations
- ✅ Backdrop overlay

### Story Mode:
- ✅ Full-screen immersive view
- ✅ Swipe left/right to navigate
- ✅ Progress bars at top
- ✅ Tap left/right thirds to navigate (desktop)
- ✅ Keyboard navigation (arrows, ESC)
- ✅ Animated transitions

## 📱 Mobile Gestures

- **Drag handle down** → Resize/close sheet
- **Swipe left/right** → Navigate stories
- **Tap backdrop** → Close sheet
- **Swipe down** → Exit story mode

## 🎨 Styling

All components use Tailwind CSS and match your existing design system:
- Floating cards with gradients
- Blue/purple color scheme
- Smooth transitions
- Responsive design

## 🔧 Customization

You can customize:
- Snap points in BottomSheet
- Tab colors and icons
- Story backgrounds
- Animation durations
- Gesture thresholds

