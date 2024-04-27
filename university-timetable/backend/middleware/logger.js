// middlewares/logger.js
const morgan = require('morgan');

// Log format
const logFormat = ':method :url :status :response-time ms - :res[content-length]';

// Create a logger middleware using Morgan
const loggerMiddleware = morgan(logFormat, {
  // Options
});

module.exports = loggerMiddleware;
