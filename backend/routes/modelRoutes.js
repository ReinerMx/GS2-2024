const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');
const { Model } = require('../models/Model');

// Route to handle model uploads with file and metadata
router.post('/upload', modelController.uploadMiddleware, modelController.uploadModel);


router.get('/', modelController.getAllModels); 
module.exports = router;

// Route to handle filtering models
router.get('/filter', async (req, res) => {
  try {
      const filters = req.query;
      let query = {};

      if (filters.taskType) {
          query.taskType = filters.taskType;
      }
      if (filters.dataType) {
          query.dataType = filters.dataType;
      }
      if (filters.language) {
          query.language = filters.language;
      }

      const models = await Model.findAll({ where: query });
      res.json(models);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching models' });
  }
});


// Route to fetch all models
router.get('/', async (req, res) => {
    try {
        const models = await Model.findAll();
        res.json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ message: 'Error fetching models' });
    }
});

// Route to search models by name or description
router.get('/search', async (req, res) => {
    const { term } = req.query;
    try {
        const models = await Model.findAll({
            where: {
                [Op.or]: [
                    { modelName: { [Op.iLike]: `%${term}%` } },
                    { description: { [Op.iLike]: `%${term}%` } }
                ]
            }
        });
        res.json(models);
    } catch (error) {
        console.error('Error searching models:', error);
        res.status(500).json({ message: 'Error searching models' });
    }
});

module.exports = router;


module.exports = router;