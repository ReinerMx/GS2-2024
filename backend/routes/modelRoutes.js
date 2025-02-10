// Import required modules
const express = require('express');
const fs = require('fs');
const sequelize = require('../config/db');
const { User, MlmModel, Asset, Collection, Item } = require('../models');
const { Op } = require("sequelize"); // Sequelize operators for database queries
const upload = require('../middleware/uploadMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');


// Initialize the router
const router = express.Router();

/* ******** STAC CORE API ******** */

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
        // Fetch all collections, including the uploader's username
        const collections = await Collection.findAll({
            include: [
                {
                    model: User,
                    as: 'uploader', // Must match the alias defined in the Sequelize association
                    attributes: ['username'], // Select only relevant fields
                },
            ],
        });

        // Format the collections to include uploader information
        const formattedCollections = collections.map(collection => ({
            ...collection.toJSON(),
            uploader: collection.uploader?.username || "Unknown", // Use the username or default to "Unknown"
        }));

        // Send the formatted collections as a JSON response
        res.json({ collections: formattedCollections });
    } catch (error) {
        // Log the error and send a 500 response
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
            return res.json({ items: [] }); // return empty array
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
      // Fetch the item along with its parent collection, uploader, mlm_model, and assets
      const item = await Item.findOne({
        where: { collection_id, item_id },
        include: [
          {
            model: Collection,
            as: 'parentCollection',
            include: [
              {
                model: User,
                as: 'uploader', // Ensure this matches your Sequelize alias
                attributes: ['username'], // Fetch only the username
              },
            ],
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
  
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
  
      const response = {
        ...item.dataValues,
        parentCollection: item.parentCollection, // Include parent collection
        uploader: item.parentCollection?.uploader?.username || "Unknown", // Extract uploader username
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
    // Determine if the request is POST or GET and extract parameters accordingly
    const isPost = req.method === 'POST';
    const params = isPost ? req.body : req.query;
    const { bbox, datetime, collections, limit = 10, geoFilter, tasks, frameworks, architectures } = params;

    console.log("Received filters from frontend:", JSON.stringify(params, null, 2));

    try {
        // Initialize query conditions and additional attributes for selection
        const where = [];
        const attributes = {
            include: []
        };

        // Apply geographic filter if provided
        if (geoFilter) {
            const geoJSON = sequelize.escape(JSON.stringify(geoFilter));
            where.push(sequelize.literal(`
                ST_Intersects(
                    geometry, 
                    ST_GeomFromGeoJSON(${geoJSON})
                )
            `));
            attributes.include.push([
                sequelize.literal(`
                    CASE 
                        WHEN ST_IsEmpty(geometry) OR ST_IsEmpty(ST_GeomFromGeoJSON(${geoJSON})) THEN 0
                        ELSE ST_Area(ST_Intersection(geometry, ST_GeomFromGeoJSON(${geoJSON}))) / ST_Area(ST_GeomFromGeoJSON(${geoJSON})) * 100
                    END
                `), 'overlap_percentage'
            ]);
        }

        // Apply bounding box filter if provided
        if (bbox) {
            const [minX, minY, maxX, maxY] = typeof bbox === 'string'
                ? bbox.split(',').map(Number)
                : bbox;
            where.push(sequelize.literal(`
                ST_Intersects(
                    geometry, 
                    ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, 4326)
                )
            `));
        }

        // Apply temporal coverage filter if provided
        if (datetime) {
            const [start, end] = datetime.split('/');
            if (!isNaN(Date.parse(start)) && !isNaN(Date.parse(end))) {
                where.push(sequelize.literal(`properties->>'start_datetime' <= '${end}'`));
                where.push(sequelize.literal(`properties->>'end_datetime' >= '${start}'`));
            } else {
                throw new Error("Invalid datetime values.");
            }
        }

        // Apply task filter if provided
        if (tasks && tasks.length > 0) {
            where.push(sequelize.literal(`properties->>'mlm:tasks' ILIKE ANY (ARRAY[${tasks.map(t => `'${t}'`).join(",")}])`));
        }

        // Apply framework filter if provided
        if (frameworks && frameworks.length > 0) {
            where.push({
                "properties.mlm:framework": {
                    [Op.in]: frameworks
                }
            });
        }

        // Apply architecture filter if provided
        if (architectures && architectures.length > 0) {
            where.push({
                "properties.mlm:architecture": {
                    [Op.in]: architectures
                }
            });
        }

        // Apply collection filter if provided
        if (collections) {
            where.push({ collection_id: { [Op.in]: Array.isArray(collections) ? collections : [collections] } });
        }

        // Fetch items from the database based on the specified filters
        const items = await Item.findAll({ attributes, where: { [Op.and]: where }, limit });

        // Construct a STAC-compliant FeatureCollection as the response
        const response = {
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
                properties: {
                    ...item.properties,
                    overlap_percentage: item.dataValues.overlap_percentage
                    ? parseFloat(item.dataValues.overlap_percentage).toFixed(2)
                    : null // Add overlap percentage if calculated
                },
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
            links: [{ rel: "self", href: `http://localhost:5555/search`, type: "application/json" }],
            context: { returned: items.length, limit } // Add context with returned count and limit
        };

        console.log("Response JSON:", JSON.stringify(response, null, 2));
        res.json(response); // Send the response to the client
    } catch (error) {
        console.error("Error in /search route:", error);
        res.status(400).json({ error: error.message }); // Handle and log any errors
    }
});

/* ******** CUSTOM API ENDPOINTS ******** */

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
        // Filter for collections
        const collectionFilter = {
            [Op.or]: [
                { title: { [Op.iLike]: `%${keyword}%` } },
                { description: { [Op.iLike]: `%${keyword}%` } },
                sequelize.literal(`ARRAY_TO_STRING("keywords", ' ') ILIKE '%${keyword}%'`),
            ],
        };

        // Search in collections
        const collections = await Collection.findAll({
            where: collectionFilter,
            attributes: ['collection_id', 'title', 'description', 'keywords'],
        });

        // Filter for items
        const itemFilter = {
            [Op.or]: [
                { 'properties.mlm:name': { [Op.iLike]: `%${keyword}%` } },
                { 'properties.description': { [Op.iLike]: `%${keyword}%` } },
                { 'properties.mlm:tasks': { [Op.iLike]: `%${keyword}%` } },
                { 'properties.mlm:framework': { [Op.iLike]: `%${keyword}%` } },
                { 'properties.mlm:architecture': { [Op.iLike]: `%${keyword}%` } },
            ],
        };

        // Search in items
        const items = await Item.findAll({
            where: itemFilter,
            attributes: ['item_id', 'properties', 'collection_id'],
        });

        // Map suggestions
        const suggestions = [
            ...collections.map(c => ({
                type: 'collection',
                id: c.collection_id,
                title: c.title,
                keywords: c.keywords,
            })),
            ...items.map(i => ({
                type: 'item',
                id: i.item_id,
                title: i.properties?.['mlm:name'] || 'No Name',
                tasks: i.properties?.['mlm:tasks'] || [],
                architecture: i.properties?.['mlm:architecture'] || 'Unknown',
                framework: i.properties?.['mlm:framework'] || 'Unknown',
            })),
        ];

        console.log('Suggestions:', suggestions); // Debug suggestions
        res.json({ collections, items, suggestions });
    } catch (error) {
        console.error('Error in /searchbar route:', error);
        res.status(500).json({ error: "An error occurred while performing the search." });
    }
});


/**
 * @route GET /filters
 * @description Fetches distinct values for tasks, frameworks, architectures, and keywords for filtering.
 * @access Public
 * @returns {Object} - An object containing arrays of distinct values for tasks, frameworks, architectures, and keywords.
 */
router.get('/filters', async (req, res) => {
    try {
        const rawTasks = await Item.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.json('properties.mlm:tasks')), 'task']],
            where: sequelize.where(sequelize.json('properties.mlm:tasks'), { [Op.ne]: null }),
        });

        // Flatten, deduplicate, and clean up tasks
        const tasks = [
            ...new Set(rawTasks.flatMap(row => {
                const taskArray = JSON.parse(row.dataValues.task) || [];
                return Array.isArray(taskArray) ? taskArray : [taskArray];
            })),
        ].filter(Boolean); // Remove null or undefined tasks

        // Fetch other categories as before
        const frameworks = await Item.findAll({
            attributes: [
                [sequelize.literal("DISTINCT properties->>'mlm:framework'"), 'framework'],
            ],
            where: sequelize.literal("properties->>'mlm:framework' IS NOT NULL"),
            raw: true,
        });

        const architectures = await Item.findAll({
            attributes: [
                [sequelize.literal("DISTINCT properties->>'mlm:architecture'"), 'architecture'],
            ],
            where: sequelize.literal("properties->>'mlm:architecture' IS NOT NULL"),
            raw: true,
        });

        const keywords = await Collection.findAll({
            attributes: [
                [sequelize.literal('DISTINCT UNNEST(keywords)'), 'keyword'],
            ],
            where: sequelize.literal("keywords IS NOT NULL"),
            raw: true,
        });

        // Fetch distinct data types (e.g., Sentinel-2, Landsat)
        const rawDataTypes = await Item.findAll({
            attributes: [[sequelize.literal("properties->>'mlm:input'"), 'data_type']],
            where: sequelize.literal("properties->>'mlm:input' IS NOT NULL"),
            raw: true,
        });

        const dataTypes = [
            ...new Set(
                rawDataTypes.flatMap(row => {
                    try {
                        const inputs = JSON.parse(row.data_type);
                        return inputs.map(input => input.name.match(/(Sentinel-\d+|Landsat|EO Data)/)?.[0] || null);
                    } catch {
                        return [];
                    }
                })
            ),
        ].filter(Boolean); // Remove null or undefined entries

        // Return results as arrays
        res.json({
            tasks,
            frameworks: frameworks.map(row => row.framework).filter(Boolean),
            architectures: architectures.map(row => row.architecture).filter(Boolean),
            keywords: keywords.map(row => row.keyword).filter(Boolean),
            dataTypes,
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ error: 'Error fetching filters' });
    }
});

