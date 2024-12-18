// Import required modules
const express = require('express');
const fs = require('fs');
const sequelize = require('../config/db');
const { MlmModel, Asset, Collection, Item } = require('../models');
const { Op } = require("sequelize"); // Sequelize operators for database queries
const upload = require('../middleware/uploadMiddleware');


// Initialize the router
const router = express.Router();

/**
 * @route GET /
 * @description Returns the STAC API root with supported conformance classes and links.
 * @access Public
 */
router.get('/', (req, res) => {
    res.json({
        type: "Catalog",
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
                rel: "conformance",
                href: "http://localhost:5555/conformance",
                type: "application/json"
            },
            {
                rel: "collections",
                href: "http://localhost:5555/collections",
                type: "application/json"
            },
            {
                rel: "search",
                href: "http://localhost:5555/search",
                type: "application/json"
            }
        ]
    });
});

/**
 * @route GET /conformance
 * @description Returns the supported conformance classes of the STAC API.
 * @access Public
 */
router.get('/conformance', (req, res) => {
    res.json({ conformsTo: [
        "https://api.stacspec.org/v1.0.0/core",
        "https://api.stacspec.org/v1.0.0/item-search",
    ] });
});

/**
 * @route GET /collections
 * @description Fetches and returns all available STAC collections.
 * @access Public
 */
router.get('/collections', async (req, res) => {
    try {
        const collections = await Collection.findAll();
        res.json({ collections });
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Error fetching collections' });
    }
});

/**
 * @route GET /collections/:collection_id
 * @description Fetches a specific STAC collection by ID.
 * @param {string} collection_id - The ID of the collection.
 * @access Public
 */
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

/**
 * @route GET /collections/:collection_id/items
 * @description Fetches all items in a specific collection.
 * @param {string} collection_id - The ID of the collection.
 * @access Public
 */
