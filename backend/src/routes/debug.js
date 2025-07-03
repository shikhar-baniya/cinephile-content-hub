import express from 'express';
import { debugSeries, debugAllSeries } from '../controllers/debugController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All debug routes require authentication
router.use(authenticateUser);

// GET /api/debug/series - Get all series with season counts
router.get('/series', debugAllSeries);

// GET /api/debug/series/:seriesId - Get detailed info for a specific series
router.get('/series/:seriesId', debugSeries);

export default router;
