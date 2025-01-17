const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error("No token provided.");
    return res.status(401).json({ message: 'Access denied. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      console.error(`User with ID ${decoded.userId} not found.`);
      return res.status(404).json({ message: 'User not found.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token validation failed:", error);
    res.status(400).json({ message: 'Invalid Token' });
  }
};
