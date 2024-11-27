// Import required modules
const express = require('express');
const fs = require('fs');
const Model = require('../models/Model');
const upload = require('../middleware/uploadMiddleware');

// Initialize the router
const router = express.Router();

/**
 * Route to get all models from the database.
 * Fetches all models and returns them as JSON.
 *
 * @name GET /
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {JSON} - A list of all models or an error message.
 */
router.get('/', async (req, res) => {
    try {
        const models = await Model.findAll(); // Fetch all models from the database
        res.json(models); // Send the models as JSON
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ message: 'Error fetching models' });
    }
});

/**
 * Extracts model details from the STAC data file and formats it for database storage.
 * Validates that all required fields are present in the STAC data.
 *
 * @param {Object} stacData - Parsed JSON data from the uploaded file.
 * @param {Object} additionalFields - Additional user-provided fields.
 * @param {string} [additionalFields.userDescription] - Optional user description.
 * @param {number} [additionalFields.cloudCoverage] - Cloud coverage percentage.
 * @returns {Object} - Formatted model details to store in the database.
 * @throws {Error} - If required fields are missing.
 */
const extractModelDetails = (stacData, additionalFields) => {
    const properties = stacData.properties || {};
    const assets = stacData.assets || {};
    const links = stacData.links || [];
    const missingFields = [];

    const modelDetails = {
        modelName: properties['mlm:name'] || (missingFields.push('modelName'), null),
        description: properties['description'] || (missingFields.push('description'), null),
        taskType: Array.isArray(properties['mlm:tasks'])
            ? properties['mlm:tasks'].join(', ')
            : (properties['mlm:tasks'] || (missingFields.push('taskType'), null)),
        dataType: properties['mlm:input']?.[0]?.input?.data_type || (missingFields.push('dataType'), null),
        resolution: Array.isArray(properties['mlm:input']?.[0]?.input?.shape)
            ? properties['mlm:input'][0].input.shape.join(' x ')
            : (properties['mlm:input']?.[0]?.input?.shape || (missingFields.push('resolution'), null)),
        numberOfBands: properties['mlm:input']?.[0]?.bands?.length ?? (missingFields.push('numberOfBands'), null),
        fileFormat: assets.model?.type || (missingFields.push('fileFormat'), null),
        dataSource: links.find(link => link.rel === 'derived_from')?.href || (missingFields.push('dataSource'), null),
        spatialCoverage: stacData.geometry || (missingFields.push('spatialCoverage'), null),
        temporalCoverage: {
            start: properties['start_datetime'] || (missingFields.push('temporalCoverage start'), null),
            end: properties['end_datetime'] || (missingFields.push('temporalCoverage end'), null),
        },
        framework: properties['mlm:framework'] || (missingFields.push('framework'), null),
        frameworkVersion: properties['mlm:framework_version'] || (missingFields.push('frameworkVersion'), null),
        architecture: properties['mlm:architecture'] || (missingFields.push('architecture'), null),
        totalParameters: properties['mlm:total_parameters'] ?? (missingFields.push('totalParameters'), null),
        modelLink: assets.model?.href || (missingFields.push('modelLink'), null),
        sourceCodeLink: assets['source_code']?.href || (missingFields.push('sourceCodeLink'), null),
        otherLinks: links.filter(link => !['mlm:model', 'mlm:source_code'].includes(link.rel))
            .map(link => ({ rel: link.rel, href: link.href, type: link.type })),
        // New fields
        userDescription: additionalFields.userDescription || null, // Optional field
        cloudCoverage: additionalFields.cloudCoverage !== undefined && additionalFields.cloudCoverage !== null
            ? parseFloat(additionalFields.cloudCoverage)
            : (missingFields.push('cloudCoverage')),
    };

    if (missingFields.length > 0) {
        return {
            error: true,
            missingFields,
            message: "The file is missing required STAC-compliant metadata fields.",
        };
    }

    return modelDetails;
};

/**
 * Route to handle file upload and model data extraction.
 * Parses the uploaded file and extracts metadata for database storage.
 *
 * @name POST /upload
 * @function
 * @async
 * @param {Object} req - Express request object containing the file and additional fields.
 * @param {Object} res - Express response object.
 * @returns {JSON} - The details of the uploaded model or an error message.
 */
router.post('/upload', upload.single('modelFile'), async (req, res) => {
    console.log('Body:', req.body); // Debugging: Log additional fields
    console.log('File:', req.file); // Debugging: Log uploaded file

    const { userDescription, cloudCoverage } = req.body;

    try {
        const filePath = req.file.path; // Path to the uploaded file
        const stacData = JSON.parse(fs.readFileSync(filePath, 'utf8')); // Parse the JSON file

        // Extract model details
        const modelDetailsOrError = extractModelDetails(stacData, {
            userDescription,
            cloudCoverage: parseFloat(cloudCoverage),
        });

        // Check for missing fields
        if (modelDetailsOrError.error) {
            console.error('Missing fields:', modelDetailsOrError.missingFields);
            return res.status(400).json({
                message: modelDetailsOrError.message,
                missingFields: modelDetailsOrError.missingFields,
            });
        }

        console.log('Extracted model details:', modelDetailsOrError); // Debugging

        // Save the model to the database
        const newModel = await Model.create(modelDetailsOrError);
        console.log('Model saved successfully:', newModel); // Debugging
        return res.status(201).json({ message: 'Model uploaded successfully', details: newModel });
    } catch (error) {
        console.error('Error saving model to database:', error);
        return res.status(500).json({ message: 'Error saving model to database' });
    } finally {
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path); // Remove the uploaded file
        }
    }
});

/**
 * Route to get details of a specific model by its ID.
 * Fetches the model from the database and returns its details.
 *
 * @name GET /:id
 * @function
 * @async
 * @param {Object} req - Express request object containing the model ID in params.
 * @param {Object} res - Express response object.
 * @returns {JSON} - Details of the model or an error message.
 */
router.get('/:id', async (req, res) => {
    const modelId = req.params.id; // Get the model ID from the request parameters
    try {
        const model = await Model.findByPk(modelId); // Fetch model by primary key
        if (!model) {
            return res.status(404).json({ error: 'Model not found' });
        }
        res.json(model); // Send the model details as JSON
    } catch (error) {
        console.error('Error fetching model details:', error);
        res.status(500).json({ error: 'Failed to fetch model details' });
    }
});

module.exports = router;
