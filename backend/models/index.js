const Collection = require('./Collection');
const Item = require('./Item');
const MlmModel = require('./MlmModel');
const Asset = require('./Asset');
const User = require('./User');

// Define relationships between models

// A Collection can have many Items
Collection.hasMany(Item, {
    foreignKey: 'collection_id',
    as: 'items',
    onDelete: 'CASCADE', // Deleting a Collection will also delete its related Items
});
Item.belongsTo(Collection, {
    foreignKey: 'collection_id',
    as: 'parentCollection',
});

// A Collection can have many Machine Learning Models (MlmModels)
Collection.hasMany(MlmModel, {
    foreignKey: 'collection_id',
    as: 'models',
    onDelete: 'CASCADE', // Deleting a Collection will also delete its related MlmModels
});
MlmModel.belongsTo(Collection, {
    foreignKey: 'collection_id',
    as: 'parentCollection',
});

// A Collection can have many Assets
Collection.hasMany(Asset, {
    foreignKey: 'collection_id',
    as: 'assets',
    onDelete: 'CASCADE', // Deleting a Collection will also delete its related Assets
});
Asset.belongsTo(Collection, {
    foreignKey: 'collection_id',
    as: 'parentCollection',
});

// An Item can have many Assets
Item.hasMany(Asset, {
    foreignKey: 'item_id',
    as: 'relatedAssets',
    onDelete: 'CASCADE', // Deleting an Item will also delete its related Assets
});
Asset.belongsTo(Item, {
    foreignKey: 'item_id',
    as: 'parentItem',
});

// A Machine Learning Model (MlmModel) can have many Assets
MlmModel.hasMany(Asset, {
    foreignKey: 'model_id',
    as: 'associatedAssets',
    onDelete: 'CASCADE', // Deleting a Model will also delete its associated Assets
});
Asset.belongsTo(MlmModel, {
    foreignKey: 'model_id',
    as: 'parentModel',
});

// A Collection belongs to a User (optional)
Collection.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'owner',
    onDelete: 'SET NULL', // If the User is deleted, set the Collection's user_id to NULL
});

// Export the models and their relationships
module.exports = {
    Collection,
    Item,
    MlmModel,
    Asset,
    User,
};
