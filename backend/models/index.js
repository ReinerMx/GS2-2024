const Collection = require('./Collection');
const Item = require('./Item');
const MlmModel = require('./MlmModel');
const Asset = require('./Asset');

// Beziehungen definieren
Collection.hasMany(Item, { foreignKey: 'collection_id', as: 'items' });
Collection.hasMany(MlmModel, { foreignKey: 'collection_id', as: 'models' });
Collection.hasMany(Asset, { foreignKey: 'collection_id', as: 'assets' });

Item.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });
Item.hasMany(Asset, { foreignKey: 'item_id', as: 'assets' });

MlmModel.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });
MlmModel.hasMany(Asset, { foreignKey: 'model_id', as: 'assets' });

Asset.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
Asset.belongsTo(MlmModel, { foreignKey: 'model_id', as: 'mlm_model' });
Asset.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });

// Exportieren der Modelle
module.exports = {
    Collection,
    Item,
    MlmModel,
    Asset,
};
