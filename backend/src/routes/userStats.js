import express from 'express';
import { getUserStats } from '../controllers/userStatsController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', getUserStats);

export default router;
