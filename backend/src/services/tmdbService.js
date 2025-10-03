import fetch from 'node-fetch';

// You'll need to add TMDB_API_KEY to your environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.warn('TMDB_API_KEY not found in environment variables. TMDB features will not work.');
}

// Helper function to make TMDB API requests
async function tmdbRequest(endpoint) {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key not configured');
  }

  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('TMDB API request failed:', error);
    throw error;
  }
}

// Get TV show details including season information
export async function getTVShowDetails(tmdbId) {
  try {
    const data = await tmdbRequest(`/tv/${tmdbId}`);
    
    return {
      id: data.id,
      name: data.name,
      overview: data.overview,
      firstAirDate: data.first_air_date,
      lastAirDate: data.last_air_date,
      numberOfSeasons: data.number_of_seasons,
      numberOfEpisodes: data.number_of_episodes,
      status: data.status,
      genres: data.genres,
      seasons: data.seasons?.map(season => ({
        id: season.id,
        name: season.name,
        seasonNumber: season.season_number,
        episodeCount: season.episode_count,
        airDate: season.air_date,
        overview: season.overview,
        posterPath: season.poster_path
      })) || []
    };
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw error;
  }
}

// Get detailed season information with episodes
export async function getSeasonDetails(tmdbId, seasonNumber) {
  try {
    const data = await tmdbRequest(`/tv/${tmdbId}/season/${seasonNumber}`);
    
    return {
      id: data.id,
      name: data.name,
      overview: data.overview,
      seasonNumber: data.season_number,
      airDate: data.air_date,
      posterPath: data.poster_path,
      voteAverage: data.vote_average,
      episodes: data.episodes?.map(episode => ({
        id: episode.id,
        name: episode.name,
        overview: episode.overview,
        episodeNumber: episode.episode_number,
        airDate: episode.air_date,
        runtime: episode.runtime,
        stillPath: episode.still_path,
        voteAverage: episode.vote_average
      })) || []
    };
  } catch (error) {
    console.error('Error fetching season details:', error);
    throw error;
  }
}

// Get episode details
export async function getEpisodeDetails(tmdbId, seasonNumber, episodeNumber) {
  try {
    const data = await tmdbRequest(`/tv/${tmdbId}/season/${seasonNumber}/episode/${episodeNumber}`);
    
    return {
      id: data.id,
      name: data.name,
      overview: data.overview,
      episodeNumber: data.episode_number,
      seasonNumber: data.season_number,
      airDate: data.air_date,
      runtime: data.runtime,
      stillPath: data.still_path,
      voteAverage: data.vote_average
    };
  } catch (error) {
    console.error('Error fetching episode details:', error);
    throw error;
  }
}

// Populate series with season and episode data from TMDB
export async function populateSeriesFromTMDB(tmdbId) {
  try {
    // Get TV show details
    const showDetails = await getTVShowDetails(tmdbId);
    
    // Get detailed information for each season (excluding season 0 if it exists)
    const seasonsWithEpisodes = [];
    
    for (const season of showDetails.seasons) {
      // Skip season 0 (specials) by default, but you can change this if needed
      if (season.seasonNumber === 0) continue;
      
      try {
        const seasonDetails = await getSeasonDetails(tmdbId, season.seasonNumber);
        seasonsWithEpisodes.push(seasonDetails);
        
        // Add a small delay to avoid hitting TMDB rate limits
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        console.error(`Error fetching season ${season.seasonNumber}:`, error);
        // Continue with other seasons even if one fails
        seasonsWithEpisodes.push({
          ...season,
          episodes: []
        });
      }
    }
    
    return {
      showDetails,
      seasons: seasonsWithEpisodes
    };
  } catch (error) {
    console.error('Error populating series from TMDB:', error);
    throw error;
  }
}

// Search for TV shows
export async function searchTVShows(query) {
  try {
    const data = await tmdbRequest(`/search/tv?query=${encodeURIComponent(query)}`);
    
    return {
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results: data.results?.map(show => ({
        id: show.id,
        name: show.name,
        overview: show.overview,
        firstAirDate: show.first_air_date,
        genreIds: show.genre_ids,
        originCountry: show.origin_country,
        originalLanguage: show.original_language,
        originalName: show.original_name,
        popularity: show.popularity,
        posterPath: show.poster_path,
        backdropPath: show.backdrop_path,
        voteAverage: show.vote_average,
        voteCount: show.vote_count
      })) || []
    };
  } catch (error) {
    console.error('Error searching TV shows:', error);
    throw error;
  }
}

// Get trending TV shows
export async function getTrendingTVShows(timeWindow = 'week') {
  try {
    const data = await tmdbRequest(`/trending/tv/${timeWindow}`);
    
    return {
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results: data.results?.map(show => ({
        id: show.id,
        name: show.name,
        overview: show.overview,
        firstAirDate: show.first_air_date,
        genreIds: show.genre_ids,
        originCountry: show.origin_country,
        originalLanguage: show.original_language,
        originalName: show.original_name,
        popularity: show.popularity,
        posterPath: show.poster_path,
        backdropPath: show.backdrop_path,
        voteAverage: show.vote_average,
        voteCount: show.vote_count
      })) || []
    };
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    throw error;
  }
}

// Get TV show genres
export async function getTVGenres() {
  try {
    const data = await tmdbRequest('/genre/tv/list');
    
    return data.genres || [];
  } catch (error) {
    console.error('Error fetching TV genres:', error);
    throw error;
  }
}
