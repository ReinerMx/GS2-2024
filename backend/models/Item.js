const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");
const Collection = require('./Collection');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { isIn: [['Feature']] },
  },
  stac_version: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  stac_extensions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  item_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  geometry: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  bbox: {
    type: DataTypes.ARRAY(DataTypes.FLOAT),
    allowNull: true,
  },
  properties: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  links: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  assets: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  collection: {
    type: DataTypes.STRING,
    references: {
      model: Collection,
      key: 'collection_id',
    },
    allowNull: true,
  },
}, {
  tableName: 'items',
  timestamps: false,
});

module.exports = Item;
