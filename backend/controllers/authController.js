const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For token generation

// Register a new user
exports.register = async (req, res) => {
  try {
    console.log("Registration data received:", req.body);

    const { username, email, password } = req.body;

    // Validate input data
    if (!username || !email || !password) {
      console.error("Missing input data:", { username, email, password });
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.error("User already exists:", existingUser);
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);


    // Create a new user
    const newUser = await User.create({ username, email, password});
    console.log("User successfully created:", newUser);

    res.status(201).json({ message: 'User successfully registered.' });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    console.log("Login data received:", req.body);

    const { email, password } = req.body;

    // 1. Überprüfung: E-Mail und Passwort vorhanden?
    if (!email || !password) {
      console.error("Missing input data:", { email, password });
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 2. Benutzer anhand der E-Mail suchen
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    console.log("Database query for email:", email);
    if (!user) {
      console.error("User not found for email:", email);
      return res.status(401).json({ message: 'Invalid login credentials. The e-mail is incorrect' });
    }
    console.log("User found:", user);




    // Manual bcrypt comparison for debugging
    const inputPassword = password; // Password entered by the user
    const storedHash = user.password; // Hash from the database

    bcrypt.compare(inputPassword, storedHash, (err, result) => {
      if (err) {
        console.error("Error during manual password comparison:", err);
      } else {
        console.log("Manual password comparison result:", result); // Should log true or false
      }
    });

    // Existing password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isMatch);
    if (!isMatch) {
      console.error("Password mismatch for user:", email);
      return res.status(401).json({ message: 'Invalid login credentials. The passwort is incorrect.' });
    }

    // 4. JWT-Token generieren
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Token successfully generated:", token);

    res.json({ token, message: "Login successful!" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: 'Internal server error. Login failed.' });
  }
};


// Verify user token
exports.verifyToken = async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in the .env file");
      throw new Error('JWT_SECRET is not defined.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token successfully verified:", decoded);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Token is valid.', user });
  } catch (error) {
    console.error("Error during token verification:", error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};