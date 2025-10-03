import { getSupabase } from '../config/database.js';

// Helper function to transform snake_case to camelCase
const transformToResponse = (data) => {
  if (!data) return data;
  
  const {
    season_id: seasonId,
    episode_number: episodeNumber,
    episode_name: episodeName,
    watch_date: watchDate,
    duration_minutes: durationMinutes,
    tmdb_episode_id: tmdbEpisodeId,
    tmdb_rating: tmdbRating,
    created_at: createdAt,
    updated_at: updatedAt,
    ...rest
  } = data;

  return {
    ...rest,
    seasonId,
    episodeNumber,
    episodeName,
    watchDate,
    durationMinutes,
    tmdbEpisodeId,
    tmdbRating,
    createdAt,
    updatedAt
  };
};

// Helper function to transform camelCase to snake_case
const transformToDatabase = (data) => {
  const {
    seasonId,
    episodeNumber,
    episodeName,
    watchDate,
    durationMinutes,
    tmdbEpisodeId,
    tmdbRating,
    createdAt,
    updatedAt,
    ...rest
  } = data;

  return {
    ...rest,
    ...(seasonId !== undefined && { season_id: seasonId }),
    ...(episodeNumber !== undefined && { episode_number: episodeNumber }),
    ...(episodeName !== undefined && { episode_name: episodeName }),
    ...(watchDate !== undefined && { watch_date: watchDate }),
    ...(durationMinutes !== undefined && { duration_minutes: durationMinutes }),
    ...(tmdbEpisodeId !== undefined && { tmdb_episode_id: tmdbEpisodeId }),
    ...(tmdbRating !== undefined && { tmdb_rating: tmdbRating }),
    ...(createdAt !== undefined && { created_at: createdAt }),
    ...(updatedAt !== undefined && { updated_at: updatedAt })
  };
};

// Get all episodes for a season
export const getSeasonEpisodes = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seasonId } = req.params;
    const supabase = getSupabase();

    // First verify the season belongs to the user
    const { data: seasonData, error: seasonError } = await supabase
      .from('series_seasons')
      .select(`
        id,
        movies!inner(user_id)
      `)
      .eq('id', seasonId)
      .eq('movies.user_id', req.user.id)
      .single();

    if (seasonError || !seasonData) {
      return res.status(404).json({ error: 'Season not found' });
    }

    // Get all episodes for this season
    const { data, error } = await supabase
      .from('series_episodes')
      .select('*')
      .eq('season_id', seasonId)
      .order('episode_number', { ascending: true });

    if (error) throw error;

    const episodes = data?.map(transformToResponse) || [];
    res.json(episodes);
  } catch (error) {
    console.error('Get season episodes error:', error);
    res.status(500).json({ error: 'Failed to fetch season episodes' });
  }
};

// Get a specific episode
export const getEpisode = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { episodeId } = req.params;
    const supabase = getSupabase();

    // Get episode with user verification through season->series chain
    const { data, error } = await supabase
      .from('series_episodes')
      .select(`
        *,
        series_seasons!inner(
          id,
          movies!inner(user_id)
        )
      `)
      .eq('id', episodeId)
      .eq('series_seasons.movies.user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    // Remove the nested objects and transform response
    const { series_seasons, ...episodeData } = data;
    res.json(transformToResponse(episodeData));
  } catch (error) {
    console.error('Get episode error:', error);
    res.status(500).json({ error: 'Failed to fetch episode' });
  }
};

// Create a new episode
export const createEpisode = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seasonId } = req.params;
    const supabase = getSupabase();

    // Verify the season belongs to the user
    const { data: seasonData, error: seasonError } = await supabase
      .from('series_seasons')
      .select(`
        id,
        movies!inner(user_id)
      `)
      .eq('id', seasonId)
      .eq('movies.user_id', req.user.id)
      .single();

    if (seasonError || !seasonData) {
      return res.status(404).json({ error: 'Season not found' });
    }

    // Transform request data
    const episodeData = transformToDatabase({
      ...req.body,
      seasonId
    });

    const { data, error } = await supabase
      .from('series_episodes')
      .insert([episodeData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(transformToResponse(data));
  } catch (error) {
    console.error('Create episode error:', error);
    res.status(500).json({ error: 'Failed to create episode' });
  }
};

// Update an episode
export const updateEpisode = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { episodeId } = req.params;
    const supabase = getSupabase();

    // Transform request data
    const updateData = transformToDatabase(req.body);

    // If marking as watched and no watch_date provided, set to current date
    if (updateData.watched && !updateData.watch_date) {
      updateData.watch_date = new Date().toISOString().split('T')[0];
    }

    // Update episode with user verification through season->series chain
    const { data, error } = await supabase
      .from('series_episodes')
      .update(updateData)
      .eq('id', episodeId)
      .eq('season_id', await getUserSeasonId(supabase, episodeId, req.user.id))
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    res.json(transformToResponse(data));
  } catch (error) {
    console.error('Update episode error:', error);
    res.status(500).json({ error: 'Failed to update episode' });
  }
};

// Delete an episode
export const deleteEpisode = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { episodeId } = req.params;
    const supabase = getSupabase();

    // Verify episode belongs to user before deletion
    const { data: verifyData } = await supabase
      .from('series_episodes')
      .select(`
        id,
        series_seasons!inner(
          id,
          movies!inner(user_id)
        )
      `)
      .eq('id', episodeId)
      .eq('series_seasons.movies.user_id', req.user.id)
      .single();

    if (!verifyData) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    const { error } = await supabase
      .from('series_episodes')
      .delete()
      .eq('id', episodeId);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Delete episode error:', error);
    res.status(500).json({ error: 'Failed to delete episode' });
  }
};

