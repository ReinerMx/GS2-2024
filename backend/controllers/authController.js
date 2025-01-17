const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For token generation

/**
 * @function register
 * @description Registers a new user
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  try {
    console.log("Registration data received:", req.body);

    const { username, email, password } = req.body;

    // Validate input data
    if (!username || !email || !password) {
      console.error("Missing input data:", { username, email, password });
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.error("User already exists:", existingUser);
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);

    // Create a new user
    const newUser = await User.create({ username, email, password: hashedPassword });
    console.log("User successfully created:", newUser);

    res.status(201).json({ message: 'User successfully registered.' });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * @function login
 * @description Logs in a user and generates a JWT token
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    console.log("Login data received:", req.body);

    const { email, password } = req.body;

    // Validate input data
    if (!email || !password) {
      console.error("Missing input data:", { email, password });
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    console.log("Database query for email:", email);
    if (!user) {
      console.error("User not found for email:", email);
      return res.status(401).json({ message: 'Invalid login credentials. The email is incorrect.' });
    }
    console.log("User found:", user);

    // Compare the input password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isMatch);
    if (!isMatch) {
      console.error("Password mismatch for user:", email);
      return res.status(401).json({ message: 'Invalid login credentials. The password is incorrect.' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Token successfully generated:", token);

    res.json({ token, message: "Login successful!" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: 'Internal server error. Login failed.' });
  }
};

/**
 * @function verifyToken
 * @description Verifies a user's JWT token
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyToken = async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in the .env file");
      throw new Error('JWT_SECRET is not defined.');
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token successfully verified:", decoded);

    // Find the user associated with the token
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
