import { getSupabase } from '../config/database.js';

// Helper function to transform snake_case to camelCase
const transformToResponse = (data) => {
  if (!data) return data;
  
  const {
    series_id: seriesId,
    season_number: seasonNumber,
    season_name: seasonName,
    episode_count: episodeCount,
    episodes_watched: episodesWatched,
    watch_date: watchDate,
    started_date: startedDate,
    tmdb_season_id: tmdbSeasonId,
    created_at: createdAt,
    updated_at: updatedAt,
    ...rest
  } = data;

  return {
    ...rest,
    seriesId,
    seasonNumber,
    seasonName,
    episodeCount,
    episodesWatched,
    watchDate,
    startedDate,
    tmdbSeasonId,
    createdAt,
    updatedAt
  };
};

// Helper function to transform camelCase to snake_case
const transformToDatabase = (data) => {
  const {
    seriesId,
    seasonNumber,
    seasonName,
    episodeCount,
    episodesWatched,
    watchDate,
    startedDate,
    tmdbSeasonId,
    createdAt,
    updatedAt,
    ...rest
  } = data;

  return {
    ...rest,
    ...(seriesId !== undefined && { series_id: seriesId }),
    ...(seasonNumber !== undefined && { season_number: seasonNumber }),
    ...(seasonName !== undefined && { season_name: seasonName }),
    ...(episodeCount !== undefined && { episode_count: episodeCount }),
    ...(episodesWatched !== undefined && { episodes_watched: episodesWatched }),
    ...(watchDate !== undefined && { watch_date: watchDate }),
    ...(startedDate !== undefined && { started_date: startedDate }),
    ...(tmdbSeasonId !== undefined && { tmdb_season_id: tmdbSeasonId }),
    ...(createdAt !== undefined && { created_at: createdAt }),
    ...(updatedAt !== undefined && { updated_at: updatedAt })
  };
};

// Get all seasons for a series
export const getSeriesSeasons = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seriesId } = req.params;
    const supabase = getSupabase();

    // First verify the series belongs to the user
    const { data: seriesData, error: seriesError } = await supabase
      .from('movies')
      .select('id')
      .eq('id', seriesId)
      .eq('user_id', req.user.id)
      .eq('category', 'Series')
      .single();

    if (seriesError || !seriesData) {
      return res.status(404).json({ error: 'Series not found' });
    }

    // Get all seasons for this series
    const { data, error } = await supabase
      .from('series_seasons')
      .select('*')
      .eq('series_id', seriesId)
      .order('season_number', { ascending: true });

    if (error) throw error;

    const seasons = data?.map(transformToResponse) || [];
    res.json(seasons);
  } catch (error) {
    console.error('Get series seasons error:', error);
    res.status(500).json({ error: 'Failed to fetch series seasons' });
  }
};

// Get a specific season
export const getSeason = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seasonId } = req.params;
    const supabase = getSupabase();

    // Get season with series verification
    const { data, error } = await supabase
      .from('series_seasons')
      .select(`
        *,
        movies!inner(user_id)
      `)
      .eq('id', seasonId)
      .eq('movies.user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Season not found' });
    }

    // Remove the nested movies object and transform response
    const { movies, ...seasonData } = data;
    res.json(transformToResponse(seasonData));
  } catch (error) {
    console.error('Get season error:', error);
    res.status(500).json({ error: 'Failed to fetch season' });
  }
};

// Create a new season
export const createSeason = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seriesId } = req.params;
    const supabase = getSupabase();

    // Verify the series belongs to the user
    const { data: seriesData, error: seriesError } = await supabase
      .from('movies')
      .select('id')
      .eq('id', seriesId)
      .eq('user_id', req.user.id)
      .eq('category', 'Series')
      .single();

    if (seriesError || !seriesData) {
      return res.status(404).json({ error: 'Series not found' });
    }

    // Transform request data
    const seasonData = transformToDatabase({
      ...req.body,
      seriesId
    });

    const { data, error } = await supabase
      .from('series_seasons')
      .insert([seasonData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(transformToResponse(data));
  } catch (error) {
    console.error('Create season error:', error);
    res.status(500).json({ error: 'Failed to create season' });
  }
};

