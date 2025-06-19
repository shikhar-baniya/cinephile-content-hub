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
  // Quick response for preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(200).end();
  }

  try {
    // Set a reasonable timeout
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 8000);
    });

    // Race between the handler and timeout
    await Promise.race([handler(req, res), timeout]);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(error.message === 'Timeout' ? 504 : 500)
         .json({ error: error.message === 'Timeout' ? 'Gateway Timeout' : 'Internal Server Error' });
    }
  }
}