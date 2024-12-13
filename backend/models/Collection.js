const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");
const User = require('./User'); // Import the User model

/**
 * @module Collection
 * 
 * This model represents a STAC (SpatioTemporal Asset Catalog) Collection, 
 * which is a grouping of related geospatial data assets. The Collection 
 * model adheres to the STAC specification and includes detailed metadata 
 * about the collection, such as spatial and temporal extents, licensing, 
 * providers, and related links. It also defines relationships to associated 
 * assets stored in the `Asset` model.
 * 
 * @typedef {Object} Collection
 * @property {string} type - REQUIRED. Must be set to "Collection" to validate as a STAC Collection.
 * @property {string} stac_version - REQUIRED. The STAC version this Collection implements.
 * @property {string[]} [stac_extensions] - A list of extension identifiers the Collection implements.
 * @property {string} collection_id - REQUIRED. Unique identifier for the Collection.
 * @property {string} [title] - A short descriptive one-line title for the Collection.
 * @property {string} description - REQUIRED. A detailed description of the Collection.
 * @property {string[]} [keywords] - A list of keywords describing the Collection.
 * @property {string} license - REQUIRED. License(s) of the data as an SPDX License identifier or "other".
 * @property {Object[]} [providers] - A list of organizations capturing, processing, or hosting the data.
 * @property {Object} extent - REQUIRED. The spatial and temporal extents of the Collection.
 * @property {Object} [summaries] - Optional. Summaries of properties, such as ranges or JSON Schemas.
 * @property {Object[]} links - REQUIRED. A list of references to related documents.
 * @property {Object} [item_assets] - Optional. A dictionary describing assets available in member Items.
 * @property {Asset[]} assets - Related assets, linked via the `Asset` model.
 * @property {number|null} [user_id] - Optional. References the user ID of the creator or owner of the Collection.
 * @property {string} [user_description] - Optional. A user-provided description of the Collection.
 * 
 * @see https://github.com/radiantearth/stac-spec/blob/master/collection-spec/collection-spec.md#item-asset-definition-object
 */
