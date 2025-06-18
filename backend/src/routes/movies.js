import express from 'express';
import { getMovies, addMovie, updateMovie, deleteMovie } from '../controllers/movieController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All movie routes require authentication
router.use(authenticateUser);

// GET /api/movies - Get all movies for authenticated user
router.get('/', getMovies);

// POST /api/movies - Add a new movie
router.post('/', addMovie);

// PUT /api/movies/:id - Update a movie
router.put('/:id', updateMovie);

// DELETE /api/movies/:id - Delete a movie
router.delete('/:id', deleteMovie);

export default router;