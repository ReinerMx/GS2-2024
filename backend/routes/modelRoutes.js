// Import required modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const Model = require('../models/Model');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Initialize the router
const router = express.Router();

// GET all models
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
 * This function validates that required fields are present in the STAC data.
 *
 * @param {Object} stacData - The parsed JSON data from the uploaded file.
 * @returns {Object|Error} Formatted model details to store in the database or an error with missing fields.
 */
const extractModelDetails = (stacData) => {
    const properties = stacData.properties || {};
    const assets = stacData.assets || {};
    const links = stacData.links || [];
    
    // Collect missing fields to notify the user
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
            end: properties['end_datetime'] || (missingFields.push('temporalCoverage end'), null)
        },
        framework: properties['mlm:framework'] || (missingFields.push('framework'), null),
        frameworkVersion: properties['mlm:framework_version'] || (missingFields.push('frameworkVersion'), null),
        architecture: properties['mlm:architecture'] || (missingFields.push('architecture'), null),
        totalParameters: properties['mlm:total_parameters'] ?? (missingFields.push('totalParameters'), null),
        modelLink: assets.model?.href || (missingFields.push('modelLink'), null),
        sourceCodeLink: assets['source_code']?.href || (missingFields.push('sourceCodeLink'), null),
        otherLinks: links.filter(link => !['mlm:model', 'mlm:source_code'].includes(link.rel))
            .map(link => ({ rel: link.rel, href: link.href, type: link.type })),
    };

    // If there are missing fields, return an error
    if (missingFields.length > 0) {
        return {
            error: true,
            missingFields,
            message: "The file is missing required STAC-compliant metadata fields."
        };
    }

    return modelDetails;
};

// Route to handle file upload and model data extraction
router.post('/upload', uploadMiddleware.single('modelFile'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const stacData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Extract model details and check for missing fields
        const modelDetailsOrError = extractModelDetails(stacData);

        if (modelDetailsOrError.error) {
            // If required fields are missing, notify the user and include the missing fields in the response
            return res.status(400).json({
                message: modelDetailsOrError.message,
                missingFields: modelDetailsOrError.missingFields
            });
        }

        // Log the model details for debugging
        console.log("Model details to save:", modelDetailsOrError);

        // Save the model details to the database
        const newModel = await Model.create(modelDetailsOrError);

        res.status(201).json({ message: 'Model uploaded successfully', details: newModel });
    } catch (error) {
        console.error('Error uploading model:', error);
        res.status(500).json({ message: 'Error uploading model' });
    } finally {
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
    }
});

// Route to get details of a specific model by ID
router.get('/:id', async (req, res) => {
    const modelId = req.params.id;
    try {
        const model = await Model.findByPk(modelId); // Fetch model by primary key
        if (!model) {
            return res.status(404).json({ error: 'Model not found' });
        }
        res.json(model);
    } catch (error) {
        console.error('Error fetching model details:', error);
        res.status(500).json({ error: 'Failed to fetch model details' });
    }
});

module.exports = router;
