const fs = require("fs");
const path = require("path");
// const jwt = require("jsonwebtoken");
// const secretKey = process.env.JWT_SECRET;

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

//   // Extract JWT token from the Authorization header
//   const authHeader = headers.authorization;
//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     const token = authHeader.split(" ")[1];
//     try {
//       const decoded = jwt.verify(token, secretKey);
//       user = `UserID: ${decoded.userId}`; // Extract UserID from the token
//     } catch (err) {
//       console.error("Invalid JWT token:", err.message);
//     }
//   }
  // Only log specific routes
  const authRoutes = [
    "/api/users/login",
    "/api/users/logout",
    "/api/users/password",
    "/models/upload",
    "/models/delete",
  ];

  if (authRoutes.includes(originalUrl)) {
    const logMessage = `[${timestamp}] ${method} ${originalUrl} - ${user}\n`;

    // Write the log to the file (automatically creates the file if it does not exist)
    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
        console.error("Error writing to audit log:", err);
      }
    });
  }

  next(); // Proceed to the next middleware or route
};

module.exports = auditLogger;
