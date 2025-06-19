import { getSupabase } from '../config/database.js';

export const getMovies = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('movies')
      .select('id, title, genre, category, release_year, platform, rating, status, poster, notes, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const movies = data?.map(({
      release_year: releaseYear,
      created_at: createdAt,
      ...movie
    }) => ({
      ...movie,
      releaseYear,
      createdAt
    })) || [];

    return res.json(movies);
  } catch (error) {
    console.error('Movie fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

export const addMovie = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { title, genre, category, releaseYear, platform, rating, status, poster, notes } = req.body;

    // Validation
    if (!title || !genre || !category || !releaseYear || !platform || rating === undefined || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('movies')
      .insert({
        user_id: req.user.id,
        title,
        genre,
        category,
        release_year: releaseYear,
        platform,
        rating,
        status,
        poster,
        notes
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'This movie already exists in your collection' });
      }
      console.error('Error adding movie:', error);
      return res.status(500).json({ error: 'Failed to add movie' });
    }

    const movie = {
      id: data.id,
      title: data.title,
      genre: data.genre,
      category: data.category,
      releaseYear: data.release_year,
      platform: data.platform,
      rating: data.rating,
      status: data.status,
      poster: data.poster,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    res.status(201).json(movie);
  } catch (error) {
    console.error('Add movie error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMovie = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const updates = req.body;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('movies')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', req.user.id) // Ensure user can only update their own movies
      .select()
      .single();

    if (error) {
      console.error('Error updating movie:', error);
      return res.status(500).json({ error: 'Failed to update movie' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const movie = {
      id: data.id,
      title: data.title,
      genre: data.genre,
      category: data.category,
      releaseYear: data.release_year,
      platform: data.platform,
      rating: data.rating,
      status: data.status,
      poster: data.poster,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    res.json(movie);
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;

    const supabase = getSupabase();
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id); // Ensure user can only delete their own movies

    if (error) {
      console.error('Error deleting movie:', error);
      return res.status(500).json({ error: 'Failed to delete movie' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};