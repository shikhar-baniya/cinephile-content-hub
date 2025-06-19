import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import movieRoutes from './routes/movies.js';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware with relaxed CSP for Vercel
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Disabled for Vercel deployment
}));

// Basic middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint (useful for Vercel)
app.get('/health', (_, res) => res.status(200).json({ status: 'OK' }));

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
});

export default app;