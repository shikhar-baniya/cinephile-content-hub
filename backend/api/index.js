import app from '../src/index.js';
import serverless from 'serverless-http';

// Export the serverless function
export default serverless(app);