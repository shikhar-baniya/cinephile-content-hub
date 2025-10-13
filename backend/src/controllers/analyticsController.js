import { getSupabase } from '../config/database.js';

// Get episode watch analytics
export const getEpisodeAnalytics = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const supabase = getSupabase();

    // Get all episodes watched by the user within the date range
    const { data: episodes, error } = await supabase
      .from('series_episodes')
      .select(`
        watch_date,
        series_seasons!inner(
          season_number,
          movies!inner(user_id, title)
        )
      `)
      .eq('watched', true)
      .eq('series_seasons.movies.user_id', req.user.id)
      .gte('watch_date', startDate)
      .lte('watch_date', endDate)
      .not('watch_date', 'is', null)
      .order('watch_date', { ascending: true });

    if (error) throw error;

    // Group episodes by date
    const analyticsMap = new Map();

    episodes?.forEach(episode => {
      const date = episode.watch_date;
      if (!analyticsMap.has(date)) {
        analyticsMap.set(date, {
          date,
          episodes: 0,
          seasons: new Set(),
          series: new Set(),
          totalWatchTime: 0
        });
      }

      const dayData = analyticsMap.get(date);
      dayData.episodes += 1;
      dayData.seasons.add(`${episode.series_seasons.movies.title}-S${episode.series_seasons.season_number}`);
      dayData.series.add(episode.series_seasons.movies.title);
    });

    // Convert to array and calculate final metrics
    const analytics = Array.from(analyticsMap.values()).map(day => ({
      date: day.date,
      episodes: day.episodes,
      seasons: day.seasons.size,
      series: day.series.size,
      totalWatchTime: day.episodes * 30 // Rough estimate: 30 minutes per episode
    }));

    // Fill in missing dates with zero values
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filledAnalytics = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const existing = analytics.find(a => a.date === dateStr);
      filledAnalytics.push(existing || {
        date: dateStr,
        episodes: 0,
        seasons: 0,
        series: 0,
        totalWatchTime: 0
      });
    }

    res.json(filledAnalytics);
  } catch (error) {
    console.error('Get episode analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch episode analytics' });
  }
};

// Get season completion analytics
export const getSeasonAnalytics = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const supabase = getSupabase();

    // Get seasons completed by the user within the date range
    const { data: seasons, error } = await supabase
      .from('series_seasons')
      .select(`
        watch_date,
        season_number,
        movies!inner(user_id, title)
      `)
      .eq('status', 'completed')
      .eq('movies.user_id', req.user.id)
      .gte('watch_date', startDate)
      .lte('watch_date', endDate)
      .not('watch_date', 'is', null)
      .order('watch_date', { ascending: true });

    if (error) throw error;

    // Group seasons by date
    const analyticsMap = new Map();

    seasons?.forEach(season => {
      const date = season.watch_date;
      if (!analyticsMap.has(date)) {
        analyticsMap.set(date, {
          date,
          seasonsCompleted: 0,
          seriesCompleted: 0,
          seriesSet: new Set()
        });
      }

      const dayData = analyticsMap.get(date);
      dayData.seasonsCompleted += 1;

      // Check if this series is fully completed (all seasons completed)
      // This is a simplified check - in a real implementation you'd need to verify
      // if all seasons of the series are completed
      const seriesKey = season.movies.title;
      if (!dayData.seriesSet.has(seriesKey)) {
        dayData.seriesSet.add(seriesKey);
        dayData.seriesCompleted += 1; // Simplified - assuming each season completion = series completion
      }
    });

    // Convert to array
    const analytics = Array.from(analyticsMap.values()).map(day => ({
      date: day.date,
      seasonsCompleted: day.seasonsCompleted,
      seriesCompleted: day.seriesCompleted,
      averageCompletionRate: 0 // Placeholder - would need more complex calculation
    }));

    // Fill in missing dates with zero values
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filledAnalytics = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const existing = analytics.find(a => a.date === dateStr);
      filledAnalytics.push(existing || {
        date: dateStr,
        seasonsCompleted: 0,
        seriesCompleted: 0,
        averageCompletionRate: 0
      });
    }

    res.json(filledAnalytics);
  } catch (error) {
    console.error('Get season analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch season analytics' });
  }
};