const fs = require("fs");
const path = require("path");

// Define the path to the log file
const logFilePath = path.join(__dirname, "../logs/audit.log");

// Middleware-Funktion für Audit-Logging
/**
 * Middleware function to log audit information for specific routes.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 *
 * @description This middleware logs the HTTP method, original URL, timestamp, and user information
 * for specific routes defined in the `authRoutes` array. The log is written to a file specified by `logFilePath`.
 * If the user is not authenticated, it logs as 'Unauthenticated User'.
 */
const auditLogger = (req, res, next) => {
  const { method, originalUrl } = req;
  const timestamp = new Date().toISOString();
  const user = req.user ? `UserID: ${req.user.id}` : "Unauthenticated User";

  const authRoutes = [
    "/api/users/login",
    "/api/users/logout",
    "/api/users/register",
    "/api/users/refresh",
    "/upload",
  ];

  if (authRoutes.includes(originalUrl)) {
    const logMessage = `[${timestamp}] ${method} ${originalUrl} - ${user}\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
        console.error("Error writing to audit log:", err);
      }
    });
  }

  next();
};

module.exports = auditLogger;
