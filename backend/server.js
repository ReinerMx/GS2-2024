// Import dependencies
const express = require("express"); // Express framework for handling HTTP requests
const cors = require("cors"); // Cross-Origin Resource Sharing middleware
const morgan = require("morgan"); // HTTP request logger for debugging
const helmet = require("helmet"); // Security middleware that helps set secure HTTP headers
const dotenv = require("dotenv"); // Environment variable manager
const userRoutes = require("./routes/userRoutes"); // User-related routes
const modelRoutes = require("./routes/modelRoutes"); // Model-related routes (e.g., uploading, fetching metadata)
const errorHandler = require("./middleware/errorHandler"); // Middleware for handling errors
const sequelize = require("./config/db"); // Adjust the path if necessary


// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware configuration
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

// Database connection and sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Sync alle Modelle mit `force: true`, um die Tabellen zu überschreiben
    await require("./models/Collection").sync({ force: true });
    await require("./models/Item").sync({ force: true });
    await require("./models/MlmModel").sync({ force: true });
    await require("./models/Asset").sync({ force: true });

    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
})();




// Define routes for the API
app.use("/api/models", modelRoutes); // Model-related routes
app.use("/api/users", userRoutes); // User-related routes

// Root endpoint to verify if the server is up and running
app.get("/", (req, res) => {
  res.send("API is online and functional");
});

// Error handling middleware to catch and handle any errors during request processing
app.use(errorHandler);

// Define the port from environment variables or default to 5555
const PORT = process.env.PORT || 5555;

// Start the server on the specified port and log a message
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

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
