import express from 'express';
import { signUp, signIn, signOut, getUser, refreshToken, resendConfirmation } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/signup - Sign up a new user
router.post('/signup', signUp);

// POST /api/auth/signin - Sign in a user
router.post('/signin', signIn);

// POST /api/auth/signout - Sign out a user
router.post('/signout', signOut);

// GET /api/auth/user - Get current user
router.get('/user', getUser);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshToken);

// POST /api/auth/resend-confirmation - Resend email confirmation
router.post('/resend-confirmation', resendConfirmation);

export default router;