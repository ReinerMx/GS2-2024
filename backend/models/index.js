const sequelize = require('../config/db');
const User = require('./User');
const Collection = require('./Collection');
const Item = require('./Item');
const MlmModel = require('./MlmModel');
const Asset = require('./Asset');

// Define relationships between models
Collection.hasMany(Item, { foreignKey: 'collection_id', as: 'items', onDelete: 'CASCADE' });
Item.belongsTo(Collection, { foreignKey: 'collection_id', as: 'parentCollection' });

Collection.hasMany(MlmModel, { foreignKey: 'collection_id', as: 'models', onDelete: 'CASCADE' });
MlmModel.belongsTo(Collection, { foreignKey: 'collection_id', as: 'parentCollection' });

Collection.hasMany(Asset, { foreignKey: 'collection_id', as: 'assets', onDelete: 'CASCADE' });
Asset.belongsTo(Collection, { foreignKey: 'collection_id', as: 'parentCollection' });

Item.hasMany(Asset, { foreignKey: 'item_id', as: 'relatedAssets', onDelete: 'CASCADE' });
Asset.belongsTo(Item, { foreignKey: 'item_id', as: 'parentItem' });

MlmModel.hasMany(Asset, { foreignKey: 'model_id', as: 'associatedAssets', onDelete: 'CASCADE' });
Asset.belongsTo(MlmModel, { foreignKey: 'model_id', as: 'parentModel' });

Collection.belongsTo(User, { foreignKey: 'user_id', as: 'owner', onDelete: 'SET NULL' });

// Synchronize the database
(async () => {
  try {
    await sequelize.sync({ alter: true }); // Use { force: true } only for development
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing models:", error);
  }
})();

module.exports = {
  sequelize,
  User,
  Collection,
  Item,
  MlmModel,
  Asset,
};
