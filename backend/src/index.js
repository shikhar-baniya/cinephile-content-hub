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
app.use(express.json({ limit: '10mb' }));

// Enhanced health check with environment validation
app.get('/health', (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      }
    };
    
    res.status(200).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'BingeBook API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      movies: '/api/movies',
      auth: '/api/auth'
    }
  });
});

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('App error:', err);
  if (res.headersSent) return next(err);
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;