import { getSupabase } from '../config/database.js';

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = getSupabase();

    // Get user stats, create if doesn't exist
    let { data: userStats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If no stats exist, create them
    if (error && error.code === 'PGRST116') {
      // Count current watched movies and series
      const { data: movies } = await supabase
        .from('movies')
        .select('category, status')
        .eq('user_id', userId)
        .eq('status', 'watched');

      const moviesWatchedCount = movies?.filter(m => m.category === 'Movie').length || 0;
      const seriesWatchedCount = movies?.filter(m => m.category === 'Series').length || 0;

      const { data: newStats, error: insertError } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          movies_watched_count: moviesWatchedCount,
          series_watched_count: seriesWatchedCount
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user stats:', insertError);
        return res.status(500).json({ error: insertError.message });
      }

      userStats = newStats;
    } else if (error) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({ error: error.message });
    }

    // Calculate if stats are unlocked (5 movies and 3 series required)
    const MOVIES_REQUIRED = 5;
    const SERIES_REQUIRED = 3;

    const isUnlocked = 
      userStats.movies_watched_count >= MOVIES_REQUIRED && 
      userStats.series_watched_count >= SERIES_REQUIRED;

    const moviesRemaining = Math.max(0, MOVIES_REQUIRED - userStats.movies_watched_count);
    const seriesRemaining = Math.max(0, SERIES_REQUIRED - userStats.series_watched_count);

    // Calculate overall progress percentage
    const totalRequired = MOVIES_REQUIRED + SERIES_REQUIRED;
    const totalWatched = userStats.movies_watched_count + userStats.series_watched_count;
    const progressPercentage = Math.min(100, Math.round((totalWatched / totalRequired) * 100));

    res.json({
      moviesWatchedCount: userStats.movies_watched_count,
      seriesWatchedCount: userStats.series_watched_count,
      moviesRequired: MOVIES_REQUIRED,
      seriesRequired: SERIES_REQUIRED,
      moviesRemaining,
      seriesRemaining,
      isUnlocked,
      progressPercentage,
      updatedAt: userStats.updated_at
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ error: error.message });
  }
};
