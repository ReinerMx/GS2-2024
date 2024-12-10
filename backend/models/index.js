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
    // Collection -> Items (1:n)
    models.Collection.hasMany(models.Item, { foreignKey: 'collection_id', as: 'items', onDelete: 'CASCADE' });
    models.Item.belongsTo(models.Collection, { foreignKey: 'collection_id', as: 'parentCollection' });
  
    // Items -> Assets (1:n)
    models.Item.hasMany(models.Asset, { foreignKey: 'item_id', as: 'assets', onDelete: 'CASCADE' });
    models.Asset.belongsTo(models.Item, { foreignKey: 'item_id', as: 'parentItem' });
  
    // Items -> MLM (1:n)
    models.Item.hasMany(models.MlmModel, { foreignKey: 'item_id', as: 'mlmModels', onDelete: 'CASCADE' });
    models.MlmModel.belongsTo(models.Item, { foreignKey: 'item_id', as: 'parentItem' });
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
