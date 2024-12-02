const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");

const Collection = sequelize.define('Collection', {
    id: {
        type: DataTypes.INTEGER, // INTEGER für auto-inkrementierende IDs
        autoIncrement: true, 
        primaryKey: true,
    },
    collection_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['FeatureCollection']], // Nur 'FeatureCollection' erlaubt
        },
    },
    stac_version: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    stac_extensions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    keywords: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
    license: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    providers: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    extent: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    summaries: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    links: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    assets: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    item_assets: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
}, {
    tableName: 'collection',
    timestamps: false, // Keine Timestamps verwenden
});

module.exports = Collection;
