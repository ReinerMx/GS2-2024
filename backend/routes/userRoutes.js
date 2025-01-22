const express = require('express');
const { register, login } = require('../controllers/authController'); // Import auth functions
const { User, Collection } = require('../models');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @route POST /register
 * @description Handles user registration
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /login
 * @description Handles user login
 * @access Public
 */
router.post('/login', login);

/**
 * 
 */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
  }

  // Validate refresh token and issue new access token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
          return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token: newToken });
  });
});


/**
 * @route GET /me
 * @description Fetches the currently logged-in user's details
 * @access Private
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      username: user.username,
      email: user.email,
      saved_collections: user.saved_collections || [],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

/**
 * @route POST /:userId/saveCollection
 * @description Adds a collection to the user's saved collections
 * @access Public
 * @param {string} userId - ID of the user
 * @body {string} collectionId - ID of the collection to be saved
 */
router.post('/:userId/saveCollection', async (req, res) => {
  const { userId } = req.params;
  const { collectionId } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.saved_collections.includes(collectionId)) {
      user.saved_collections.push(collectionId);
      await user.save();
    }

    res.status(200).json({ message: 'Collection saved', saved_collections: user.saved_collections });
  } catch (error) {
    console.error('Error saving collection:', error);
    res.status(500).json({ error: 'Error saving collection' });
  }
});

/**
 * @route DELETE /collections/:collectionId
 * @description Removes a collection from the user's saved collections and deletes it from the database
 * @access Private
 * @param {string} collectionId - ID of the collection to be removed
 */
router.delete('/collections/:collectionId', authMiddleware, async (req, res) => {
  const { collectionId } = req.params;

  try {
    // Find the user
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the collection exists in saved collections
    const savedCollections = user.saved_collections || [];
    if (!savedCollections.includes(collectionId)) {
      return res.status(404).json({ message: 'Collection not found in saved collections.' });
    }

    // Remove the collection from the user's saved collections
    user.saved_collections = savedCollections.filter((id) => id !== collectionId);
    await user.save();

    // Delete the collection from the database
    const collection = await Collection.findOne({ where: { collection_id: collectionId } });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found in database.' });
    }

    await collection.destroy(); // Deletes the collection from the table

    res.status(200).json({ message: 'Collection removed successfully from user and database.' });
  } catch (error) {
    console.error('Error removing collection:', error);
    res.status(500).json({ message: 'Failed to remove collection.' });
  }
});

/**
 * @route GET /:userId/savedCollections
 * @description Fetches all saved collections for a specific user
 * @access Public
 * @param {string} userId - ID of the user
 */
router.get('/:userId/savedCollections', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const collections = await Collection.findAll({
      where: { collection_id: user.saved_collections },
    });

    res.status(200).json({ saved_collections: collections });
  } catch (error) {
    console.error('Error fetching saved collections:', error);
    res.status(500).json({ error: 'Error fetching saved collections' });
  }
});

module.exports = router;
