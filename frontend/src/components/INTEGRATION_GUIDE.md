# Quick Integration Guide for Series Tracking Widgets

## 🚀 Quick Start (5 minutes)

### Step 1: Import the Widgets

Add to your stats dashboard or main page:

```tsx
import SeriesStatsWidgets from '@/components/SeriesStatsWidgets';
```

### Step 2: Add to Your Layout

```tsx
function YourStatsPage() {
  const { movies } = useMovies(); // Your existing movies hook

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Your existing widgets */}
      <WatchTimeWidget movies={movies} />
      
      {/* ⭐ NEW: Add series tracking widgets */}
      <SeriesStatsWidgets movies={movies} />
    </div>
  );
}
```

### Step 3: That's it! 🎉

The widgets will automatically:
- Fetch series and episode data
- Calculate progress and activity
- Display interactive visualizations
- Handle loading and error states

---

## 🎨 Layout Examples

### Side-by-Side with Watch Time

```tsx
<div className="grid grid-cols-1 xl:grid-cols-3 gap-4 auto-rows-[minmax(150px,auto)]">
  <WatchTimeWidget movies={movies} />
  <SeriesProgressWidget movies={movies} />
  <EpisodeActivityWidget />
</div>
```

### Dedicated Series Section

```tsx
<section className="mb-8">
  <h2 className="text-2xl font-bold mb-4">📺 Series Analytics</h2>
  <SeriesStatsWidgets movies={movies} />
</section>

<section>
  <h2 className="text-2xl font-bold mb-4">🎬 General Stats</h2>
  <TimeStatsWidgets movies={movies} />
</section>
```

### Dashboard Grid

```tsx
<div className="dashboard-grid">
  {/* Top Row */}
  <WatchTimeWidget movies={movies} />
  <GenreWidget movies={movies} />
  <SeriesProgressWidget movies={movies} />
  
  {/* Bottom Row */}
  <EpisodeActivityWidget />
  <BingeStatsWidget />
</div>
```

---

## 📱 Responsive Behavior

The widgets are fully responsive:

- **Mobile (< 640px)**: Stack vertically, compact view by default
- **Tablet (640px - 1024px)**: 2-column grid
- **Desktop (> 1024px)**: 3-column grid
- **Expanded**: Always takes 2x2 grid space, scrollable content

---

## 🔧 Customization Options

### Change Colors

Edit the gradient classes in each component:

**SeriesProgressWidget.tsx**
```tsx
// Line 112: Change purple-500 to your color
border-purple-500/20 → border-blue-500/20
text-purple-400 → text-blue-400
```

**EpisodeActivityWidget.tsx**
```tsx
// Line 159: Change blue-500 to your color
border-blue-500/20 → border-green-500/20
text-blue-400 → text-green-400
```

### Adjust Timeframe

**EpisodeActivityWidget.tsx** - Line 52
```tsx
// Change from 90 days to 180 days
const last90Days = Array.from({ length: 180 }, (_, i) => {
  // ...
});
```

### Modify Heat Map Intensity

**EpisodeActivityWidget.tsx** - Line 57
```tsx
// Customize thresholds
if (count >= 10) intensity = 4;      // 10+ episodes = max
else if (count >= 7) intensity = 3;  // 7-9 episodes
else if (count >= 4) intensity = 2;  // 4-6 episodes
else intensity = 1;                   // 1-3 episodes
```

---

## 🧪 Testing with Sample Data

If you don't have series data yet, create test data:

```sql
-- Add a test series to movies table
INSERT INTO movies (id, title, genre, type, status)
VALUES ('test-series-1', 'Breaking Bad', 'Drama', 'series', 'watched');

-- Add season
INSERT INTO series_seasons (
  id, series_id, season_number, season_name,
  episode_count, episodes_watched, status
)
VALUES (
  'test-season-1', 'test-series-1', 1, 'Season 1',
  7, 3, 'watching'
);

-- Add episodes with dates
INSERT INTO series_episodes (
  id, season_id, episode_number, episode_name,
  watched, watch_date, duration_minutes
)
VALUES
  ('ep1', 'test-season-1', 1, 'Pilot', true, '2024-01-10', 45),
  ('ep2', 'test-season-1', 2, 'Cat's in the Bag', true, '2024-01-11', 45),
  ('ep3', 'test-season-1', 3, '...And the Bag''s in the River', true, '2024-01-12', 45);
```

---

## 🐛 Debugging

### Enable Console Logs

Check browser console for these messages:
- `📊 [WatchTime] Total watched movies: X`
- `📊 [WatchTime] Found seasons: X`
- Episode activity calculations

### Check Data

```tsx
// Add temporary logging
useEffect(() => {
  seriesService.seasons.getAllSeasons().then(seasons => {
    console.log('All seasons:', seasons);
  });
}, []);
```

### Common Issues

1. **"No series in progress"**: Add series with `status='watching'`
2. **Heat map empty**: Populate `watch_date` in episodes table
3. **Widget doesn't expand**: Check for CSS conflicts with `z-10` class

---

## 📊 Example Dashboard Layout

Here's a complete example dashboard:

```tsx
import React from 'react';
import WatchTimeWidget from '@/components/WatchTimeWidget';
import SeriesStatsWidgets from '@/components/SeriesStatsWidgets';
import TimeStatsWidgets from '@/components/TimeStatsWidgets';
import { useMovies } from '@/hooks/useMovies';

export default function StatsDashboard() {
  const { movies, loading } = useMovies();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Stats */}
      <section>
        <h1 className="text-3xl font-bold mb-6">📊 Your Stats</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-[minmax(150px,auto)]">
          <WatchTimeWidget movies={movies} />
        </div>
      </section>

      {/* Series Tracking */}
      <section>
        <h2 className="text-2xl font-bold mb-4">📺 Series Analytics</h2>
        <SeriesStatsWidgets movies={movies} />
      </section>

      {/* Detailed Stats */}
      <section>
        <h2 className="text-2xl font-bold mb-4">📈 Detailed Insights</h2>
        <TimeStatsWidgets movies={movies} />
      </section>
    </div>
  );
}
```

---

## ✅ Checklist

Before deploying:

- [ ] Database schema includes `series_seasons` and `series_episodes` tables
- [ ] Episodes have `watch_date` populated for activity tracking
- [ ] At least one series has `status='watching'` for progress widget
- [ ] API endpoints work: `/series/seasons/all`, `/series/seasons/:id/episodes`
- [ ] Widgets render without errors in console
- [ ] Expand/collapse animations work smoothly
- [ ] Mobile layout looks good (test on small screens)
- [ ] Colors match your app theme

---

## 🎯 Next Steps

After integration:

1. **Collect User Feedback**: Watch which widget users engage with most
2. **Add More KPIs**: Consider adding season completion rate, average rating per season
3. **Gamification**: Add achievements based on streaks and completion
4. **Social Features**: Share progress with friends
5. **Predictions**: ML-based watch time predictions

---

## 📞 Support

If you encounter issues:
1. Check the SERIES_WIDGETS_README.md for detailed documentation
2. Review the component source code comments
3. Verify database schema matches requirements
4. Test with sample data first

Happy tracking! 🍿📺
