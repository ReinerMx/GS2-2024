const express = require('express');
const { register, login } = require('../controllers/authController'); // Import auth functions
const { User, Collection } = require('../models');
const router = express.Router();

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// Add a collection to saved collections
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

// Remove a collection
router.delete('/:userId/removeCollection', async (req, res) => {
  const { userId } = req.params;
  const { collectionId } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.saved_collections = user.saved_collections.filter(id => id !== collectionId);
    await user.save();

    res.status(200).json({ message: 'Collection removed', saved_collections: user.saved_collections });
  } catch (error) {
    console.error('Error removing collection:', error);
    res.status(500).json({ error: 'Error removing collection' });
  }
});

// Get all saved collections
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