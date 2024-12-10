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
        const isCollection = stacData.type === 'Collection';
        const properties = stacData.properties;
        const assets = stacData.assets;

        // Model Details for MlmModel table
        const modelDetails = {
            mlm_name: properties['mlm:name'],
            mlm_architecture: properties['mlm:architecture'],
            mlm_tasks: properties['mlm:tasks'] || [],
            mlm_framework: properties['mlm:framework'] || null,
            mlm_framework_version: properties['mlm:framework_version'] || null,
            mlm_memory_size: properties['mlm:memory_size'] || null,
            mlm_total_parameters: properties['mlm:total_parameters'] || null,
            mlm_pretrained: properties['mlm:pretrained'] || null,
            mlm_pretrained_source: properties['mlm:pretrained_source'] || null,
            mlm_batch_size_suggestion: properties['mlm:batch_size_suggestion'] || null,
            mlm_accelerator: properties['mlm:accelerator'] || null,
            mlm_accelerator_summary: properties['mlm:accelerator_summary'] || null,
            mlm_accelerator_count: properties['mlm:accelerator_count'] || null,
            mlm_input: properties['mlm:input'],
            mlm_output: properties['mlm:output'],
            mlm_hyperparameters: properties['mlm:hyperparameters'],
        };

        // Save collection, item, model, and assets atomically
        let savedModel;
        await sequelize.transaction(async (transaction) => {
            const collection = isCollection
                ? await Collection.create(
                      {
                          type: stacData.type,
                          stac_version: stacData.stac_version,
                          stac_extensions: stacData.stac_extensions,
                          collection_id: stacData.id,
                          title: stacData.title || null,
                          description: stacData.description || 'No description',
                          keywords: stacData.keywords || null,
                          license: stacData.license,
                          providers: stacData.providers,
                          extent: stacData.extent,
                          summaries: stacData.summaries || null,
                          links: stacData.links,
                          item_assets: stacData.item_assets || null,
                          assets: stacData.assets || null,
                          user_id: user_id || null,
                          userDescription: userDescription || null,
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
