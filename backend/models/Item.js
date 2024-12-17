const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Collection = require('./Collection');


console.log('Sequelize instance:', sequelize);
console.log('Available sequelize methods:', Object.keys(sequelize));

/**
 * Represents a STAC (SpatioTemporal Asset Catalog) Item.
 * A STAC Item is a GeoJSON Feature that links metadata about a spatio-temporal asset
 * with the asset's actual location and other related resources.
 * 
 * @typedef {Object} Item
 * @property {string} type - REQUIRED. The GeoJSON Object type. Must be set to "Feature".
 * @property {string} stac_version - REQUIRED. The STAC version this Item implements.
 * @property {string[]} [stac_extensions] - A list of extensions the Item implements.
 * @property {string} item_id - REQUIRED. Unique identifier for the Item within the Collection.
 * @property {Object|null} geometry - REQUIRED if `bbox` is provided; must follow GeoJSON specifications.
 * @property {number[]|null} bbox - REQUIRED if `geometry` is provided; the bounding box formatted as per RFC 7946.
 * @property {Object} properties - REQUIRED. A dictionary of additional metadata, including the required `datetime` field.
 * @property {string|null} properties.datetime - REQUIRED. The main timestamp in UTC, formatted according to RFC 3339.
 * @property {string|null} properties.start_datetime - OPTIONAL. Start of a temporal range, required if `datetime` is null.
 * @property {string|null} properties.end_datetime - OPTIONAL. End of a temporal range, required if `datetime` is null.
 * @property {Object[]} links - REQUIRED. List of link objects connecting to related resources.
 * @property {string} links[].href - REQUIRED. The URL of the linked resource.
 * @property {string} links[].rel - REQUIRED. The relationship type (e.g., "self", "collection").
 * @property {string} [links[].type] - OPTIONAL. The media type of the linked resource.
 * @property {string} [links[].title] - OPTIONAL. A human-readable title for the link.
 * @property {string|null} collection - The ID of the Collection this Item belongs to, if applicable.
 * @property {text|null} user_description - The user-provided description of the Item.
 * 
 * @see https://github.com/radiantearth/stac-spec/blob/master/item-spec/item-spec.md#links
 */
