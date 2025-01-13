const User = require('../models/User'); // Importiere das User-Modell
const bcrypt = require('bcryptjs'); // Für Passwort-Hashing
const jwt = require('jsonwebtoken'); // Für Token-Generierung

// Registrierung eines neuen Benutzers
exports.register = async (req, res) => {
  try {
    console.log("Registrierungsdaten empfangen:", req.body);

    const { username, email, password } = req.body;

    // Eingabedaten validieren
    if (!username || !email || !password) {
      console.error("Fehlende Eingabedaten:", { username, email, password });
      return res.status(400).json({ message: 'Alle Felder sind erforderlich.' });
    }

    // Überprüfen, ob die E-Mail bereits existiert
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.error("Benutzer existiert bereits:", existingUser);
      return res.status(400).json({ message: 'E-Mail bereits registriert.' });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Gehashtes Passwort:", hashedPassword);

    // Benutzer erstellen
    const newUser = await User.create({ username, email, password: hashedPassword });
    console.log("Benutzer erfolgreich erstellt:", newUser);

    res.status(201).json({ message: 'Benutzer erfolgreich registriert.' });
  } catch (error) {
    console.error("Fehler bei der Registrierung:", error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
};

// Benutzer-Login
exports.login = async (req, res) => {
  try {
    console.log("Login-Daten empfangen:", req.body);

    const { email, password } = req.body;

    // Eingabedaten validieren
    if (!email || !password) {
      console.error("Fehlende Eingabedaten:", { email, password });
      return res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich.' });
    }

    // Benutzer finden
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error("Benutzer nicht gefunden:", email);
      return res.status(401).json({ message: 'Ungültige Anmeldedaten.' });
    }

    console.log("Benutzer gefunden:", user);

    // Passwort vergleichen
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Passwortvergleich erfolgreich:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten.' });
    }

    // JWT-Token generieren
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET fehlt in der .env-Datei");
      throw new Error('JWT_SECRET ist nicht definiert.');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Token erfolgreich generiert:", token);

    res.json({ token });
  } catch (error) {
    console.error("Fehler beim Login:", error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
};

// Benutzerüberprüfung 
exports.verifyToken = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Kein Token bereitgestellt.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET fehlt in der .env-Datei");
      throw new Error('JWT_SECRET ist nicht definiert.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token erfolgreich verifiziert:", decoded);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    res.status(200).json({ message: 'Token ist gültig.', user });
  } catch (error) {
    console.error("Fehler bei der Token-Verifizierung:", error);
    res.status(401).json({ message: 'Ungültiger Token.' });
  }
};