// Update a season
export const updateSeason = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seasonId } = req.params;
    const supabase = getSupabase();

    // Transform request data
    const updateData = transformToDatabase(req.body);

    // Update season with user verification
    const { data, error } = await supabase
      .from('series_seasons')
      .update(updateData)
      .eq('id', seasonId)
      .eq('series_id', await getUserSeriesId(supabase, seasonId, req.user.id))
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Season not found' });
    }

    res.json(transformToResponse(data));
  } catch (error) {
    console.error('Update season error:', error);
    res.status(500).json({ error: 'Failed to update season' });
  }
};

// Delete a season
export const deleteSeason = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seasonId } = req.params;
    const supabase = getSupabase();

    // Verify season belongs to user before deletion
    const { data: verifyData } = await supabase
      .from('series_seasons')
      .select(`
        id,
        movies!inner(user_id)
      `)
      .eq('id', seasonId)
      .eq('movies.user_id', req.user.id)
      .single();

    if (!verifyData) {
      return res.status(404).json({ error: 'Season not found' });
    }

    const { error } = await supabase
      .from('series_seasons')
      .delete()
      .eq('id', seasonId);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Delete season error:', error);
    res.status(500).json({ error: 'Failed to delete season' });
  }
};

// Get series with aggregated season data (using the database view)
export const getSeriesWithSeasons = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seriesId } = req.params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('series_with_seasons')
      .select('*')
      .eq('series_id', seriesId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Series not found' });
    }

    // Transform response
    const {
      series_id: seriesId_,
      latest_season_watched: latestSeasonWatched,
      total_seasons_available: totalSeasonsAvailable,
      total_seasons_tracked: totalSeasonsTracked,
      completed_seasons: completedSeasons,
      watching_seasons: watchingSeasons,
      want_to_watch_seasons: wantToWatchSeasons,
      total_episodes_watched: totalEpisodesWatched,
      total_episodes_available: totalEpisodesAvailable,
      latest_season_completion_date: latestSeasonCompletionDate,
      average_season_rating: averageSeasonRating,
      overall_rating: overallRating,
      overall_notes: overallNotes,
      user_id: userId,
      release_year: releaseYear,
      series_status: seriesStatus,
      created_at: createdAt,
      updated_at: updatedAt,
      tmdb_id: tmdbId,
      ...rest
    } = data;

    const responseData = {
      ...rest,
      seriesId: seriesId_,
      latestSeasonWatched,
      totalSeasonsAvailable,
      totalSeasonsTracked,
      completedSeasons,
      watchingSeasons,
      wantToWatchSeasons,
      totalEpisodesWatched,
      totalEpisodesAvailable,
      latestSeasonCompletionDate,
      averageSeasonRating,
      overallRating,
      overallNotes,
      userId,
      releaseYear,
      seriesStatus,
      createdAt,
      updatedAt,
      tmdbId
    };

    res.json(responseData);
  } catch (error) {
    console.error('Get series with seasons error:', error);
    res.status(500).json({ error: 'Failed to fetch series with seasons data' });
  }
};

// Helper function to get series ID for user verification
async function getUserSeriesId(supabase, seasonId, userId) {
  const { data } = await supabase
    .from('series_seasons')
    .select(`
      series_id,
      movies!inner(user_id)
    `)
    .eq('id', seasonId)
    .eq('movies.user_id', userId)
    .single();

  return data?.series_id;
}

// Bulk update season progress (useful for marking multiple episodes as watched)
export const bulkUpdateSeasonProgress = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seasonId } = req.params;
    const { episodesWatched, status, watchDate } = req.body;
    const supabase = getSupabase();

    // Verify season belongs to user
    const { data: verifyData } = await supabase
      .from('series_seasons')
      .select(`
        id,
        episode_count,
        movies!inner(user_id)
      `)
      .eq('id', seasonId)
      .eq('movies.user_id', req.user.id)
      .single();

    if (!verifyData) {
      return res.status(404).json({ error: 'Season not found' });
    }

    // Update season progress
    const updateData = {
      ...(episodesWatched !== undefined && { episodes_watched: episodesWatched }),
      ...(status !== undefined && { status }),
      ...(watchDate !== undefined && { watch_date: watchDate })
    };

    // If season is completed, set watch_date to current date if not provided
    if (status === 'completed' && !watchDate) {
      updateData.watch_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('series_seasons')
      .update(updateData)
      .eq('id', seasonId)
      .select()
      .single();

    if (error) throw error;

    res.json(transformToResponse(data));
  } catch (error) {
    console.error('Bulk update season progress error:', error);
    res.status(500).json({ error: 'Failed to update season progress' });
  }
};
