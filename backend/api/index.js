import app from '../src/index.js';
import serverless from 'serverless-http';

// Create handler with minimal configuration
const handler = serverless(app);

export default async function (req, res) {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE,PATCH');
      res.setHeader('Access-Control-Allow-Headers', '*');
      return res.status(200).end();
    }

    await handler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}