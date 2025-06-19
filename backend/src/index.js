import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Import routes
import movieRoutes from './routes/movies.js';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();

// Essential middleware only
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Health check - keep this minimal
app.get('/health', (_, res) => res.status(200).send('OK'));

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);

// Basic error handler
app.use((err, _, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;