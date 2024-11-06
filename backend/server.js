// server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const db = require('./config/db'); // Datenbankkonfiguration
const userRoutes = require('./routes/userRoutes');
const modelRoutes = require('./routes/modelRoutes');
const errorHandler = require('./middleware/errorHandler'); // Fehler-Handling Middleware

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware configuration
app.use(cors()); // Ermöglicht CORS für Cross-Origin-Anfragen vom Frontend
app.use(helmet()); // Fügt Sicherheits-Header hinzu
app.use(morgan('dev')); // Logger für Anfragen im Entwicklungsmodus
app.use(express.json()); // Parsing von JSON-Daten
app.use(express.urlencoded({ extended: true })); // Parsing von URL-encoded Daten

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));



(async () => {
  try {
    await db.authenticate();
    console.log('Database connection has been established successfully.');
    await db.sync(); // Sync models with the database
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit if database connection fails
  }
})();


// Routes
app.use('/api/users', userRoutes); // Route for user interactions like registration and login
app.use('/api/models', modelRoutes); // Routes for models, like uploading and fetching metadata

// Root endpoint for checking server status
app.get('/', (req, res) => {
  res.send('API is online and functional');
});

// Error handling middleware (after all other routes)
app.use(errorHandler);

// Port and server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