const Item = sequelize.define('Item', {
  /**
   * 	REQUIRED. Type of the GeoJSON Object. MUST be set to Feature
   */
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIn: [['Feature']] },
  },
  /**
   * REQUIRED. The STAC version the Item implements.
   */
  stac_version: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * 	A list of extensions the Item implements.
   */
  stac_extensions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  /**
   * REQUIRED. Provider identifier. The ID should be unique within the Collection that contains the Item.
   */
  item_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    validate: {
        notNull: { msg: 'Item ID cannot be null' },
    }
  },
  /**
   * REQUIRED. Defines the full footprint of the asset represented by this item, 
   * formatted according to RFC 7946, section 3.1 if a geometry is provided 
   * or section 3.2 if no geometry is provided.
   * https://datatracker.ietf.org/doc/html/rfc7946#section-3.1
   * https://datatracker.ietf.org/doc/html/rfc7946#section-3.2
   */ 

  geometry: {
    type: DataTypes.GEOMETRY('GEOMETRY', 4326), // GEOMETRY-Type with SRID 4326
    allowNull: true, 
    validate: {
      isValidGeometry(value) {
        if (value === null) return; 
  
        if (typeof value !== 'object') {
          throw new Error("'geometry' must be a valid GeoJSON object.");
        }
  
        const validTypes = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'];
        if (!value.type || !validTypes.includes(value.type)) {
          throw new Error(`Invalid 'geometry.type'. Must be one of ${validTypes.join(', ')}.`);
        }
      },
    },
  },
  /**
   * REQUIRED if geometry is not null, prohibited if geometry is null. 
   * Bounding Box of the asset represented by this Item, formatted according to RFC 7946, section 5.
   * https://datatracker.ietf.org/doc/html/rfc7946#section-5
   */
  bbox: {
    type: DataTypes.ARRAY(DataTypes.FLOAT),
    allowNull: true, // Optional but has conditional requirements
    validate: {
      isValidBBox(value) {
        if (value === null) return; // Allow null when no bbox is provided

        // Check that the array has the correct number of elements
        if (!Array.isArray(value) || (value.length !== 4 && value.length !== 6)) {
          throw new Error(
            "'bbox' must be an array with exactly 4 or 6 numeric elements."
          );
        }

        // Validate individual elements are numbers
        value.forEach((coord, index) => {
          if (typeof coord !== 'number') {
            throw new Error(`Element at index ${index} in 'bbox' must be a number.`);
          }
        });

        // Validate the order of the bounding box (min <= max)
        const [minLon, minLat, ...rest] = value;
        const maxLon = rest[rest.length - 2];
        const maxLat = rest[rest.length - 1];

        if (minLon > maxLon) {
          throw new Error("'bbox' has invalid longitude range: minLon > maxLon.");
        }
        if (minLat > maxLat) {
          throw new Error("'bbox' has invalid latitude range: minLat > maxLat.");
        }

        // Validate elevation range for 3D bounding boxes
        if (value.length === 6) {
          const minElevation = rest[0];
          const maxElevation = rest[1];
          if (minElevation > maxElevation) {
            throw new Error("'bbox' has invalid elevation range: minElevation > maxElevation.");
          }
        }
      },
    },
  },
  /**
   * REQUIRED. A dictionary of additional metadata for the Item.
   * Must include a valid 'datetime' field formatted as per RFC 3339 or be null.
   */
  properties: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidProperties(value) {
        if (!value || typeof value !== 'object') {
          throw new Error("'properties' must be a non-empty JSON object.");
        }
  
        // Prüfen, ob 'datetime' vorhanden ist, sonst setzen
        if (!value.hasOwnProperty('datetime')) {
          console.warn("'properties' is missing 'datetime'. Setting it to null.");
          value.datetime = null;
        }
  
        const datetime = value.datetime;
  
        // Prüfen, ob 'datetime' null oder ein gültiges RFC 3339-Format ist
        const rfc3339Regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?Z$/;
        const isValidTimestamp = (ts) =>
          ts === null || rfc3339Regex.test(ts);
  
        if (!isValidTimestamp(datetime)) {
          console.warn(`'properties.datetime' is invalid. Setting it to null. Received: ${datetime}`);
          value.datetime = null;
        }
  
        // Falls 'datetime' null ist, sicherstellen, dass 'start_datetime' und 'end_datetime' korrekt sind
        if (datetime === null) {
          if (!value.start_datetime || !value.end_datetime) {
            console.warn(
              "'properties.start_datetime' or 'properties.end_datetime' is missing. Setting them to null."
            );
            value.start_datetime = null;
            value.end_datetime = null;
          }
  
          // Prüfen und korrigieren von 'start_datetime' und 'end_datetime'
          if (!isValidTimestamp(value.start_datetime)) {
            console.warn(
              `'properties.start_datetime' is invalid. Setting it to null. Received: ${value.start_datetime}`
            );
            value.start_datetime = null;
          }
  
          if (!isValidTimestamp(value.end_datetime)) {
            console.warn(
              `'properties.end_datetime' is invalid. Setting it to null. Received: ${value.end_datetime}`
            );
            value.end_datetime = null;
          }
  
          // Validierung der Reihenfolge
          if (
            value.start_datetime &&
            value.end_datetime &&
            new Date(value.start_datetime) > new Date(value.end_datetime)
          ) {
            throw new Error(
              "'properties.start_datetime' must be less than or equal to 'properties.end_datetime'."
            );
          }
        }
      },
    },
  },
  
  /**
   * REQUIRED. List of link objects to resources and related URLs.
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
                `'method', if provided, must be one of [${validMethods.join(', ')}] in link at index ${index}.`
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
              if (typeof headerValue !== 'string' && !Array.isArray(headerValue)) {
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
 * REQUIRED. Dictionary of asset objects that can be downloaded, each with a unique key.
 */
// assets directly imported from Assets table

/**
 * The id of the STAC Collection this Item references. 
 * This field is required if a link with a "collection" relation type is present; otherwise, it must be null.
 */
collection_id: {
  type: DataTypes.STRING,
  references: {
    model: Collection,
    key: 'collection_id',
  },
  onDelete: 'CASCADE',
},

/**
 * The description the user can provide manually on the website.
 */
user_description: {
  type:DataTypes.TEXT,
  allowNull:true,

},

}, {
  tableName: 'item',
  timestamps: false,
});


// Add a hook
Item.addHook('beforeValidate', (item) => {
  if (item.geometry === null && item.bbox !== null) {
    throw new Error("'bbox' is prohibited when 'geometry' is null.");
  }
  if (item.geometry !== null && item.bbox === null) {
    throw new Error("'bbox' is required when 'geometry' is not null.");
  }
});


console.log('Sequelize instance:', sequelize);
console.log('Available sequelize methods:', Object.keys(sequelize));


module.exports = Item;
