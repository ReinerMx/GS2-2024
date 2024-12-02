// Import required modules
const express = require('express');
const fs = require('fs');
const sequelize = require('../config/db');
const { MlmModel, Asset, Collection, Item } = require('../models');
const upload = require('../middleware/uploadMiddleware');

// Initialize the router
const router = express.Router();

/**
 * Route to get details of a specific model by its ID.
 * Fetches the model from the database and returns its details with associated assets and collection information.
 */
router.get('/:id', async (req, res) => {
    const modelId = req.params.id;

    try {
        const model = await MlmModel.findOne({
            where: { id: modelId },
            include: [
                {
                    model: Asset,
                    as: 'asset',
                    attributes: ['description', 'type', 'href'],
                },
                {
                    model: Collection,
                    as: 'collection',
                    attributes: ['title', 'description'],
                },
            ],
        });

        if (!model) {
            return res.status(404).json({ error: 'Model not found' });
        }

        res.json(model);
    } catch (error) {
        console.error('Error fetching model details:', error);
        res.status(500).json({ error: 'Failed to fetch model details' });
    }
});

/**
 * Route to get all models from the database.
 * Includes related collections, items, and assets for a complete STAC-compliant response.
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
                            attributes: ['description', 'type', 'href'],
                        },
                    ],
                },
                {
                    model: Item,
                    as: 'item',
                    attributes: ['item_id', 'properties'],
                },
            ],
        });

        if (!models || models.length === 0) {
            return res.status(404).json({ error: 'No models found' });
        }

        res.json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Error fetching models' });
    }
});

/**
 * Route to handle file upload and model data extraction.
 * Parses uploaded STAC JSON and saves related collections, items, assets, and models.
 */
router.post('/upload', upload.single('modelFile'), async (req, res) => {
    const { userDescription } = req.body;

    try {
        const stacData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
        const isCollection = stacData.type === 'FeatureCollection';

        // Validate STAC Collection or Item
        if (isCollection) {
            const { extent } = stacData;
            if (
                !extent ||
                !extent.spatial ||
                !extent.temporal ||
                !Array.isArray(extent.spatial.bbox) ||
                extent.spatial.bbox.length === 0 ||
                !Array.isArray(extent.temporal.interval) ||
                extent.temporal.interval.length === 0
            ) {
                return res.status(400).json({ error: 'Invalid or missing extent field for collection.' });
            }
        }

        const properties = stacData.properties || {};
        const assets = stacData.assets || {};

        const modelDetails = {
            name: properties['mlm:name'],
            framework: properties['mlm:framework'],
            framework_version: properties['mlm:framework_version'],
            memory_size: properties['mlm:memory_size'],
            total_parameters: properties['mlm:total_parameters'],
            description: properties['description'],
            pretrained: properties['mlm:pretrained'] || null,
            pretrained_source: properties['mlm:pretrained_source'] || null,
            batch_size_suggestion: properties['mlm:batch_size_suggestion'] || null,
            accelerator: properties['mlm:accelerator'] || null,
            accelerator_summary: properties['mlm:accelerator_summary'] || null,
            tasks: Array.isArray(properties['mlm:tasks']) ? properties['mlm:tasks'] : null,
            architecture: properties['mlm:architecture'],
            model_input: properties['mlm:input'],
            model_output: properties['mlm:output'],
            start_datetime: properties['start_datetime'],
            end_datetime: properties['end_datetime'],
            userDescription: userDescription || null,
        };

        // Save collection, item, model, and assets atomically
        let savedModel;
        await sequelize.transaction(async (transaction) => {
            const collection = isCollection
                ? await Collection.create(
                      {
                          type: stacData.type,
                          stac_version: stacData.stac_version,
                          title: stacData.title || 'Default Title',
                          description: stacData.description || 'No description',
                          extent: stacData.extent,
                      },
                      { transaction }
                  )
                : null;

            savedModel = await MlmModel.create(
                {
                    ...modelDetails,
                    collection_id: collection ? collection.id : null,
                },
                { transaction }
            );

            for (const [key, asset] of Object.entries(assets)) {
                await Asset.create(
                    {
                        asset_type: key,
                        href: asset.href,
                        type: asset.type,
                        title: asset.title,
                        description: asset.description,
                        model_id: savedModel.id,
                        collection_id: collection ? collection.id : null,
                    },
                    { transaction }
                );
            }
        });

        res.status(200).json({ message: 'Model uploaded successfully!', details: savedModel });
    } catch (error) {
        console.error('Error saving model to database:', error);
        res.status(500).json({ error: 'Error saving model to database' });
    } finally {
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
    }
});

module.exports = router;