const Collection = sequelize.define('Collection', {
    /**
     * 	REQUIRED. Must be set to Collection to be a valid Collection.
     */
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Collection']], 
        },
    },
    /**
     * 	REQUIRED. The STAC version the Collection implements.
     */
    stac_version: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    /**
     * 	A list of extension identifiers the Collection implements.
     */
    stac_extensions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
    /**
     * REQUIRED. Identifier for the Collection that is unique across all collections in the root catalog.
     */
    collection_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },
    /**
     * A short descriptive one-line title for the Collection.
     */
    title: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    /**
     * REQUIRED. Detailed multi-line description to fully explain the Collection. 
     * CommonMark 0.29 syntax MAY be used for rich text representation.
     */
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    /**
     * 	List of keywords describing the Collection.
     */
    keywords: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
    /**
     * REQUIRED License(s) of the data collection as SPDX License identifier, 
     * SPDX License expression, or other (see below).
     */
    license: {
        type: DataTypes.STRING(255),
        allowNull: false,
        /*validate: {
            isValidSPDX(value) {
                // list of valid licenses
                const validSPDXLicenses = [
                    "CC-BY-4.0", "CC-BY-SA-4.0", "MIT", "Apache-2.0", "GPL-3.0-or-later",
                    "BSD-3-Clause", "CC0-1.0", "EUPL-1.2", "other"
                ];
    
                if (!validSPDXLicenses.includes(value) && value !== "other") {
                    throw new Error(
                        `'license' must be a valid SPDX License identifier or 'other'. See https://spdx.org/licenses/`
                    );
                }
            },
            warnIfOther(value) {
                if (value === "other") {
                    console.warn(
                        "The 'license' is set to 'other'. Consider adding a link to the license text or description."
                    );
                }
            }
        }*/
    },
    /**
     * 	A list of providers, which may include all organizations capturing or processing the data or the hosting provider.
     */
    providers: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
            isValidProviders(value) {
                if (value !== null) {
                    if (!Array.isArray(value)) {
                        throw new Error("'providers' must be an array of provider objects.");
                    }
    
                    value.forEach(provider => {
                        // Name is required
                        if (!provider.name || typeof provider.name !== 'string' || provider.name.trim() === '') {
                            throw new Error("'providers.name' is required and must be a non-empty string.");
                        }
    
                        // Description is optional but must be a string if provided
                        if (provider.description && typeof provider.description !== 'string') {
                            throw new Error("'providers.description' must be a string if provided.");
                        }
    
                        // Roles must be an array of predefined values
                        if (provider.roles) {
                            if (!Array.isArray(provider.roles)) {
                                throw new Error("'providers.roles' must be an array.");
                            }
    
                            /*const validRoles = ['licensor', 'producer', 'processor', 'host'];
                            provider.roles.forEach(role => {
                                if (!validRoles.includes(role)) {
                                    throw new Error(`Invalid role '${role}' in 'providers.roles'. Valid roles are: ${validRoles.join(', ')}`);
                                }
                            });
    
                            // Ensure there is only one host role, and it's the last in the list
                            if (provider.roles.filter(role => role === 'host').length > 1) {
                                throw new Error("'providers.roles' must not contain more than one 'host' role.");
                            }
                            if (provider.roles.includes('host') && provider.roles[provider.roles.length - 1] !== 'host') {
                                throw new Error("'host' role must be the last element in 'providers.roles'.");
                            }*/
                        }
    
                        // URL is optional but must be a valid URL if provided
                        if (provider.url && typeof provider.url !== 'string') {
                            throw new Error("'providers.url' must be a string if provided.");
                        }
                        if (provider.url && !/^(https?:\/\/)/.test(provider.url)) {
                            throw new Error("'providers.url' must be a valid URL starting with http:// or https://.");
                        }
                    });
                }
            }
        }
    },
    /**
     * 	REQUIRED. Spatial and temporal extents.
     */
    extent: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
            isValidExtent(value) {
                if (!value || typeof value !== 'object') {
                    throw new Error("'extent' must be a valid object containing 'spatial' and 'temporal'.");
                }
    
                // **Validation for 'spatial.bbox'**
                if (!value.spatial || !Array.isArray(value.spatial.bbox)) {
                    throw new Error("'spatial.bbox' is required and must be an array.");
                }
    
                value.spatial.bbox.forEach((bbox, index) => {
                    // Calculate the number of dimensions (2D or 3D)
                    const dimensions = bbox.length / 2;
                    if (!Number.isInteger(dimensions) || (dimensions !== 2 && dimensions !== 3)) {
                        throw new Error(`Bounding box at index ${index} must describe 2D or 3D extents.`);
                    }
    
                    const [minLon, minLat, ...rest] = bbox;
                    const maxLon = rest[rest.length - 2];
                    const maxLat = rest[rest.length - 1];
    
                    // Ensure longitude and latitude values are within valid WGS 84 bounds
                    if (minLon < -180 || maxLon > 180 || minLat < -90 || maxLat > 90) {
                        throw new Error(
                            `Bounding box at index ${index} contains invalid WGS 84 coordinates.`
                        );
                    }
    
                    // Validate elevation for 3D bounding boxes
                    if (dimensions === 3) {
                        const minElevation = rest[0];
                        const maxElevation = rest[1];
                        if (minElevation >= maxElevation) {
                            throw new Error(
                                `Bounding box at index ${index} has invalid elevation extents (min >= max).`
                            );
                        }
                    }
                });
    
                // **Validation for 'temporal.interval'**
                if (!value.temporal || !Array.isArray(value.temporal.interval)) {
                    throw new Error("'temporal.interval' is required and must be an array.");
                }
    
                value.temporal.interval.forEach((interval, index) => {
                    // Ensure each interval is an array of exactly two elements (start and end)
                    if (!Array.isArray(interval) || interval.length !== 2) {
                        throw new Error(
                            `Interval at index ${index} must be an array of two elements (start, end).`
                        );
                    }
    
                    const [start, end] = interval;
    
                    // Validate that timestamps are null or conform to RFC 3339 format
                    const isValidTimestamp = (ts) =>
                        ts === null || /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/.test(ts);
    
                    if (!isValidTimestamp(start)) {
                        throw new Error(
                            `Start time at index ${index} must be null or a valid RFC 3339 timestamp.`
                        );
                    }
                    if (!isValidTimestamp(end)) {
                        throw new Error(
                            `End time at index ${index} must be null or a valid RFC 3339 timestamp.`
                        );
                    }
    
                    // Ensure start time is less than or equal to end time if both are provided
                    if (start && end && new Date(start) > new Date(end)) {
                        throw new Error(
                            `Start time must be less than or equal to end time at index ${index}.`
                        );
                    }
                });
            },
        },
    }, 
    /**
     * STRONGLY RECOMMENDED. 
     * A map of property summaries, either a set of values, a range of values, or a JSON Schema.
     */
    summaries: {
        type: DataTypes.JSONB,
        allowNull: true, 
        validate: {
            isValidSummary(value) {
                if (value === null) return; // Allow null as summaries are optional

                if (typeof value !== 'object' || Array.isArray(value)) {
                    throw new Error("'summaries' must be an object if provided.");
                }

                // Validate each summary property
                Object.keys(value).forEach((key) => {
                    const summary = value[key];

                    // Validate Range Object
                    if (summary.minimum !== undefined && summary.maximum !== undefined) {
                        if (
                            (typeof summary.minimum !== 'number' && typeof summary.minimum !== 'string') ||
                            (typeof summary.maximum !== 'number' && typeof summary.maximum !== 'string')
                        ) {
                            throw new Error(
                                `'summaries.${key}' range must have 'minimum' and 'maximum' as numbers or strings.`
                            );
                        }
                        if (summary.minimum > summary.maximum) {
                            throw new Error(
                                `'summaries.${key}' range has 'minimum' greater than 'maximum'.`
                            );
                        }
                    }

                    // Validate JSON Schema Object
                    if (summary.$schema || summary.type) {
                        if (typeof summary !== 'object') {
                            throw new Error(
                                `'summaries.${key}' must be a valid JSON Schema object if a schema is provided.`
                            );
                        }
                        if (!summary.$schema) {
                            throw new Error(
                                `'summaries.${key}' JSON Schema must include the '$schema' keyword.`
                            );
                        }
                        if (summary.$schema !== 'http://json-schema.org/draft-07/schema#') {
                            console.warn(
                                `Warning: 'summaries.${key}' uses a non-standard JSON Schema version '${summary.$schema}'. Draft-07 is recommended.`
                            );
                        }
                    }
                });
            },      
        },  
    },
    /**
     * REQUIRED. A list of references to other documents.
     */
    links: {
        type: DataTypes.JSONB,
        allowNull: false, 
        validate: {
            isValidLinks(value) {
                if (!Array.isArray(value)) {
                    throw new Error("'links' must be an array of Link Objects.");
                }

                value.forEach((link, index) => {
                    if (typeof link !== 'object' || Array.isArray(link)) {
                        throw new Error(`Link at index ${index} must be a valid object.`);
                    }

                    // Validate 'href' (REQUIRED)
                    if (!link.href || typeof link.href !== 'string' || link.href.trim() === '') {
                        throw new Error(`'href' is required and must be a non-empty string in link at index ${index}.`);
                    }

                    // Validate 'rel' (REQUIRED)
                    if (!link.rel || typeof link.rel !== 'string' || link.rel.trim() === '') {
                        throw new Error(`'rel' is required and must be a non-empty string in link at index ${index}.`);
                    }

                    // Validate 'type' (OPTIONAL)
                    if (link.type && typeof link.type !== 'string') {
                        throw new Error(`'type', if provided, must be a string in link at index ${index}.`);
                    }

                    // Validate 'title' (OPTIONAL)
                    if (link.title && typeof link.title !== 'string') {
                        throw new Error(`'title', if provided, must be a string in link at index ${index}.`);
                    }

                    // Validate 'method' (OPTIONAL)
                    if (link.method) {
                        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
                        if (!validMethods.includes(link.method.toUpperCase())) {
                            throw new Error(
                                `'method', if provided, must be one of [${validMethods.join(
                                    ', '
                                )}] in link at index ${index}.`
                            );
                        }
                    }

                    // Validate 'headers' (OPTIONAL)
                    if (link.headers) {
                        if (typeof link.headers !== 'object' || Array.isArray(link.headers)) {
                            throw new Error(`'headers', if provided, must be an object in link at index ${index}.`);
                        }
                        Object.keys(link.headers).forEach((headerKey) => {
                            const headerValue = link.headers[headerKey];
                            if (
                                typeof headerValue !== 'string' &&
                                !Array.isArray(headerValue)
                            ) {
                                throw new Error(
                                    `Each header value in 'headers' must be a string or an array of strings in link at index ${index}.`
                                );
                            }
                        });
                    }

                    // Validate 'body' (OPTIONAL)
                    if (link.body && typeof link.body !== 'object') {
                        throw new Error(`'body', if provided, must be an object in link at index ${index}.`);
                    }
                });
            },
        },
    },
    /**
     * Dictionary of asset objects that can be downloaded, each with a unique key.
     */
    // assets directly imported from Assets table

    /**
     * A dictionary of assets that can be found in member Items.
     */
    item_assets: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
            isValidItemAssets(value) {
              if (!value || typeof value !== 'object') {
                throw new Error("'item_assets' must be a dictionary of Item Asset Definition objects.");
              }
      
              Object.entries(value).forEach(([key, asset], index) => {
                // Validate key
                if (typeof key !== 'string' || key.trim() === '') {
                  throw new Error(`Item Asset key at index ${index} must be a non-empty string.`);
                }
      
                // Validate asset object
                if (!asset || typeof asset !== 'object') {
                  throw new Error(`Item Asset at key '${key}' must be a valid object.`);
                }
      
                // Validate required fields
                const requiredFields = ['title', 'type'];
                const hasRequiredFields = requiredFields.some(field => field in asset);
                if (!hasRequiredFields) {
                  throw new Error(`Item Asset at key '${key}' must include at least one of the fields: ${requiredFields.join(', ')}`);
                }
      
                // Validate 'title'
                if (asset.title && typeof asset.title !== 'string') {
                  throw new Error(`'title' in Item Asset at key '${key}' must be a string.`);
                }
      
                // Validate 'description'
                if (asset.description && typeof asset.description !== 'string') {
                  throw new Error(`'description' in Item Asset at key '${key}' must be a string.`);
                }
      
                // Validate 'type'
                if (asset.type && typeof asset.type !== 'string') {
                  throw new Error(`'type' in Item Asset at key '${key}' must be a string.`);
                }
      
                // Validate 'roles'
                if (asset.roles && !Array.isArray(asset.roles)) {
                  throw new Error(`'roles' in Item Asset at key '${key}' must be an array of strings.`);
                }
      
                if (Array.isArray(asset.roles)) {
                  asset.roles.forEach((role, roleIndex) => {
                    if (typeof role !== 'string') {
                      throw new Error(`Role at index ${roleIndex} in Item Asset at key '${key}' must be a string.`);
                    }
                  });
                }
              });
            },
          },
        },
    /**
     * References the user who created or owns the collection.
     */
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },

    /**
 * The description the user can provide manually on the website.
 */
user_description: {
    type:DataTypes.STRING,
    allowNull:true,
  
  }
}, {
    tableName: 'collection',
    timestamps: false, 
});


module.exports = Collection;