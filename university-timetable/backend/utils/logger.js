// utils/logger.js
const { createLogger, transports, format } = require('winston');

// Create a Winston logger
const logger = createLogger({
  level: 'info', // Set log level
  format: format.combine(
    format.timestamp(), // Add timestamp
    format.json() // JSON format
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'combined.log' }) // Log to file
  ]
});

module.exports = logger;
