import { getSupabase } from '../config/database.js';

// Simple in-memory cache for user tokens (for short-term caching)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const authenticateUser = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header',
        code: 'MISSING_AUTH_HEADER'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Check cache first
    const cached = userCache.get(token);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      req.user = cached.user;
      console.log(`Auth cache hit - ${Date.now() - startTime}ms`);
      return next();
    }

    const supabase = getSupabase();
    
    // Add timeout to auth request
    const authPromise = supabase.auth.getUser(token);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth timeout')), 10000);
    });
    
    const { data: { user }, error } = await Promise.race([authPromise, timeoutPromise]);
    
    if (error || !user) {
      console.error('Auth error:', error);
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Cache the user for future requests
    userCache.set(token, {
      user,
      timestamp: Date.now()
    });

    // Clean up old cache entries periodically
    if (userCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of userCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          userCache.delete(key);
        }
      }
    }

    req.user = user;
    console.log(`Auth completed - ${Date.now() - startTime}ms`);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    const duration = Date.now() - startTime;
    
    if (error.message === 'Auth timeout') {
      return res.status(408).json({ 
        error: 'Authentication timeout',
        code: 'AUTH_TIMEOUT',
        duration
      });
    }
    
    res.status(401).json({ 
      error: 'Authentication failed',
      code: 'AUTH_FAILED',
      duration
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Check cache first
      const cached = userCache.get(token);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        req.user = cached.user;
        return next();
      }
      
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        userCache.set(token, {
          user,
          timestamp: Date.now()
        });
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    // Continue without user if auth fails
    next();
  }
};