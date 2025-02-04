const { Sequelize } = require("sequelize");
const User = require("./models/User");
const Collection = require("./models/Collection");
const Item = require("./models/Item");
const Asset = require("./models/Asset");
const sequelize = require("./config/db");

async function initDB() {
    try {
        console.log("🔄 Synchronizing database...");
        await sequelize.sync({ alter: true }); // Creates or updates tables

        console.log("✅ Database synchronization complete.");

        // Create User
        let user = await User.findOne({ where: { username: "default_user" } });
        if (!user) {
            console.log("👤 Creating user...");
            user = await User.create({
                username: "default_user",
                email: "default@example.com",
                password: "defaultpassword",
                saved_collections: ["ml-models-rs"]
            });
            console.log("✅ User created:", user.id);
        }

        // Add Collection
        const existingCollection = await Collection.findByPk("ml-models-rs");
        if (!existingCollection) {
            console.log("➕ Adding collection...");

            await Collection.create({
                type: "Collection",
                stac_version: "1.0.0",
                collection_id: "ml-models-rs",
                title: "ML Models for Remote Sensing",
                description: "ML Models for various remote sensing tasks",
                license: "proprietary",
                keywords: ["machine learning", "deep learning", "ifgi"],
                providers: [
                    { name: "Wherebots", roles: ["producer"], url: "https://wherobots.com/" },
                    { name: "Terradue", roles: ["producer"], url: "https://www.terradue.com/portal/" },
                    { name: "IFGI", roles: ["server"], url: "https://www.uni-muenster.de/Geoinformatics/" }
                ],
                extent: {
                    spatial: { bbox: [[-180, -90, 180, 90]] },
                    temporal: { interval: [["2010-01-01T00:00:00Z", "9999-12-31T23:59:59Z"]] }
                },
                links: [
                    { rel: "self", type: "application/json", href: "/collections/ml-models" },
                    { rel: "cite-as", href: "https://doi.org/10.1145/3681769.3698586" },
                    { rel: "root", type: "application/json", href: "/" },
                    { rel: "items", type: "application/geo+json", href: "/ml-models/items" }
                ],
                summaries: {},
                item_assets: {},
                user_id: 1,
                user_description: "default_user"

            });

            console.log("✅ Collection added successfully.");
        } else {
            console.log("ℹ️ Collection already exists.");
        }

        // Adding Item
        let item = await Item.findByPk("item_solar_satlas_sentinel2");
        if (!item) {
            console.log("➕ Adding Item...");

            await Item.create({
                type: "Feature",
                stac_version: "1.0.0",
                item_id: "item_solar_satlas_sentinel2",
                collection_id: "ml-models-rs",
                properties: {
                    start_datetime: "2022-01-01T00:00:00Z",
                    end_datetime: "2024-01-01T00:00:00Z",
                    description: "Sourced from satlas source code released by Allen AI under Apache 2.0",
                    "mlm:framework": "pytorch",
                    "mlm:framework_version": "2.3.0+cu121",
                    "file:size": 333000000,
                    "mlm:memory_size": 1,
                    "mlm:batch_size_suggestion": 10,
                    "mlm:accelerator": "cuda",
                    "mlm:accelerator_constrained": true,
                    "mlm:accelerator_summary": "It is necessary to use GPU since it was compiled for NVIDIA Ampere and newer architectures with AOTInductor and the computational demands of the model.",
                    "mlm:name": "Satlas Solar Farm Segmentation",
                    "mlm:architecture": "Swin Transformer V2 with U-Net head",
                    "mlm:tasks": ["semantic-segmentation", "segmentation"],
                    "mlm:pretrained": true,
                    "mlm:pretrained_source": "Sentinel-2 imagery and SATLAS labels"
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        [
                            [-7.882190080512502, 37.13739173208318],
                            [-7.882190080512502, 58.21798141355221],
                            [27.911651652899923, 58.21798141355221],
                            [27.911651652899923, 37.13739173208318],
                            [-7.882190080512502, 37.13739173208318]
                        ]
                    ]
                },
                bbox: [-7.882190080512502, 37.13739173208318, 27.911651652899923, 58.21798141355221],
                links: [
                    {
                        rel: "derived_from",
                        href: "https://earth-search.aws.element84.com/v1/collections/sentinel-2-l1c",
                        type: "application/json"
                    },
                    {
                        rel: "self",
                        href: "s3://wherobots-modelhub-prod/professional/semantic-segmentation/solar-satlas-sentinel2/model-metadata.json/item_solar_satlas_sentinel2.json",
                        type: "application/json"
                    }
                ]
            });

            console.log("✅ Item added successfully.");
        } else {
            console.log("ℹ️ Item already exists.");
        }

         // Adding Asset
         let asset = await Asset.findOne({ where: { href: "s3://wherobots-modelhub-prod/professional/semantic-segmentation/solar-satlas-sentinel2/inductor/gpu/aot_inductor_gpu_tensor_cores.zip" } });
         if (!asset) {
             console.log("➕ Adding Asset...");
 
             await Asset.create({
                 href: "s3://wherobots-modelhub-prod/professional/semantic-segmentation/solar-satlas-sentinel2/inductor/gpu/aot_inductor_gpu_tensor_cores.zip",
                 title: "AOTInductor model exported from private, edited, hard fork of Satlas github repo.",
                 description: "A Swin Transformer backbone with a U-net head trained on the 9-band Sentinel-2 Top of Atmosphere product.",
                 type: "application/zip; application=pytorch",
                 roles: ["mlm:model", "data"],
                 item_id: "item_solar_satlas_sentinel2"
             });
 
             console.log("✅ Asset added successfully.");
         } else {
             console.log("ℹ️ Asset already exists");
         }

    } catch (error) {
        console.error("❌ Database initialization error:", error);
    }
}

module.exports = initDB;