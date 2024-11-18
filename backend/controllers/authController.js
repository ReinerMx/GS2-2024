const User = require('../models/User'); // Importiere das User-Modell
const bcrypt = require('bcryptjs'); // Für Passwort-Hashing
const jwt = require('jsonwebtoken'); // Für Token-Generierung

// Registrierung eines neuen Benutzers
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Eingabedaten validieren
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Alle Felder sind erforderlich.' });
    }

    // Überprüfen, ob die E-Mail bereits existiert
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'E-Mail bereits registriert.' });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer erstellen
    await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'Benutzer erfolgreich registriert.' });
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
};

// Benutzer-Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Eingabedaten validieren
    if (!email || !password) {
      return res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich.' });
    }

    // Benutzer finden
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten.' });
    }

    // Passwort vergleichen
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten.' });
    }

    // Token erstellen
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET ist nicht definiert.');
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Fehler beim Login:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
};
