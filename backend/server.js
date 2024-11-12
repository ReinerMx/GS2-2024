// Import dependencies
const express = require('express'); // Express framework for handling HTTP requests
const cors = require('cors'); // Cross-Origin Resource Sharing middleware
const morgan = require('morgan'); // HTTP request logger for debugging
const helmet = require('helmet'); // Security middleware that helps set secure HTTP headers
const dotenv = require('dotenv'); // Environment variable manager
const db = require('./config/db'); // Database configuration
const userRoutes = require('./routes/userRoutes'); // User-related routes
const errorHandler = require('./middleware/errorHandler'); // Middleware for handling errors
const { authMiddleware } = require('./middleware/authMiddleware'); // Middleware for JWT authentication

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware configuration

// Enable CORS to allow cross-origin requests from frontend
app.use(cors());

// Configure helmet to set HTTP headers for security, including a custom CSP to allow external scripts and styles
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Default policy: Only load resources from the same origin
        scriptSrc: [
          "'self'", // Allow scripts from the same origin
          "https://code.jquery.com", // Allow jQuery scripts from its CDN
          "https://cdn.jsdelivr.net", // Allow Popper.js from jsDelivr
          "https://stackpath.bootstrapcdn.com" // Allow Bootstrap JavaScript from its CDN
        ],
        styleSrc: [
          "'self'", // Allow styles from the same origin
          "https://stackpath.bootstrapcdn.com" // Allow Bootstrap CSS from its CDN
        ],
        imgSrc: [
          "'self'", // Allow images from the same origin
          "data:" // Allow inline images (data URIs), often used for icons like SVGs
        ]
      }
    }
  })
); // Helmet with custom CSP configuration

// Morgan middleware to log HTTP requests in the console (useful for development and debugging)
app.use(morgan('dev'));

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to parse URL-encoded data from HTML forms
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'frontend' directory, which contains the frontend HTML, CSS, and JavaScript files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// Database connection and sync
(async () => {
  try {
    await db.authenticate(); // Test the database connection
    console.log('Database connection has been established successfully.');
    await db.sync(); // Sync models with the database, creating tables if they don't exist
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Stop the server if the database connection fails
  }
})();

// Define routes for the API

// Routes for user-related actions, such as registration and login
app.use('/api/users', userRoutes);

// Protected route example
// This route is only accessible if the user is authenticated
app.get('/api/protected', authMiddleware, (req, res) => {
  res.send('Zugriff auf geschützte Route gewährt');
});

// Root endpoint to verify if the server is up and running
app.get('/', (req, res) => {
  res.send('API is online and functional');
});

// Error handling middleware to catch and handle any errors occurring during request processing
app.use(errorHandler);

// Define the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server on the specified port and log a message
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
