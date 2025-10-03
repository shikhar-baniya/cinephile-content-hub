import { getSupabase } from '../config/database.js';
import { 
  getTVShowDetails, 
  getSeasonDetails, 
  populateSeriesFromTMDB,
  searchTVShows,
  getTrendingTVShows,
  getTVGenres
} from '../services/tmdbService.js';

// Get TV show details from TMDB
export const getTMDBShowDetails = async (req, res) => {
  try {
    const { tmdbId } = req.params;
    
    const showDetails = await getTVShowDetails(tmdbId);
    res.json(showDetails);
  } catch (error) {
    console.error('Get TMDB show details error:', error);
    res.status(500).json({ error: 'Failed to fetch show details from TMDB' });
  }
};

// Get season details from TMDB
export const getTMDBSeasonDetails = async (req, res) => {
  try {
    const { tmdbId, seasonNumber } = req.params;
    
    const seasonDetails = await getSeasonDetails(tmdbId, parseInt(seasonNumber));
    res.json(seasonDetails);
  } catch (error) {
    console.error('Get TMDB season details error:', error);
    res.status(500).json({ error: 'Failed to fetch season details from TMDB' });
  }
};

// Populate a series with seasons and episodes from TMDB
export const populateSeriesWithTMDBData = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { seriesId } = req.params;
    const supabase = getSupabase();

    // Get the series and verify it belongs to the user
    const { data: seriesData, error: seriesError } = await supabase
      .from('movies')
      .select('id, tmdb_id, title')
      .eq('id', seriesId)
      .eq('user_id', req.user.id)
      .eq('category', 'Series')
      .single();

    if (seriesError || !seriesData || !seriesData.tmdb_id) {
      return res.status(404).json({ error: 'Series not found or missing TMDB ID' });
    }

    // Fetch data from TMDB
    const { showDetails, seasons } = await populateSeriesFromTMDB(seriesData.tmdb_id);

    // Update the series with TMDB data
    await supabase
      .from('movies')
      .update({
        total_seasons_available: showDetails.numberOfSeasons
      })
      .eq('id', seriesId);

    // Create or update seasons
    const createdSeasons = [];
    
    for (const seasonData of seasons) {
      // Check if season already exists
      const { data: existingSeason } = await supabase
        .from('series_seasons')
        .select('id, episode_count')
        .eq('series_id', seriesId)
        .eq('season_number', seasonData.seasonNumber)
        .single();

      let seasonId;

      if (existingSeason) {
        // Update existing season
        const { data: updatedSeason } = await supabase
          .from('series_seasons')
          .update({
            season_name: seasonData.name,
            episode_count: seasonData.episodes.length,
            tmdb_season_id: seasonData.id,
            tmdb_rating: seasonData.voteAverage
          })
          .eq('id', existingSeason.id)
          .select()
          .single();
        
        seasonId = existingSeason.id;
        createdSeasons.push(updatedSeason);
      } else {
        // Create new season
        const { data: newSeason } = await supabase
          .from('series_seasons')
          .insert({
            series_id: seriesId,
            season_number: seasonData.seasonNumber,
            season_name: seasonData.name,
            episode_count: seasonData.episodes.length,
            tmdb_season_id: seasonData.id,
            tmdb_rating: seasonData.voteAverage,
            status: 'not-started'
          })
          .select()
          .single();
        
        seasonId = newSeason.id;
        createdSeasons.push(newSeason);
      }

      // Create or update episodes
      for (const episodeData of seasonData.episodes) {
        const { data: existingEpisode } = await supabase
          .from('series_episodes')
          .select('id')
          .eq('season_id', seasonId)
          .eq('episode_number', episodeData.episodeNumber)
          .single();

        if (!existingEpisode) {
          // Create new episode
          await supabase
            .from('series_episodes')
            .insert({
              season_id: seasonId,
              episode_number: episodeData.episodeNumber,
              episode_name: episodeData.name,
              duration_minutes: episodeData.runtime,
              tmdb_episode_id: episodeData.id,
              tmdb_rating: episodeData.voteAverage,
              watched: false
            });
        } else {
          // Update existing episode with TMDB data
          await supabase
            .from('series_episodes')
            .update({
              episode_name: episodeData.name,
              duration_minutes: episodeData.runtime,
              tmdb_episode_id: episodeData.id,
              tmdb_rating: episodeData.voteAverage
            })
            .eq('id', existingEpisode.id);
        }
      }
    }

    res.json({
      message: 'Series populated successfully with TMDB data',
      seriesId,
      showDetails: {
        name: showDetails.name,
        numberOfSeasons: showDetails.numberOfSeasons,
        numberOfEpisodes: showDetails.numberOfEpisodes
      },
      seasonsCreated: createdSeasons.length,
      seasons: createdSeasons.map(season => ({
        id: season.id,
        seasonNumber: season.season_number,
        seasonName: season.season_name,
        episodeCount: season.episode_count
      }))
    });
  } catch (error) {
    console.error('Populate series with TMDB data error:', error);
    res.status(500).json({ error: 'Failed to populate series with TMDB data' });
  }
};