/**
 * @route POST /upload
 * @description Handles file uploads and processes STAC data into collections or items.
 * @access Public
 */
router.post('/upload', authMiddleware, upload.single('modelFile'), async (req, res) => {
    const { userDescription } = req.body;

    try {
        // make sure a user is logged in
        
        if (!req.user || !req.user.userId) {
            console.error("Unauthorized access attempt detected.");
            return res.status(401).json({ message: 'Access denied. Please log in.' });
        }
    
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            console.error(`User with ID ${req.user.userId} not found.`);
            return res.status(404).json({ message: 'User not found.' });
        }
        console.log("Uploading collection for user ID:", req.user.userId);
        
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
                    user_id: req.user.userId,
                };

                const newCollection = await Collection.create(collectionData, { transaction });

                // add collection to `saved_collections` in user table
                const updatedCollections = [...(user.saved_collections || []), newCollection.collection_id];
                user.saved_collections = updatedCollections;
                await user.save({ transaction }); // save to database
            
                res.status(200).json({ message: 'Collection uploaded successfully!', newCollection });
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

                // Ensure the collection belongs to the logged-in user
                if (collection.user_id !== req.user.userId) {
                    return res.status(403).json({ error: "You do not have permission to upload items to this collection." });
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

        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
            return res.status(400).json({
                error: 'Invalid JSON format. Please check for missing commas, braces, or brackets.',
                details: error.message,
            });
        }

        // Handle validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map((err) => `${err.path}: ${err.message}`);
            return res.status(400).json({
                error: "Validation Error",
                details: validationErrors 
            });
        }

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            const duplicateField = error.errors[0]?.path || 'unknown';
            const duplicateValue = error.errors[0]?.value || 'unknown';
            return res.status(400).json({
                error: `An entry with the ${duplicateField} "${duplicateValue}" already exists. Please use a different ID or update the existing entry.`,
            });
        }

        // Handle custom validation hooks
        if (error.message.includes('bbox')) {
            return res.status(400).json({
                error: "Validation Error",
                details: [error.message],
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