import serverless from 'serverless-http';
import app from '../src/index.js';

// Configure handler with optimized settings
const handler = serverless(app, {
  basePath: '',
  binary: false,
  request: {
    // Disable request processing we don't need
    logger: false,
    requestId: false
  }
});

// Lightweight wrapper
export default async function (req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Quick response for preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Increase timeout for cold starts and database operations
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Function timeout')), 25000); // 25 seconds
    });

    // Race between the handler and timeout
    await Promise.race([handler(req, res), timeout]);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      const isTimeout = error.message === 'Function timeout';
      res.status(isTimeout ? 504 : 500)
         .json({ 
           error: isTimeout ? 'Gateway Timeout - Function took too long to respond' : 'Internal Server Error',
           timestamp: new Date().toISOString()
         });
    }
  }
}