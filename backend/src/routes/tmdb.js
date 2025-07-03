import express from 'express';
import {
  getTMDBShowDetails,
  getTMDBSeasonDetails,
  populateSeriesWithTMDBData,
  searchTMDBShows,
  getTMDBTrendingShows,
  getTMDBTVGenres,
  autoPopulateNewSeries
} from '../controllers/tmdbController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// ============= PUBLIC TMDB ROUTES (No Auth Required) =============

// GET /api/tmdb/tv/search - Search TV shows
router.get('/tv/search', searchTMDBShows);

// GET /api/tmdb/tv/trending - Get trending TV shows
router.get('/tv/trending', getTMDBTrendingShows);

// GET /api/tmdb/tv/genres - Get TV genres
router.get('/tv/genres', getTMDBTVGenres);

// GET /api/tmdb/tv/:tmdbId - Get TV show details
router.get('/tv/:tmdbId', getTMDBShowDetails);

// GET /api/tmdb/tv/:tmdbId/season/:seasonNumber - Get season details
router.get('/tv/:tmdbId/season/:seasonNumber', getTMDBSeasonDetails);

// ============= AUTHENTICATED TMDB ROUTES =============

// Use authentication for routes that modify user data
router.use(authenticateUser);

// PUT /api/tmdb/series/:seriesId/populate - Populate existing series with TMDB data
router.put('/series/:seriesId/populate', populateSeriesWithTMDBData);

// POST /api/tmdb/series/auto-create - Create and populate new series from TMDB
router.post('/series/auto-create', autoPopulateNewSeries);

export default router;
