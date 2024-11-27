const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");

const MlmModel = sequelize.define('MlmModel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  architecture: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  tasks: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  framework: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  framework_version: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  memory_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total_parameters: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  pretrained: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  pretrained_source: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  batch_size_suggestion: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  accelerator: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  accelerator_constrained: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  accelerator_summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  accelerator_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  model_input: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  model_output: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  hyperparameters: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  collection_id: {
    type: DataTypes.STRING,
    references: {
      model: 'collections',
      key: 'collection_id',
    },
    allowNull: true,
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'mlm_models',
  timestamps: false,
});

module.exports = MlmModel;
