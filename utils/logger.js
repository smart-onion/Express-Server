// Import necessary modules from Winston
import { createLogger, format, transports } from "winston";

// Create filenames for log files based on the current date
var infoFilename = new Date().toLocaleDateString() + "_info";
var warnFilename = new Date().toLocaleDateString() + "_warn";
var errorFilename = new Date().toLocaleDateString() + "_error";

// Create a logger instance
const logger = createLogger({
  // Define transports (output destinations) for the logger
  transports: [
    // Output to a file with log level set to "info"
    new transports.File({
      level: "info", // Log level
      filename: `logs/${infoFilename}.log`, // File path
    }),
    // Output to a file with log level set to "error"
    new transports.File({
      level: "error", // Log level
      filename: `logs/${errorFilename}.log`, // File path
    }),
    // Output to a file with log level set to "warn"
    new transports.File({
      level: "warn", // Log level
      filename: `logs/${warnFilename}.log`, // File path
    }),
  ],
  // Define format for log messages
  format: format.combine(
    format.timestamp(), // Add timestamp to log message
    format.json(), // Format log message as JSON
    format.metadata() // Add metadata to log message
  ),
});

// Export the logger instance for use in other parts of the application
export default logger;
