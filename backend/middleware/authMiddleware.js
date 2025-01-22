const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    console.error("No token provided.");
    return res.status(401).json({ message: 'Access denied. Please log in.' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Find the user in the database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      console.error(`User with ID ${decoded.userId} not found.`);
      return res.status(401).json({
        message: 'Access denied. Please log in to upload files.',
      });
    }

    // Attach the user information to the request object
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error("Token expired at:", error.expiredAt);
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    console.error("Token validation failed:", error.message);
    return res.status(400).json({ message: 'Invalid token. Access denied.' });
  }
};
