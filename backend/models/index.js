const Collection = require('./Collection');
const Item = require('./Item');
const MlmModel = require('./MlmModel');
const Asset = require('./Asset');

// Beziehungen definieren
Collection.hasMany(Item, { foreignKey: 'collection_id', as: 'items' });
Collection.hasMany(MlmModel, { foreignKey: 'collection_id', as: 'models' });
Collection.hasMany(Asset, { foreignKey: 'collection_id', as: 'associatedAssets' });

Item.belongsTo(Collection, { foreignKey: 'collection_id', as: 'parentCollection' });
Item.hasMany(Asset, { foreignKey: 'item_id', as: 'relatedAssets' }); // Alias geändert

MlmModel.belongsTo(Collection, { foreignKey: 'collection_id', as: 'parentCollection' });
MlmModel.hasMany(Asset, { foreignKey: 'model_id', as: 'associatedAssets' });

Asset.belongsTo(Item, { foreignKey: 'item_id', as: 'parentItem' });
Asset.belongsTo(MlmModel, { foreignKey: 'model_id', as: 'parentModel' });
Asset.belongsTo(Collection, { foreignKey: 'collection_id', as: 'parentCollection' });

// Exportieren der Modelle
module.exports = {
    Collection,
    Item,
    MlmModel,
    Asset,
};
