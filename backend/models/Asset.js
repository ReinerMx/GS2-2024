const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");
const Item = require('./Item');
const MlmModel = require('./MlmModel');
const Collection = require('./Collection');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  asset_type: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  href: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  mlm_artifact_type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  roles: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  item_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Item,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  model_id: {
    type: DataTypes.INTEGER,
    references: {
      model: MlmModel,
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  collection_id: {
    type: DataTypes.STRING,
    references: {
      model: Collection,
      key: 'collection_id',
    },
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'assets',
  timestamps: false,
});

module.exports = Asset;