// Mark episode as watched/unwatched
export const toggleEpisodeWatched = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { episodeId } = req.params;
    const { watched, watchDate, rating } = req.body;
    const supabase = getSupabase();

    // Prepare update data
    const updateData = {
      watched: watched,
      watch_date: watched ? (watchDate || new Date().toISOString().split('T')[0]) : null,
      ...(rating !== undefined && { rating })
    };

    // Update episode with user verification
    const { data, error } = await supabase
      .from('series_episodes')
      .update(updateData)
      .eq('id', episodeId)
      .eq('season_id', await getUserSeasonId(supabase, episodeId, req.user.id))
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    res.json(transformToResponse(data));
  } catch (error) {
    console.error('Toggle episode watched error:', error);
    res.status(500).json({ error: 'Failed to update episode watch status' });
  }
};

// Bulk update episodes (useful for marking multiple episodes as watched)
export const bulkUpdateEpisodes = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seasonId } = req.params;
    const { episodeNumbers, watched, watchDate } = req.body;
    const supabase = getSupabase();

    // Verify season belongs to user
    const { data: seasonData } = await supabase
      .from('series_seasons')
      .select(`
        id,
        movies!inner(user_id)
      `)
      .eq('id', seasonId)
      .eq('movies.user_id', req.user.id)
      .single();

    if (!seasonData) {
      return res.status(404).json({ error: 'Season not found' });
    }

    // Prepare update data
    const updateData = {
      watched: watched,
      watch_date: watched ? (watchDate || new Date().toISOString().split('T')[0]) : null
    };

    // Update multiple episodes
    const { data, error } = await supabase
      .from('series_episodes')
      .update(updateData)
      .eq('season_id', seasonId)
      .in('episode_number', episodeNumbers)
      .select();

    if (error) throw error;

    const episodes = data?.map(transformToResponse) || [];
    res.json(episodes);
  } catch (error) {
    console.error('Bulk update episodes error:', error);
    res.status(500).json({ error: 'Failed to bulk update episodes' });
  }
};

// Mark all episodes in a season as watched up to a specific episode
export const markEpisodesWatchedUpTo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seasonId } = req.params;
    const { episodeNumber, watchDate } = req.body;
    const supabase = getSupabase();

    // Verify season belongs to user
    const { data: seasonData } = await supabase
      .from('series_seasons')
      .select(`
        id,
        movies!inner(user_id)
      `)
      .eq('id', seasonId)
      .eq('movies.user_id', req.user.id)
      .single();

    if (!seasonData) {
      return res.status(404).json({ error: 'Season not found' });
    }

    // Update all episodes up to the specified episode number
    const updateData = {
      watched: true,
      watch_date: watchDate || new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('series_episodes')
      .update(updateData)
      .eq('season_id', seasonId)
      .lte('episode_number', episodeNumber)
      .select();

    if (error) throw error;

    const episodes = data?.map(transformToResponse) || [];
    res.json(episodes);
  } catch (error) {
    console.error('Mark episodes watched up to error:', error);
    res.status(500).json({ error: 'Failed to mark episodes as watched' });
  }
};

// Get episode watch statistics for a season
export const getSeasonEpisodeStats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seasonId } = req.params;
    const supabase = getSupabase();

    // Verify season belongs to user and get stats
    const { data, error } = await supabase
      .from('series_episodes')
      .select(`
        id,
        watched,
        rating,
        watch_date,
        series_seasons!inner(
          id,
          season_number,
          movies!inner(user_id, title)
        )
      `)
      .eq('season_id', seasonId)
      .eq('series_seasons.movies.user_id', req.user.id);

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Season not found or no episodes' });
    }

    // Calculate statistics
    const totalEpisodes = data.length;
    const watchedEpisodes = data.filter(ep => ep.watched).length;
    const unwatchedEpisodes = totalEpisodes - watchedEpisodes;
    const watchedPercentage = Math.round((watchedEpisodes / totalEpisodes) * 100);
    
    const episodesWithRatings = data.filter(ep => ep.rating && ep.watched);
    const averageRating = episodesWithRatings.length > 0 
      ? episodesWithRatings.reduce((sum, ep) => sum + ep.rating, 0) / episodesWithRatings.length 
      : null;

    // Get watch dates for timeline
    const watchDates = data
      .filter(ep => ep.watched && ep.watch_date)
      .map(ep => ep.watch_date)
      .sort();

    const firstWatchDate = watchDates.length > 0 ? watchDates[0] : null;
    const lastWatchDate = watchDates.length > 0 ? watchDates[watchDates.length - 1] : null;

    const stats = {
      seasonId,
      seriesTitle: data[0].series_seasons.movies.title,
      seasonNumber: data[0].series_seasons.season_number,
      totalEpisodes,
      watchedEpisodes,
      unwatchedEpisodes,
      watchedPercentage,
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
      firstWatchDate,
      lastWatchDate,
      isCompleted: watchedEpisodes === totalEpisodes,
      nextEpisodeToWatch: watchedEpisodes < totalEpisodes ? watchedEpisodes + 1 : null
    };

    res.json(stats);
  } catch (error) {
    console.error('Get season episode stats error:', error);
    res.status(500).json({ error: 'Failed to fetch episode statistics' });
  }
};

// Helper function to get season ID for user verification
async function getUserSeasonId(supabase, episodeId, userId) {
  const { data } = await supabase
    .from('series_episodes')
    .select(`
      season_id,
      series_seasons!inner(
        id,
        movies!inner(user_id)
      )
    `)
    .eq('id', episodeId)
    .eq('series_seasons.movies.user_id', userId)
    .single();

  return data?.season_id;
}
