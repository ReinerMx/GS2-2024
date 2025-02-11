const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");
const Item = require('./Item');


/**
 * @module Asset
 * 
 * The `Asset` model represents data or resources associated with STAC Items, Models, or Collections. 
 * An Asset is a key component of the STAC specification, providing metadata and access information 
 * for downloadable or streamable data.
 * 
 * @typedef {Object} Asset
 * @property {integer} id - Primary key for the Asset, auto-incremented.
 * @property {string} href - REQUIRED. URI to the asset object. Supports both relative and absolute URIs.
 * @property {string} [title] - A user-friendly title for the asset.
 * @property {string} [description] - Additional details about the asset, such as processing information.
 * @property {string} [type] - Media type of the asset. Validated against common STAC media types.
 * @property {string[]} [roles] - Semantic roles of the asset (e.g., "thumbnail", "overview").
 * @property {integer} [item_id] - Foreign key reference to the `Item` model.
 * @property {integer} [model_id] - Foreign key reference to the `MlmModel` model.
 * @property {string} [collection_id] - Foreign key reference to the `Collection` model.
 * 
 * @see https://github.com/radiantearth/stac-spec/blob/master/commons/assets.md
 */
const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  /**
   * REQUIRED. URI to the asset object. 
   * Relative and absolute URI are both allowed. 
   * Trailing slashes are significant.
   */
  href: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isCustomUrl(value) {
        // Allow s3:// and standard HTTP(S) URLs
        const regex = /^(s3:\/\/|https?:\/\/).+/;
        if (!regex.test(value)) {
          throw new Error(
            "'href' must be a valid URL starting with 'http://', 'https://', or 's3://'."
          );
        }
      },
    },
  },
  /**
   * 	The displayed title for clients and users.
   */
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  /**
   * A description of the Asset providing additional details, 
   * such as how it was processed or created. 
   * CommonMark 0.29 syntax MAY be used for rich text representation.
   */
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  /**
   * Media type of the asset. 
   * See the common media types in the best practice doc for commonly used asset types.
   */
  type: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isCommonMediaType(value) {
        if (value === null) return; // Allow null values as it's optional
        
        const commonMediaTypes = [
          'image/tiff; application=geotiff',
          'image/tiff; application=geotiff; profile=cloud-optimized',
          'image/jp2',
          'image/png',
          'image/jpeg',
          'text/xml',
          'application/xml',
          'application/json',
          'text/plain',
          'application/geo+json',
          'application/geopackage+sqlite3',
          'application/x-hdf5',
          'application/x-hdf',
          'application/vnd.laszip+copc',
          'application/vnd.apache.parquet',
          'application/3dtiles+json',
          'application/vnd.pmtiles',
        ];
  
        if (!commonMediaTypes.includes(value)) {
          console.warn(
            `Warning: Media type '${value}' is not a commonly used media type in STAC. Please ensure it's correct.`
          );
        }
      },
    },
  },
  /**
   * The semantic roles of the asset, similar to the use of rel in links.
   */
  roles: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },


  /**
   * Foreign key linking the Asset to an Item.
   */
  item_id: {
    type: DataTypes.STRING,
    references: {
      model: Item,
      key: 'item_id',
    },
    onDelete: 'CASCADE',
  },
  
}, {
  tableName: 'asset',
  timestamps: false,
});

module.exports = Asset;
