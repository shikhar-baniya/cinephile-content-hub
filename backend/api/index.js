import app from '../src/index.js';
import serverless from 'serverless-http';

// Configure serverless handler with specific options
const handler = serverless(app, {
  binary: ['image/*', 'application/pdf'],
  request: {
    // Preventing response timeouts
    timeout: 9000,
  }
});

// Export an async function that handles the request
export default async function (req, res) {
  try {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Handle the request with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 9000);
    });

    const responsePromise = handler(req, res);
    await Promise.race([responsePromise, timeoutPromise]);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(504).json({ error: 'Gateway Timeout', details: error.message });
    }
  }
}