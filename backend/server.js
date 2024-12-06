// Import dependencies
const express = require("express"); // Express framework for handling HTTP requests
const cors = require("cors"); // Cross-Origin Resource Sharing middleware
const morgan = require("morgan"); // HTTP request logger for debugging
const helmet = require("helmet"); // Security middleware that helps set secure HTTP headers
const dotenv = require("dotenv"); // Environment variable manager
const userRoutes = require("./routes/userRoutes"); // User-related routes
const modelRoutes = require("./routes/modelRoutes"); // Model-related routes (e.g., uploading, fetching metadata)
const errorHandler = require("./middleware/errorHandler"); // Middleware for handling errors
const sequelize = require("./config/db"); // Sequelize instance for database connection

const { User, Collection, Item, MlmModel, Asset } = require('./models'); // Models

// Load environment variables from .env file
dotenv.config();

/**
 * @file Main server file for the application.
 * Initializes the Express server, configures middleware, connects to the database, and defines routes.
 */

// Initialize Express app
const app = express();

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
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://code.jquery.com",
          "https://cdn.jsdelivr.net",
          "https://stackpath.bootstrapcdn.com",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com", // Added unpkg for Leaflet script
        ],
        styleSrc: [
          "'self'",
          "https://stackpath.bootstrapcdn.com",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com", // Added unpkg for Leaflet CSS
        ],
        imgSrc: ["'self'", "data:", "https://*.tile.openstreetmap.org"],
      },
    },
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'frontend' directory
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));

/**
 * Asynchronous function to connect to the database and synchronize models.
 * Models are synchronized in the order of their dependencies.
 */
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync models with their dependencies in the correct order
    await User.sync({ force: true });       // User table with no dependencies
    await Collection.sync({ force: true }); // Collection depends on User
    await Item.sync({ force: true });       // Item depends on Collection
    await MlmModel.sync({ force: true });   // MlmModel depends on Collection
    await Asset.sync({ force: true });      // Asset depends on Item/MlmModel

    console.log("All tables synchronized successfully.");
  } catch (error) {
    console.error("Error during database synchronization:", error);
  }
})();

/**
 * Define API routes.
 * - User routes: /api/users
 * - Model routes: /api/models
 */
app.use("/api/models", modelRoutes);
app.use("/api/users", userRoutes);

/**
 * Root endpoint to verify the server status.
 * @route GET /
 * @returns {string} - Server status message.
 */
app.get("/", (req, res) => {
  res.send("API is online and functional");
});

// Error handling middleware to catch and handle any errors during request processing
app.use(errorHandler);

/**
 * Define the server port.
 * Uses the PORT environment variable or defaults to 5555.
 */
const PORT = process.env.PORT || 5555;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
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
