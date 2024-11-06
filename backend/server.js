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

// Verbindung zur Datenbank herstellen
(async () => {
  try {
    await db.authenticate();
    console.log('Datenbankverbindung erfolgreich.');
    await db.sync(); // Synchronisiert die Datenbankmodelle
  } catch (error) {
    console.error('Fehler bei der Datenbankverbindung:', error);
    process.exit(1); // Server nicht starten, falls DB-Verbindung fehlschlägt
  }
})();

// Routen
app.use('/api/users', userRoutes); // Routen für Benutzeraktionen wie Registrierung und Login
app.use('/api/models', modelRoutes); // Routen für Modelle, wie Upload und Abrufen von Metadaten

// Root Endpoint für die Überprüfung des Serverstatus
app.get('/', (req, res) => {
  res.send('API ist online und funktionsfähig');
});

// Fehlerbehandlung Middleware (nach allen anderen Routen)
app.use(errorHandler);

// Port und Serverstart
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
