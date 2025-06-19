import express from 'express';
import cors from 'cors';
import compression from 'compression';

// Import routes
import movieRoutes from './routes/movies.js';
import authRoutes from './routes/auth.js';

const app = express();

// Essential middleware only
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  maxAge: 86400 // 24 hours
}));

app.use(compression());
app.use(express.json());

// Quick health check
app.get('/health', (_, res) => res.status(200).send('OK'));

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);

// Error handling
app.use((err, _, res, next) => {
  console.error('App error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;