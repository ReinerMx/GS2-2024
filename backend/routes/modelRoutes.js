// Import required modules
const express = require('express');
const fs = require('fs');
const sequelize = require('../config/db'); 
const Model = require('../models/MlmModel'); 
const Collection = require('../models/Collection');
const Item = require('../models/Item');
const Asset = require('../models/Asset');
const upload = require('../middleware/uploadMiddleware');
const { MlmModel, Asset, Item, Collection } = require('../models');

// Initialize the router
const router = express.Router();

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
    const modelId = req.params.id;
    console.log(`Received request for model ID: ${modelId}`); // Log die Anfrage

    try {
        const model = await Model.findOne({ where: { id: modelId } });
        console.log('Queried model:', model); // Log das Ergebnis der Query
        if (!model) {
            console.log('Model not found in database'); // Log, wenn kein Modell gefunden wurde
            return res.status(404).json({ error: 'Model not found' });
        }
        res.json(model);
    } catch (error) {
        console.error('Error fetching model:', error); // Log den Fehler
        res.status(500).json({ error: 'Failed to fetch model details' });
    }
});



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
        const models = await Collection.findAll({
            include: [
                {
                    model: MlmModel,
                    as: 'model',
                    attributes: ['name', 'tasks', 'architecture', 'description'],
                    include: [
                        {
                            model: Asset,
                            as: 'asset',
                            attributes: ['description', 'type', 'href']
                        }
                    ]
                },
                {
                    model: Item,
                    as: 'item',
                    attributes: ['item_id', 'properties']
                }
            ]
        });

        res.json(models); // Sende die Ergebnisse als JSON
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Error fetching models' });
    }
});



// Route to fetch all models
router.get('/', async (req, res) => {
    try {
        const models = await Model.findAll(); 
        res.status(200).json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ message: 'Error fetching models' });
    }
});


/**
 * Route to handle file upload and model data extraction.
 */
router.post('/upload', upload.single('modelFile'), async (req, res) => {
    const { userDescription} = req.body;

    try {
        // Parse the uploaded JSON file
        const stacData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));

        // Determine whether the input is a collection or an item
        const isCollection = stacData.type === 'FeatureCollection';

        // Validate `extent` if it's a collection
        if (isCollection) {
            const extent = stacData.extent;
            if (
                !extent ||
                typeof extent !== 'object' ||
                !extent.spatial ||
                !extent.temporal ||
                !Array.isArray(extent.spatial.bbox) ||
                extent.spatial.bbox.length === 0 ||
                !Array.isArray(extent.temporal.interval) ||
                extent.temporal.interval.length === 0
            ) {
                return res.status(400).json({
                    message: 'Invalid or missing extent field for collection. Ensure it has spatial.bbox and temporal.interval arrays.',
                });
            }
        }

        // Prepare collection or item data
        const collectionData = isCollection
            ? {
                  type: stacData.type || 'FeatureCollection',
                  stac_version: stacData.stac_version || '1.0.0',
                  stac_extensions: stacData.stac_extensions || [],
                  collection_id: stacData.collection_id || 'default-collection-id',
                  title: stacData.title || 'Default Title',
                  description: stacData.description || 'Default Description',
                  keywords: stacData.keywords || [],
                  license: stacData.license || 'CC-BY-4.0',
                  providers: stacData.providers || {},
                  extent: stacData.extent || { spatial: { bbox: [] }, temporal: { interval: [] } },
                  summaries: stacData.summaries || {},
                  links: stacData.links || [],
              }
            : null;

        // Extract model details
        const properties = stacData.properties || {};
        const assets = stacData.assets || {};
        const missingFields = [];

        const modelDetails = {
            name: properties['mlm:name'] || (missingFields.push('name'), null),
            framework: properties['mlm:framework'] || (missingFields.push('framework'), null),
            framework_version: properties['mlm:framework_version'] || null,
            memory_size: properties['mlm:memory_size'] || null,
            total_parameters: properties['mlm:total_parameters'] || null,
            description: properties['description'] || (missingFields.push('description'), null),
            pretrained: properties['mlm:pretrained'] || null,
            pretrained_source: properties['mlm:pretrained_source'] || null,
            batch_size_suggestion: properties['mlm:batch_size_suggestion'] || null,
            accelerator: properties['mlm:accelerator'] || null,
            accelerator_summary: properties['mlm:accelerator_summary'] || null,
            tasks: Array.isArray(properties['mlm:tasks']) ? properties['mlm:tasks'] : (missingFields.push('tasks'), null),
            architecture: properties['mlm:architecture'] || (missingFields.push('architecture'), null),
            model_input: properties['mlm:input'] || (missingFields.push('model_input'), null),
            model_output: properties['mlm:output'] || (missingFields.push('model_output'), null),
            userDescription: userDescription || null,
            
        };

        // If required fields are missing, return an error
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required metadata fields for model.',
                missingFields,
            });
        }

        // Start a transaction to ensure all data is saved atomically
        let savedModel; // Variable für das gespeicherte Modell
        await sequelize.transaction(async (transaction) => {
            let collection;
            if (isCollection) {
                // Save the collection
                collection = await Collection.create(collectionData, { transaction });
            }

            // Save the model
            const model = await Model.create(
                {
                    ...modelDetails,
                    collection_id: collection ? collection.id : null, // Foreign key to collection (optional)
                },
                { transaction }
            );

            savedModel = model; // Speichere das Modell für die Antwort

            // Save the item
            const itemDetails = {
                type: stacData.type,
                stac_version: stacData.stac_version,
                stac_extensions: stacData.stac_extensions || [],
                item_id: stacData.id,
                geometry: stacData.geometry || null,
                bbox: stacData.bbox || null,
                properties: stacData.properties || {},
                links: stacData.links || [],
                assets: stacData.assets || {},
                collection_id: collection ? collection.id : null, // Foreign key to collection (optional)
            };
            const item = await Item.create(itemDetails, { transaction });

            // Save assets
            for (const [assetKey, asset] of Object.entries(assets)) {
                await Asset.create(
                    {
                        asset_type: assetKey,
                        href: asset.href,
                        type: asset.type,
                        title: asset.title,
                        description: asset.description,
                        item_id: item.id, // Foreign key to item
                        model_id: model.id, // Foreign key to model
                        collection_id: collection ? collection.id : null, // Foreign key to collection (optional)
                    },
                    { transaction }
                );
            }
        });

        // Return a success response
        res.status(200).json({
            message: 'Model uploaded successfully!',
            details: savedModel,
        });
    } catch (error) {
        console.error('Error saving model to database:', error);
        res.status(500).json({ message: 'Error saving model to database' });
    } finally {
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path); // Remove the uploaded file
        }
    }
});


module.exports = router;
