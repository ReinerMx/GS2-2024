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
    const newUser = await User.create({ username, email, password: hashedPassword });
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

    // Validate input data
    if (!email || !password) {
      console.error("Missing input data:", { email, password });
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error("User not found:", email);
      return res.status(401).json({ message: 'Invalid login credentials.' });
    }

    console.log("User found:", user);

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison successful:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid login credentials.' });
    }

    // Generate a JWT token
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in the .env file");
      throw new Error('JWT_SECRET is not defined.');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Token successfully generated:", token);

    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Verify user token 
exports.verifyToken = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }

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
