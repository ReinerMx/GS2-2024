// Import required modules
const express = require('express');
const fs = require('fs');
const sequelize = require('../config/db');
const { MlmModel, Asset, Collection, Item } = require('../models');
const upload = require('../middleware/uploadMiddleware');

// Initialize the router
const router = express.Router();

// Get the root endpoint
router.get('/', (req, res) => {
    res.json({ message: "Welcome to the STAC API" });
});

// Conformance endpoint
router.get('/conformance', (req, res) => {
    res.json({ conformsTo: [
        "https://api.stacspec.org/v1.0.0/core",
        "https://api.stacspec.org/v1.0.0/item-search",
    ] });
});

// List all collections
router.get('/collections', async (req, res) => {
    try {
        const collections = await Collection.findAll();
        res.json({ collections });
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Error fetching collections' });
    }
});

// Get a specific collection by ID
router.get('/collections/:collection_id', async (req, res) => {
    const { collection_id } = req.params;
    try {
        const collection = await Collection.findOne({ where: { collection_id } });

        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        res.json(collection);
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ error: 'Error fetching collection' });
    }
});

// List all items in a specific collection
router.get('/collections/:collection_id/items', async (req, res) => {
    const { collection_id } = req.params;
    try {
        const items = await Item.findAll({ where: { collection_id } });

        if (!items || items.length === 0) {
            return res.status(404).json({ error: 'No items found in this collection' });
        }

        res.json({ items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Error fetching items' });
    }
});

// Get a specific item by ID in a collection
router.get('/collections/:collection_id/items/:item_id', async (req, res) => {
    const { collection_id, item_id } = req.params;
    try {
        // Fetch the item along with related mlm_model and assets
        const item = await Item.findOne({
            where: { collection_id, item_id },
            include: [
                {
                    model: MlmModel,
                    as: 'mlmModels',
                },
                {
                    model: Asset,
                    as: 'assets',
                },
            ],
        });

        // If no item is found, return a 404 error
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Format the response to include mlm_model, assets, and user_description
        const response = {
            ...item.dataValues, // Include the item data
            user_description: item.user_description, // Include the user_description field
            mlm_model: item.mlmModels, // Include the related mlm_model
            assets: item.assets, // Include the related assets
        };

        res.json(response); // Send the formatted response
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ error: 'Error fetching item' });
    }
});


// Search endpoint (GET)
router.get('/search', async (req, res) => {
    const { bbox, datetime, collection_id } = req.query;

    try {
        const where = {};

        if (collection_id) {
            where.collection_id = collection_id;
        }

        if (bbox) {
            where.bbox = bbox.split(',').map(Number);
        }

        if (datetime) {
            where['properties.datetime'] = datetime;
        }

        const items = await Item.findAll({ where });
        res.json({ items });
    } catch (error) {
        console.error('Error searching items:', error);
        res.status(500).json({ error: 'Error searching items' });
    }
});

// Search endpoint (POST)
router.post('/search', async (req, res) => {
    const { bbox, datetime, collection_id } = req.body;

    try {
        const where = {};

        if (collection_id) {
            where.collection_id = collection_id;
        }

        if (bbox) {
            where.bbox = bbox;
        }

        if (datetime) {
            where['properties.datetime'] = datetime;
        }

        const items = await Item.findAll({ where });
        res.json({ items });
    } catch (error) {
        console.error('Error searching items:', error);
        res.status(500).json({ error: 'Error searching items' });
    }
});


/**
 * Route to handle file upload and model data extraction.
 * Parses uploaded STAC JSON and saves related collections, items, assets, and models.
 */
router.post('/upload', upload.single('modelFile'), async (req, res) => {
    const { userDescription } = req.body;

    try {
        // Parse the uploaded STAC JSON file
        const stacData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));

        // Check if the uploaded file is a Collection or an Item
        const isCollection = stacData.type === 'Collection';
        const isFeature = stacData.type === 'Feature';

        if (!isCollection && !isFeature) {
            return res.status(400).json({ error: "Uploaded file must be either a Collection or an Item." });
        }

        // Start a transaction to ensure atomic operations
        await sequelize.transaction(async (transaction) => {
            if (isCollection) {
                // Extract and save Collection data
                const collectionData = {
                    type: stacData.type,
                    stac_version: stacData.stac_version,
                    stac_extensions: stacData.stac_extensions || [],
                    collection_id: stacData.id,
                    title: stacData.title || null,
                    description: stacData.description || null,
                    keywords: stacData.keywords || [],
                    license: stacData.license || null,
                    providers: stacData.providers || [],
                    extent: stacData.extent || null,
                    summaries: stacData.summaries || null,
                    links: stacData.links || [],
                    item_assets: stacData.item_assets || null,
                    user_description: userDescription || null,
                };

                await Collection.create(collectionData, { transaction });
                console.log('Collection uploaded successfully:', collectionData);
                return res.status(200).json({ message: 'Collection uploaded successfully!' });
            }

            if (isFeature) {
                // Check for required collection_id in the Item
                if (!stacData.collection) {
                    return res.status(400).json({ error: "The uploaded Item must reference an existing collection via 'collection'." });
                }

                // Ensure the referenced collection exists
                const collection = await Collection.findOne({
                    where: { collection_id: stacData.collection },
                    transaction
                });

                if (!collection) {
                    return res.status(400).json({ error: "Referenced collection does not exist." });
                }

                // Extract and save Item data
                const itemData = {
                    type: stacData.type,
                    stac_version: stacData.stac_version,
                    stac_extensions: stacData.stac_extensions || [],
                    item_id: stacData.id,
                    geometry: stacData.geometry || null,
                    bbox: stacData.bbox || null,
                    properties: stacData.properties,
                    links: stacData.links || [],
                    collection_id: collection.collection_id,
                    user_description: userDescription || null,
                };

                const savedItem = await Item.create(itemData, { transaction });
                console.log('Item uploaded successfully:', savedItem);

                // Save related MlmModel data if present
                if (stacData.properties) {
                    const properties = stacData.properties;
                    const savedModel = await MlmModel.create(
                        {
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
                            item_id: savedItem.item_id,
                            collection_id: collection.collection_id,
                        },
                        { transaction }
                    );

                    console.log('Model uploaded successfully:', savedModel);
                }

                // Save related Assets if present
                if (stacData.assets) {
                    const assets = stacData.assets;
                    for (const [key, asset] of Object.entries(assets)) {
                        await Asset.create(
                            {
                                href: asset.href,
                                type: asset.type,
                                title: asset.title,
                                description: asset.description,
                                item_id: savedItem.item_id,
                                collection_id: collection.collection_id,
                            },
                            { transaction }
                        );
                    }
                }

                res.status(200).json({ message: 'Item uploaded successfully!' });
            }
        });
    } catch (error) {
        console.error('Error saving STAC data to database:', error);
        res.status(500).json({ error: 'Error saving STAC data to database' });
    } finally {
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
    }
});

module.exports = router;