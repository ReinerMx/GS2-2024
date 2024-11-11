const { DataTypes } = require('sequelize');
const db = require('../config/db.js');

const Model = db.define('Model', {
  modelName: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  taskType: { type: DataTypes.STRING, allowNull: false },
  dataType: { type: DataTypes.STRING, allowNull: false },
  language: { type: DataTypes.STRING, allowNull: false },
  filePath: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'models',
});

module.exports = Model;
