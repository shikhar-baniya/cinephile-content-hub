import { getSupabase } from '../config/database.js';

export const debugSeries = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seriesId } = req.params;
    const supabase = getSupabase();

    // Get series info
    const { data: seriesData, error: seriesError } = await supabase
      .from('movies')
      .select('*')
      .eq('id', seriesId)
      .eq('user_id', req.user.id)
      .single();

    if (seriesError) {
      return res.status(404).json({ error: 'Series not found', details: seriesError });
    }

    // Get seasons
    const { data: seasonsData, error: seasonsError } = await supabase
      .from('series_seasons')
      .select('*')
      .eq('series_id', seriesId);

    // Get episodes for each season
    const episodesData = [];
    if (seasonsData && seasonsData.length > 0) {
      for (const season of seasonsData) {
        const { data: episodes } = await supabase
          .from('series_episodes')
          .select('*')
          .eq('season_id', season.id);
        
        episodesData.push({
          seasonId: season.id,
          seasonNumber: season.season_number,
          episodes: episodes || []
        });
      }
    }

    // Check migration status
    const { data: migrationCheck } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['series_seasons', 'series_episodes']);

    const debugInfo = {
      series: seriesData,
      seasons: seasonsData || [],
      episodes: episodesData,
      migration: {
        tablesExist: migrationCheck?.map(t => t.table_name) || [],
        seasonsCount: seasonsData?.length || 0,
        totalEpisodes: episodesData.reduce((acc, s) => acc + s.episodes.length, 0)
      },
      user: {
        id: req.user.id,
        email: req.user.email
      }
    };

    res.json(debugInfo);
  } catch (error) {
    console.error('Debug series error:', error);
    res.status(500).json({ error: 'Debug failed', details: error.message });
  }
};

export const debugAllSeries = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = getSupabase();

    // Get all series for user
    const { data: allSeries, error: seriesError } = await supabase
      .from('movies')
      .select('id, title, category, tmdb_id, created_at')
      .eq('user_id', req.user.id)
      .eq('category', 'Series');

    if (seriesError) {
      return res.status(500).json({ error: 'Failed to fetch series', details: seriesError });
    }

    // Get series with season counts
    const seriesWithCounts = [];
    for (const series of allSeries || []) {
      const { data: seasons } = await supabase
        .from('series_seasons')
        .select('id')
        .eq('series_id', series.id);

      seriesWithCounts.push({
        ...series,
        seasonsCount: seasons?.length || 0
      });
    }

    res.json({
      totalSeries: allSeries?.length || 0,
      series: seriesWithCounts,
      user: {
        id: req.user.id,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Debug all series error:', error);
    res.status(500).json({ error: 'Debug failed', details: error.message });
  }
};