// Search TV shows on TMDB
export const searchTMDBShows = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await searchTVShows(query);
    res.json(results);
  } catch (error) {
    console.error('Search TMDB shows error:', error);
    res.status(500).json({ error: 'Failed to search TMDB shows' });
  }
};

// Get trending TV shows from TMDB
export const getTMDBTrendingShows = async (req, res) => {
  try {
    const { timeWindow = 'week' } = req.query;
    
    const results = await getTrendingTVShows(timeWindow);
    res.json(results);
  } catch (error) {
    console.error('Get TMDB trending shows error:', error);
    res.status(500).json({ error: 'Failed to fetch trending shows from TMDB' });
  }
};

// Get TV genres from TMDB
export const getTMDBTVGenres = async (req, res) => {
  try {
    const genres = await getTVGenres();
    res.json(genres);
  } catch (error) {
    console.error('Get TMDB TV genres error:', error);
    res.status(500).json({ error: 'Failed to fetch TV genres from TMDB' });
  }
};

// Auto-populate series when a new series is added with TMDB ID
export const autoPopulateNewSeries = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { tmdbId } = req.body;
    
    if (!tmdbId) {
      return res.status(400).json({ error: 'TMDB ID is required' });
    }

    // First get the show details to create the series entry
    const showDetails = await getTVShowDetails(tmdbId);
    
    const supabase = getSupabase();
    
    // Create the series entry
    const { data: newSeries, error: seriesError } = await supabase
      .from('movies')
      .insert({
        user_id: req.user.id,
        title: showDetails.name,
        category: 'Series',
        tmdb_id: tmdbId,
        genre: showDetails.genres?.map(g => g.name).join(', ') || '',
        release_year: new Date(showDetails.firstAirDate).getFullYear(),
        status: 'want-to-watch',
        total_seasons_available: showDetails.numberOfSeasons
      })
      .select()
      .single();

    if (seriesError) throw seriesError;

    // Now populate with seasons and episodes
    const { showDetails: fullDetails, seasons } = await populateSeriesFromTMDB(tmdbId);

    // Create seasons and episodes
    for (const seasonData of seasons) {
      const { data: newSeason } = await supabase
        .from('series_seasons')
        .insert({
          series_id: newSeries.id,
          season_number: seasonData.seasonNumber,
          season_name: seasonData.name,
          episode_count: seasonData.episodes.length,
          tmdb_season_id: seasonData.id,
          tmdb_rating: seasonData.voteAverage,
          status: 'not-started'
        })
        .select()
        .single();

      // Create episodes
      const episodeInserts = seasonData.episodes.map(episodeData => ({
        season_id: newSeason.id,
        episode_number: episodeData.episodeNumber,
        episode_name: episodeData.name,
        duration_minutes: episodeData.runtime,
        tmdb_episode_id: episodeData.id,
        tmdb_rating: episodeData.voteAverage,
        watched: false
      }));

      if (episodeInserts.length > 0) {
        await supabase
          .from('series_episodes')
          .insert(episodeInserts);
      }
    }

    res.status(201).json({
      message: 'Series created and populated successfully',
      series: {
        id: newSeries.id,
        title: newSeries.title,
        tmdbId: newSeries.tmdb_id,
        totalSeasons: showDetails.numberOfSeasons,
        totalEpisodes: showDetails.numberOfEpisodes
      }
    });
  } catch (error) {
    console.error('Auto-populate new series error:', error);
    res.status(500).json({ error: 'Failed to create and populate series' });
  }
};
