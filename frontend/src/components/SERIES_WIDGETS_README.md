# Series Tracking Widgets

Two new widgets specifically designed for tracking series watch progress and episode viewing patterns.

## 📺 SeriesProgressWidget

**Purpose**: Shows currently watching series with detailed progress bars and completion metrics.

### Features
- **Compact View**: Shows count of series currently watching
- **Expanded View**: 
  - Series poster thumbnails
  - Current season progress with episode count
  - Visual progress bars
  - Overall series completion percentage
  - Scrollable list for multiple series

### Usage

```tsx
import SeriesProgressWidget from '@/components/SeriesProgressWidget';

<SeriesProgressWidget movies={movies} />
```

### Data Requirements
- Requires `series_seasons` table with `status='watching'`
- Requires `series_episodes` table with watch tracking
- Movies array to get series titles and posters

### Visual Style
- Purple gradient theme (`purple-500`)
- Expandable card (2x2 grid span when expanded)
- Auto-scroll to view when expanded

---

## 📅 EpisodeActivityWidget

**Purpose**: GitHub-style activity heat map showing episode watching patterns over the last 90 days.

### Features
- **Compact View**: Shows current streak and weekly episode count
- **Expanded View**:
  - 90-day heat map with intensity colors
  - Current streak tracking
  - Longest streak record
  - Last 7/30 days statistics
  - Average episodes per active day

### Usage

```tsx
import EpisodeActivityWidget from '@/components/EpisodeActivityWidget';

<EpisodeActivityWidget />
```

### Data Requirements
- Requires `series_episodes` table with `watchDate` field populated
- Automatically fetches all episodes across all series

### Heat Map Intensity Levels
- **Level 0** (no activity): Muted gray
- **Level 1** (1-3 episodes): Light blue (30% opacity)
- **Level 2** (4-6 episodes): Medium blue (50% opacity)
- **Level 3** (7-9 episodes): Strong blue (70% opacity)
- **Level 4** (10+ episodes): Full blue (100% opacity)

### Visual Style
- Blue gradient theme (`blue-500`)
- Flame icon for streaks
- Interactive hover on heat map cells
- Shows episode count tooltip on hover

---

## 🎨 SeriesStatsWidgets (Container)

**Purpose**: Combined container for both widgets with responsive grid layout.

### Usage

```tsx
import SeriesStatsWidgets from '@/components/SeriesStatsWidgets';

<SeriesStatsWidgets movies={movies} />
```

### Layout
- Responsive grid: 1 column (mobile), 2 columns (lg), 3 columns (xl)
- Auto-sizing rows (minimum 150px)
- 4px gap between widgets

---

## 🔌 Integration Example

### In Your Main Stats Dashboard

```tsx
import WatchTimeWidget from '@/components/WatchTimeWidget';
import SeriesStatsWidgets from '@/components/SeriesStatsWidgets';

function StatsDashboard({ movies }: { movies: Movie[] }) {
  return (
    <div className="space-y-6">
      {/* Existing watch time widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WatchTimeWidget movies={movies} />
      </div>

      {/* New series-specific widgets */}
      <SeriesStatsWidgets movies={movies} />
    </div>
  );
}
```

### Individual Widget Usage

If you want more control over layout:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <SeriesProgressWidget movies={movies} />
  <EpisodeActivityWidget />
  <WatchTimeWidget movies={movies} />
</div>
```

---

## 🎯 Key Benefits

### Series Progress Widget
✅ Solves the "count" problem - shows actual season progress instead of binary series count  
✅ Visual progress bars make it easy to see how far you are  
✅ Shows both current season AND overall series progress  
✅ Perfect for binge watchers tracking multiple shows  

### Episode Activity Widget
✅ GitHub-style visualization makes patterns immediately visible  
✅ Streak tracking gamifies watching habits  
✅ Identifies binge watching patterns (high-intensity days)  
✅ Shows consistency and engagement over time  

---

## 🗄️ Database Schema Requirements

These widgets require the enhanced series tracking schema:

```sql
-- series_seasons table
CREATE TABLE series_seasons (
  id UUID PRIMARY KEY,
  series_id UUID REFERENCES movies(id),
  season_number INTEGER,
  season_name VARCHAR(100),
  episode_count INTEGER,
  episodes_watched INTEGER,
  status VARCHAR(50), -- 'watching', 'completed', etc.
  watch_date DATE,
  started_date DATE,
  ...
);

-- series_episodes table
CREATE TABLE series_episodes (
  id UUID PRIMARY KEY,
  season_id UUID REFERENCES series_seasons(id),
  episode_number INTEGER,
  episode_name VARCHAR(255),
  watched BOOLEAN,
  watch_date DATE,  -- IMPORTANT for activity tracking
  duration_minutes INTEGER,
  ...
);
```

---

## 🚀 Performance Notes

- **SeriesProgressWidget**: Makes 1 API call per series in progress + episode fetches
- **EpisodeActivityWidget**: Makes 1 bulk fetch for all episodes, then processes locally
- Both widgets cache data until movies array changes
- Lazy loading: widgets only expand when user clicks

---

## 🎨 Styling Customization

Both widgets use Tailwind CSS and match the existing design system:

- `floating-card` class for consistent card styling
- Gradient overlays with primary theme colors
- Smooth transitions (500ms duration)
- Hover effects for interactivity
- Responsive text sizing

To customize colors, modify the gradient classes:
- Series Progress: `purple-500` → change to your preferred color
- Episode Activity: `blue-500` → change to your preferred color

---

## 📊 Future Enhancements

Potential additions:

1. **Filter by timeframe** (last 30/60/90/365 days)
2. **Compare series** (side-by-side progress)
3. **Export activity data** (download as CSV)
4. **Series recommendations** based on watching patterns
5. **Collaborative watching** (friend comparison)
6. **Watch goals** (set targets for completion)

---

## 🐛 Troubleshooting

### SeriesProgressWidget shows "No series in progress"
- Check that you have series with `status='watching'` in `series_seasons` table
- Verify the `seriesId` matches entries in the `movies` table

### EpisodeActivityWidget shows all zeros
- Ensure `watch_date` is populated in `series_episodes` table
- Check that `watched=true` for episodes you've watched
- Verify date format is ISO string (YYYY-MM-DD)

### Widget doesn't expand
- Check browser console for JavaScript errors
- Verify all required dependencies are installed
- Ensure parent container has sufficient space for expanded view

---

## 📝 License

Part of the CineTracker project.