router.get('/collections/:collection_id/items', async (req, res) => {
    const { collection_id } = req.params;
    try {
        const items = await Item.findAll({ where: { collection_id } });

        if (!items || items.length === 0) {
            return res.json({ items: [] }); // Rückgabe eines leeren Arrays
        }        

        res.json({ items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Error fetching items' });
    }
});

/**
 * @route GET /collections/:collection_id/items/:item_id
 * @description Fetches a specific item within a collection by its ID.
 * @param {string} collection_id - The ID of the collection.
 * @param {string} item_id - The ID of the item.
 * @access Public
 */
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


/**
 * @route ALL /search
 * @description Searches items in the database based on geographic filters (GeoJSON or Bounding Box), 
 *              temporal coverage (datetime range), and collection filters.
 *              Returns a STAC-compliant FeatureCollection as a response.
 * @access Public
 */
router.all('/search', async (req, res) => {
    // Check if the request method is POST, otherwise default to query parameters
    const isPost = req.method === 'POST';
    const params = isPost ? req.body : req.query;

    // Destructure parameters from request
    const { bbox, datetime, collections, limit = 10, geoFilter } = params;

    try {
        const where = []; // Array to store filtering conditions for SQL query

        /** 
         * GeoJSON Filter:
         * If a GeoJSON geometry is provided (e.g., a polygon), 
         * add a spatial filter using PostGIS ST_Intersects and ST_GeomFromGeoJSON.
         */
        if (geoFilter) {
            where.push(sequelize.literal(`
                ST_Intersects(
                    geometry, 
                    ST_GeomFromGeoJSON('${JSON.stringify(geoFilter)}')
                )
            `));
        }

        /**
         * Bounding Box Filter:
         * Filters items based on a rectangular bounding box defined by coordinates.
         * BBOX must be in the format [minX, minY, maxX, maxY].
         */
        if (bbox) {
            let parsedBbox;

            // Parse bbox input: if it's a string, split and convert to numbers
            if (typeof bbox === 'string') {
                parsedBbox = bbox.split(',').map(Number);
            } else if (Array.isArray(bbox)) {
                parsedBbox = bbox.map(Number);
            }

            // Ensure bbox contains exactly 4 valid coordinates
            if (parsedBbox.length === 4) {
                const [minX, minY, maxX, maxY] = parsedBbox;

                // Use PostGIS ST_MakeEnvelope to create a rectangle and filter intersections
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

        /**
         * Datetime Filter:
         * Filters results based on a start and end datetime range.
         * Accepts ISO 8601 formatted strings in 'start/end' format.
         */
        if (datetime) {
            let start, end;

            // Parse datetime string: split by '/' into start and end
            if (typeof datetime === 'string' && datetime.includes('/')) {
                [start, end] = datetime.split('/');
            } else {
                throw new Error("Invalid datetime format. Use 'start/end'.");
            }

            // Validate the datetime strings
            if (!isNaN(Date.parse(start)) && !isNaN(Date.parse(end))) {
                // Add datetime conditions to the SQL WHERE clause
                where.push(sequelize.literal(`properties->>'start_datetime' <= '${end}'`));
                where.push(sequelize.literal(`properties->>'end_datetime' >= '${start}'`));
            } else {
                throw new Error("Invalid datetime values. Ensure they are ISO 8601-compliant.");
            }
        }

        /**
         * Collections Filter:
         * Filters results based on one or more collection IDs.
         * If 'collections' is provided, include it as a condition.
         */
        if (collections) {
            where.push({ 
                collection_id: { 
                    [Op.in]: Array.isArray(collections) ? collections : [collections] 
                } 
            });
        }

        console.log("Generated WHERE conditions:", where); // Debug log for SQL conditions

        /**
         * Execute the query:
         * Use Sequelize `findAll` to fetch filtered items from the database.
         * Combine all conditions with an AND operator to ensure they all apply.
         */
        const items = await Item.findAll({
            where: { [Op.and]: where },
            limit, // Limit the number of results returned
        });

        /**
         * Respond with STAC-compliant FeatureCollection:
         * Format the results as GeoJSON features with relevant properties, geometry, and links.
         */
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
                returned: items.length, // Number of items returned
                limit: limit // Limit applied
            }
        });
    } catch (error) {
        // Handle errors and send error response
        console.error("Error in /search route:", error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route GET /searchbar
 * @description Searches for collections and items based on a keyword search.
 * @param {string} keyword - The search keyword to match against collection titles, descriptions, item names, and descriptions.
 * @access Public
 */
router.get('/searchbar', async (req, res) => {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({ error: "Please provide a search keyword." });
    }

    try {
        const keywordFilter = {
            [Op.or]: [
                { title: { [Op.iLike]: `%${keyword}%` } }, // search for collections with matching titles
                { description: { [Op.iLike]: `%${keyword}%` } }, // search for collections with matching descriptions
            ],
        };

        // search for collections
        const collections = await Collection.findAll({
            where: keywordFilter,
            attributes: ['collection_id', 'title', 'description'],
        });

        // search for items
        const items = await Item.findAll({
            where: {
                [Op.or]: [
                    { 'properties.mlm:name': { [Op.iLike]: `%${keyword}%` } }, // search for items with matching names
                    { 'properties.description': { [Op.iLike]: `%${keyword}%` } }, // search for items with matching descriptions
                ],
            },
            attributes: ['item_id', 'properties', 'collection_id'],
        });

        res.json({
            collections: collections, // returns the collections
            items: items, // returns the items
        });
    } catch (error) {
        console.error('Error in searchbar route:', error);
        res.status(500).json({ error: "An error occurred while performing the search." });
    }
});


/**
 * @route POST /upload
 * @description Handles file uploads and processes STAC data into collections or items.
 * @access Public
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

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            const duplicateField = error.errors[0]?.path || 'unknown';
            const duplicateValue = error.errors[0]?.value || 'unknown';
            return res.status(400).json({
                error: `An entry with the ${duplicateField} "${duplicateValue}" already exists. Please use a different ID or update the existing entry.`,
            });
        }
        
    
        // Handle other errors
        res.status(500).json({ error: 'An unexpected error occurred while saving data.' });
    } finally {
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
    }
});

module.exports = router;