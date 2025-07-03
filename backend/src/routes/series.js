import express from 'express';
import { 
  getSeriesSeasons, 
  getSeason, 
  createSeason, 
  updateSeason, 
  deleteSeason,
  getSeriesWithSeasons,
  bulkUpdateSeasonProgress
} from '../controllers/seriesController.js';
import { 
  getSeasonEpisodes, 
  getEpisode, 
  createEpisode, 
  updateEpisode, 
  deleteEpisode,
  toggleEpisodeWatched,
  bulkUpdateEpisodes,
  markEpisodesWatchedUpTo,
  getSeasonEpisodeStats
} from '../controllers/episodeController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All series routes require authentication
router.use(authenticateUser);

// ============= SERIES ROUTES =============

// GET /api/series/:seriesId/overview - Get series with aggregated season data
router.get('/:seriesId/overview', getSeriesWithSeasons);

// ============= SEASON ROUTES =============

// GET /api/series/:seriesId/seasons - Get all seasons for a series
router.get('/:seriesId/seasons', getSeriesSeasons);

// POST /api/series/:seriesId/seasons - Create a new season
router.post('/:seriesId/seasons', createSeason);

// GET /api/series/seasons/:seasonId - Get a specific season
router.get('/seasons/:seasonId', getSeason);

// PUT /api/series/seasons/:seasonId - Update a season
router.put('/seasons/:seasonId', updateSeason);

// DELETE /api/series/seasons/:seasonId - Delete a season
router.delete('/seasons/:seasonId', deleteSeason);

// PUT /api/series/seasons/:seasonId/progress - Bulk update season progress
router.put('/seasons/:seasonId/progress', bulkUpdateSeasonProgress);

// ============= EPISODE ROUTES =============

// GET /api/series/seasons/:seasonId/episodes - Get all episodes for a season
router.get('/seasons/:seasonId/episodes', getSeasonEpisodes);

// POST /api/series/seasons/:seasonId/episodes - Create a new episode
router.post('/seasons/:seasonId/episodes', createEpisode);

// GET /api/series/seasons/:seasonId/episodes/stats - Get episode statistics for a season
router.get('/seasons/:seasonId/episodes/stats', getSeasonEpisodeStats);

// PUT /api/series/seasons/:seasonId/episodes/bulk - Bulk update multiple episodes
router.put('/seasons/:seasonId/episodes/bulk', bulkUpdateEpisodes);

// PUT /api/series/seasons/:seasonId/episodes/watch-up-to - Mark episodes watched up to specific episode
router.put('/seasons/:seasonId/episodes/watch-up-to', markEpisodesWatchedUpTo);

// GET /api/series/episodes/:episodeId - Get a specific episode
router.get('/episodes/:episodeId', getEpisode);

// PUT /api/series/episodes/:episodeId - Update an episode
router.put('/episodes/:episodeId', updateEpisode);

// DELETE /api/series/episodes/:episodeId - Delete an episode
router.delete('/episodes/:episodeId', deleteEpisode);

// PUT /api/series/episodes/:episodeId/watched - Toggle episode watched status
router.put('/episodes/:episodeId/watched', toggleEpisodeWatched);

export default router;
