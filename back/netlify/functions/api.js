const serverless = require('serverless-http');
const app = require('../../server');

// Export for Netlify Functions
exports.handler = serverless(app);
