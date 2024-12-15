// Import required modules
const express = require('express');
const fs = require('fs');
const sequelize = require('../config/db');
const { MlmModel, Asset, Collection, Item } = require('../models');
const { Op } = require("sequelize"); // Sequelize Operatoren
const upload = require('../middleware/uploadMiddleware');


// Initialize the router
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        stac_version: "1.0.0",
        id: "root",
        description: "STAC API Root",
        conformsTo: [
            "https://api.stacspec.org/v1.0.0/core",
            "https://api.stacspec.org/v1.0.0/item-search"
        ],
        links: [
            {
                rel: "self",
                href: "http://localhost:5555/",
                type: "application/json"
            },
            {
                rel: "search",
                href: "http://localhost:5555/search",
                type: "application/json"
            },
            {
                rel: "conformance",
                href: "http://localhost:5555/conformance",
                type: "application/json"
            },
            {
                rel: "collections",
                href: "http://localhost:5555/collections",
                type: "application/json"
            }
        ]
    });
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
        // Fetch the item along with its parent collection, mlm_model, and assets
        const item = await Item.findOne({
            where: { collection_id, item_id },
            include: [
                {
                    model: Collection,
                    as: 'parentCollection', 
                },
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

        // Format the response to include related data
        const response = {
            ...item.dataValues,
            parentCollection: item.parentCollection, // Include parentCollection
            user_description: item.user_description,
            mlm_model: item.mlmModels,
            assets: item.assets,
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ error: 'Error fetching item' });
    }
});



// STAC-conform /search-Route
router.all('/search', async (req, res) => {
    const isPost = req.method === 'POST';
    const params = isPost ? req.body : req.query;

    const { bbox, datetime, collections, limit = 10 } = params;

    try {
        const where = [];

        // Collection Filter
        if (collections) {
            where.push({ collection_id: { [Op.in]: Array.isArray(collections) ? collections : [collections] } });
        }
        
        // Bounding Box Filter
        if (bbox) {
            let parsedBbox;
            if (typeof bbox === 'string') {
                parsedBbox = bbox.split(',').map(Number);
            } else if (Array.isArray(bbox)) {
                parsedBbox = bbox.map(Number);
            }
        
            if (parsedBbox.length === 4) {
                const [minX, minY, maxX, maxY] = parsedBbox;
                where.push(sequelize.literal(`
                    ST_Intersects(
                        geometry,
                        ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, 4326)
                    )
                `));
            } else {
                throw new Error("bbox must contain exactly 4 coordinates: [minX, minY, maxX, maxY]");
            }
        }
        
        // Datetime Filter
        if (datetime) {
            let start, end;
        
            if (Array.isArray(datetime) && datetime.length === 2) {
                [start, end] = datetime;
            } else if (typeof datetime === 'string' && datetime.includes('/')) {
                [start, end] = datetime.split('/');
            } else {
                throw new Error("Invalid datetime format. Use 'start/end' or ['start', 'end']");
            }
        
            // Check if the datetime values are valid
            if (!isNaN(Date.parse(start)) && !isNaN(Date.parse(end))) {
                where.push({
                    [Op.and]: [
                        sequelize.literal(`CAST(properties->>'start_datetime' AS TIMESTAMP) <= '${end}'`),
                        sequelize.literal(`CAST(properties->>'end_datetime' AS TIMESTAMP) >= '${start}'`)
                    ]
                });
            } else {
                throw new Error("Invalid datetime values. Ensure they are ISO 8601-compliant.");
            }
        }
        
        // Search Items
        const items = await Item.findAll({
            where: { [Op.and]: where },
            limit,
        });
        
        // STAConform Response
        res.json({
            type: "FeatureCollection",
            features: items.map(item => ({
                type: "Feature",
                id: item.item_id,
                stac_version: "1.0.0",
                geometry: item.geometry ? {
                    type: item.geometry.type,
                    coordinates: item.geometry.coordinates
                } : null,
                bbox: item.bbox,
                properties: item.properties,
                collection: item.collection_id,
                links: [
                    {
                        rel: "self",
                        href: `http://localhost:5555/collections/${item.collection_id}/items/${item.item_id}`,
                        type: "application/json"
                    },
                    {
                        rel: "collection",
                        href: `http://localhost:5555/collections/${item.collection_id}`,
                        type: "application/json"
                    }
                ]
            })),
            links: [
                {
                    rel: "self",
                    href: `http://localhost:5555/search`,
                    type: "application/json"
                }
            ],
            context: {
                returned: items.length,
                limit: limit
            }
        });
    } catch (error) {
        console.error("Error in /search route:", error);
        res.status(400).json({ error: error.message });
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