import serverless from 'serverless-http';
import app from '../src/index.js';

// Initialize the handler outside the function scope
const handler = serverless(app, {
  provider: 'vercel'
});

// Export a minimal handler
export default async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE,PATCH');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(200).end();
  }

  return handler(req, res);
};