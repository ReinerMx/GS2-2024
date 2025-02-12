// Import dependencies
const express = require("express"); // Express framework for handling HTTP requests
const cors = require("cors"); // Cross-Origin Resource Sharing middleware
const morgan = require("morgan"); // HTTP request logger for debugging
const helmet = require("helmet"); // Security middleware that helps set secure HTTP headers
const dotenv = require("dotenv"); // Environment variable manager
const auditLogger = require("./middleware/auditLogger"); // Audit-Logging Middleware
const userRoutes = require("./routes/userRoutes"); // User-related routes
const modelRoutes = require("./routes/modelRoutes"); // Model-related routes (e.g., uploading, fetching metadata)
const errorHandler = require("./middleware/errorHandler"); // Middleware for handling errors
const initDB = require("./initDB"); //Populate db with data on server start
const compression = require("compression"); // Import compression-Pakage

// Load environment variables from .env file
dotenv.config();

/**
 * @file Main server file for the application.
 * Initializes the Express server, configures middleware, connects to the database, and defines routes.
 */

// Initialize Express app
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(auditLogger);

/**
 * Define API routes.
 * - User routes: /api/users
 * - Model routes: /
 */
app.use("/", modelRoutes);
app.use("/api/users", userRoutes);

// Serve static files from the 'frontend' directory with caching
const path = require("path");
app.use(
  express.static(path.join(__dirname, "../frontend"), {
    maxAge: "1d", // Cache for 1 Day
    etag: true, // Enable ETag to reload only changed files
  })
);

/**
 * Middleware configuration.
 * - Enables CORS for cross-origin resource sharing.
 * - Sets security-related HTTP headers using Helmet.
 * - Logs HTTP requests using Morgan.
 * - Parses incoming JSON and URL-encoded data.
 */
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://code.jquery.com",
          "https://cdn.jsdelivr.net",
          "https://stackpath.bootstrapcdn.com",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com",
        ],
        styleSrc: [
          "'self'",
          "https://stackpath.bootstrapcdn.com",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net", // Allow SimpleMDE styles
          "https://maxcdn.bootstrapcdn.com", // Allow Font Awesome styles
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://*.tile.openstreetmap.org",
          "https://cdnjs.cloudflare.com",
          "https://via.placeholder.com", // Allow Placeholder images
        ],
        connectSrc: ["'self'", "https://*.tile.openstreetmap.org"], // Ensure OSM tiles load correctly
      },
    },
    crossOriginEmbedderPolicy: false, // Optional for external resources
  })
);

// Error handling middleware to catch and handle any errors during request processing
app.use(errorHandler);

/**
 * Define the server port.
 * Uses the PORT environment variable or defaults to 5555.
 */
const PORT = process.env.PORT || 5555;

// Start the server and populate the database
async function startServer() {
  try {
    console.log("🔄 Starting database initialization...");
    await initDB();
    console.log("✅ Database initialization complete.");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    /**
     * Handle server errors.
     * If the port is in use, try a random available port.
     */
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Trying another port...`);
        setTimeout(() => {
          server.close();
          server.listen(0); // 0 means a random available port
        }, 1000);
      } else {
        console.error("Server error:", error);
      }
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    process.exit(1); // Exit process if critical error occurs
  }
}

startServer();
