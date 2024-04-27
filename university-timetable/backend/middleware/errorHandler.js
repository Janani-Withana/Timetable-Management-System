// middlewares/errorHandler.js
const { createLogger, transports, format } = require('winston');

// Create a Winston logger
const logger = createLogger({
  level: 'error', // Set log level
  format: format.combine(
    format.timestamp(), // Add timestamp
    format.json() // JSON format
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'error.log' }) // Log to file
  ]
});

// Error handling middleware
const errorHandlerMiddleware = (err, req, res, next) => {
  logger.error(err.stack); // Log the error stack
  res.status(500).json({ error: 'Internal Server Error' }); // Send a generic error response
};

module.exports = errorHandlerMiddleware;
