const sequelize = require('../config/db');
const User = require('./User');
const Collection = require('./Collection');
const Item = require('./Item');
const MlmModel = require('./MlmModel');
const Asset = require('./Asset');

// Export models without relationships
const models = { User, Collection, Item, MlmModel, Asset };

// Function to define relationships
const defineRelationships = () => {
  // Define relationships between models
  models.Collection.hasMany(models.Item, { foreignKey: 'collection_id', as: 'items', onDelete: 'CASCADE' });
  models.Item.belongsTo(models.Collection, { foreignKey: 'collection_id', as: 'parentCollection' });

  models.Collection.hasMany(models.MlmModel, { foreignKey: 'collection_id', as: 'models', onDelete: 'CASCADE' });
  models.MlmModel.belongsTo(models.Collection, { foreignKey: 'collection_id', as: 'parentCollection' });

  models.Collection.hasMany(models.Asset, { foreignKey: 'collection_id', as: 'assets', onDelete: 'CASCADE' });
  models.Asset.belongsTo(models.Collection, { foreignKey: 'collection_id', as: 'parentCollection' });

  models.Item.hasMany(models.Asset, { foreignKey: 'item_id', as: 'relatedAssets', onDelete: 'CASCADE' });
  models.Asset.belongsTo(models.Item, { foreignKey: 'item_id', as: 'parentItem' });

  models.MlmModel.hasMany(models.Asset, { foreignKey: 'model_id', as: 'associatedAssets', onDelete: 'CASCADE' });
  models.Asset.belongsTo(models.MlmModel, { foreignKey: 'model_id', as: 'parentModel' });

  models.Collection.belongsTo(models.User, { foreignKey: 'user_id', as: 'owner', onDelete: 'SET NULL' });
};

// Synchronize database and define relationships
(async () => {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    defineRelationships(); // Define relationships after models are loaded

    console.log('Synchronizing models...');
    await sequelize.sync({ force: true });
    console.log('All models synchronized successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
})();

module.exports = { sequelize, ...models };
