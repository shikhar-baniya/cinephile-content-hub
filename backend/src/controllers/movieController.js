import { getSupabase } from '../config/database.js';

export const getMovies = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('movies')
      .select(`
        id, title, genre, category, release_year, platform, rating, status, poster, notes, season, tmdb_id, watch_date, created_at, updated_at,
        latest_season_watched, total_seasons_available, overall_rating, overall_notes
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const movies = data?.map(({
      release_year: releaseYear,
      tmdb_id: tmdbId,
      watch_date: watchDate,
      created_at: createdAt,
      updated_at: updatedAt,
      latest_season_watched: latestSeasonWatched,
      total_seasons_available: totalSeasonsAvailable,
      overall_rating: overallRating,
      overall_notes: overallNotes,
      ...movie
    }) => ({
      ...movie,
      releaseYear,
      tmdbId,
      watchDate,
      createdAt,
      updatedAt,
      latestSeasonWatched,
      totalSeasonsAvailable,
      overallRating,
      overallNotes
    })) || [];

    res.json(movies);
  } catch (error) {
    console.error('Movie fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

export const addMovie = async (req, res) => {
  try {
    console.log('=== ADD MOVIE REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user ? { id: req.user.id, email: req.user.email } : 'No user');

    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Transform camelCase fields to snake_case for database
    const {
      releaseYear,
      tmdbId,
      watchDate,
      createdAt,
      updatedAt,
      latestSeasonWatched,
      totalSeasonsAvailable,
      overallRating,
      overallNotes,
      ...otherFields
    } = req.body;

    const movieData = {
      ...otherFields,
      user_id: req.user.id,
      release_year: releaseYear,
      tmdb_id: tmdbId,
      watch_date: watchDate,
      created_at: createdAt,
      updated_at: updatedAt,
      latest_season_watched: latestSeasonWatched,
      total_seasons_available: totalSeasonsAvailable,
      overall_rating: overallRating,
      overall_notes: overallNotes
    };

    console.log('Transformed movie data for database:', JSON.stringify(movieData, null, 2));

    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('movies')
      .insert([movieData])
      .select()
      .single();

    console.log('Supabase response - data:', data);
    console.log('Supabase response - error:', error);

    if (error) {
      console.error('Supabase insert error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    // Transform snake_case fields back to camelCase for response
    const responseData = {
      ...data,
      releaseYear: data.release_year,
      tmdbId: data.tmdb_id,
      watchDate: data.watch_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      latestSeasonWatched: data.latest_season_watched,
      totalSeasonsAvailable: data.total_seasons_available,
      overallRating: data.overall_rating,
      overallNotes: data.overall_notes
    };

    // Remove snake_case fields from response
    delete responseData.release_year;
    delete responseData.tmdb_id;
    delete responseData.watch_date;
    delete responseData.created_at;
    delete responseData.updated_at;
    delete responseData.latest_season_watched;
    delete responseData.total_seasons_available;
    delete responseData.overall_rating;
    delete responseData.overall_notes;

    console.log('Final response data:', JSON.stringify(responseData, null, 2));
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Add movie error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to add movie' });
  }
};

export const updateMovie = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    
    // Transform camelCase fields to snake_case for database
    const {
      releaseYear,
      tmdbId,
      watchDate,
      createdAt,
      updatedAt,
      latestSeasonWatched,
      totalSeasonsAvailable,
      overallRating,
      overallNotes,
      ...otherFields
    } = req.body;

    const updateData = {
      ...otherFields,
      ...(releaseYear !== undefined && { release_year: releaseYear }),
      ...(tmdbId !== undefined && { tmdb_id: tmdbId }),
      ...(watchDate !== undefined && { watch_date: watchDate }),
      ...(createdAt !== undefined && { created_at: createdAt }),
      ...(updatedAt !== undefined && { updated_at: updatedAt }),
      ...(latestSeasonWatched !== undefined && { latest_season_watched: latestSeasonWatched }),
      ...(totalSeasonsAvailable !== undefined && { total_seasons_available: totalSeasonsAvailable }),
      ...(overallRating !== undefined && { overall_rating: overallRating }),
      ...(overallNotes !== undefined && { overall_notes: overallNotes })
    };

    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('movies')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Transform snake_case fields back to camelCase for response
    const responseData = {
      ...data,
      releaseYear: data.release_year,
      tmdbId: data.tmdb_id,
      watchDate: data.watch_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      latestSeasonWatched: data.latest_season_watched,
      totalSeasonsAvailable: data.total_seasons_available,
      overallRating: data.overall_rating,
      overallNotes: data.overall_notes
    };

    // Remove snake_case fields from response
    delete responseData.release_year;
    delete responseData.tmdb_id;
    delete responseData.watch_date;
    delete responseData.created_at;
    delete responseData.updated_at;
    delete responseData.latest_season_watched;
    delete responseData.total_seasons_available;
    delete responseData.overall_rating;
    delete responseData.overall_notes;

    res.json(responseData);
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({ error: 'Failed to update movie' });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
};