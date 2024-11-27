/**
 * Model definition for a machine learning model.
 * This defines the schema for the models stored in the database, including details
 * like the model's name, description, task type, data source, and more.
 * @module models/Model
 */

const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * Represents a machine learning model in the database.
 * @typedef {Object} Model
 * @property {string} modelName - Name of the model.
 * @property {string} description - Description of the model.
 * @property {string} taskType - Type of task the model performs (e.g., classification).
 * @property {string} dataType - Data type used in the model.
 * @property {string} resolution - Spatial resolution of the data.
 * @property {number} numberOfBands - Number of spectral bands in the data.
 * @property {string} fileFormat - Format of the model file.
 * @property {string} dataSource - Data source for the model.
 * @property {Object} spatialCoverage - Geographical coverage in GeoJSON format.
 * @property {Object} temporalCoverage - Temporal coverage with start and end dates.
 * @property {string|null} modelLink - Direct link to the model file.
 * @property {string|null} sourceCodeLink - Link to the source code.
 * @property {Object|null} otherLinks - Additional related links.
 * @property {string|null} framework - Framework used for the model.
 * @property {string|null} frameworkVersion - Version of the framework.
 * @property {string|null} architecture - Model architecture.
 * @property {number|null} totalParameters - Total parameters in the model.
 */
const Model = db.define('Model', {
    modelName: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    taskType: { type: DataTypes.STRING, allowNull: false },
    dataType: { type: DataTypes.STRING, allowNull: false },
    resolution: { type: DataTypes.STRING, allowNull: false },
    numberOfBands: { type: DataTypes.INTEGER, allowNull: false },
    fileFormat: { type: DataTypes.STRING, allowNull: false },
    dataSource: { type: DataTypes.STRING, allowNull: false },
    spatialCoverage: { type: DataTypes.JSON, allowNull: false },
    temporalCoverage: { type: DataTypes.JSON, allowNull: false },
    modelLink: { type: DataTypes.STRING, allowNull: true },
    sourceCodeLink: { type: DataTypes.STRING, allowNull: true },
    otherLinks: { type: DataTypes.JSON, allowNull: true },
    framework: { type: DataTypes.STRING, allowNull: true },
    frameworkVersion: { type: DataTypes.STRING, allowNull: true },
    architecture: { type: DataTypes.STRING, allowNull: true },
    totalParameters: { type: DataTypes.INTEGER, allowNull: true },
    // New fields
    userDescription: { type: DataTypes.TEXT, allowNull: true }, // Optional field
    cloudCoverage: { type: DataTypes.FLOAT, allowNull: false }, // Required field
});

module.exports = Model;
