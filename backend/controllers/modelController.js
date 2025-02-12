// controllers/modelController.js
const Model = require('../models/Model');
const multer = require('multer');
const path = require('path');

// Set up multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

exports.uploadMiddleware = upload.single('modelFile'); // Middleware for handling file uploads

exports.uploadModel = async (req, res) => {
    try {
        const { modelName, description, taskType, dataType, language } = req.body;
        
        // Save metadata and file path to the PostgreSQL database
        const newModel = await Model.create({
            modelName,
            description,
            taskType,
            dataType,
            language,
            filePath: req.file.path // Path where the file is stored
        });

        res.status(200).json({ message: 'Model uploaded and metadata saved successfully.' });
    } catch (error) {
        console.error('Error uploading model:', error);
        res.status(500).json({ message: 'Error uploading model.' });
    }
};

exports.getAllModels = async (req, res) => {
    try {
      const models = await Model.findAll();
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching models' });
    }
  };
  