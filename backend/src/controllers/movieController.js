import { getSupabase } from '../config/database.js';

export const getMovies = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('movies')
      .select('id, title, genre, category, release_year, platform, rating, status, poster, notes, season, created_at, updated_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const movies = data?.map(({
      release_year: releaseYear,
      created_at: createdAt,
      updated_at: updatedAt,
      ...movie
    }) => ({
      ...movie,
      releaseYear,
      createdAt,
      updatedAt
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
      createdAt,
      updatedAt,
      ...otherFields
    } = req.body;

    const movieData = {
      ...otherFields,
      user_id: req.user.id,
      release_year: releaseYear,
      created_at: createdAt,
      updated_at: updatedAt
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
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    // Remove snake_case fields from response
    delete responseData.release_year;
    delete responseData.created_at;
    delete responseData.updated_at;

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
      createdAt,
      updatedAt,
      ...otherFields
    } = req.body;

    const updateData = {
      ...otherFields,
      ...(releaseYear !== undefined && { release_year: releaseYear }),
      ...(createdAt !== undefined && { created_at: createdAt }),
      ...(updatedAt !== undefined && { updated_at: updatedAt })
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
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    // Remove snake_case fields from response
    delete responseData.release_year;
    delete responseData.created_at;
    delete responseData.updated_at;

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