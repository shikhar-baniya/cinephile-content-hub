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

    res.json(movies);
  } catch (error) {
    console.error('Movie fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

export const addMovie = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const movieData = { ...req.body, user_id: req.user.id };
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('movies')
      .insert([movieData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Add movie error:', error);
    res.status(500).json({ error: 'Failed to add movie' });
  }
};

export const updateMovie = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('movies')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(data);
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