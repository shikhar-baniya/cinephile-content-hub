import express from 'express';
import { getEpisodeAnalytics, getSeasonAnalytics } from '../controllers/analyticsController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticateUser);

// Get episode watch analytics
router.post('/episodes', getEpisodeAnalytics);

// Get season completion analytics
router.post('/seasons', getSeasonAnalytics);

export default router;