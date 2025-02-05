const { Sequelize } = require("sequelize");
const User = require("./models/User");
const Collection = require("./models/Collection");
const Item = require("./models/Item");
const Asset1 = require("./models/Asset");
const Asset2 = require("./models/Asset");
const Asset3 = require("./models/Asset");
const MlmModel = require("./models/MlmModel")
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
                saved_collections: ["default"]
            });
            console.log("✅ User created:", user.id);
        }

        // Add Collection
        const existingCollection = await Collection.findByPk("default");
        if (!existingCollection) {
            console.log("➕ Adding collection...");

            await Collection.create({
                type: "Collection",
                stac_version: "1.0.0",
                stac_extensions: [ "https://stac-extensions.github.io/item-assets/v1.0.0/schema.json",
                                   "https://stac-extensions.github.io/mlm/v1.2.0/schema.json"
                                 ],
                collection_id: "default",
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
        let item = await Item.findByPk("default_item");
        if (!item) {
            console.log("➕ Adding Item...");

            await Item.create({
                type: "Feature",
                stac_extensions:[ "https://stac-extensions.github.io/eo/v1.1.0/schema.json",
                                  "https://stac-extensions.github.io/ml-model/v1.0.0/schema.json",
                                  "https://crim-ca.github.io/mlm-extension/v1.2.0/schema.json",
                                  "https://stac-extensions.github.io/raster/v1.1.0/schema.json",
                                  "https://stac-extensions.github.io/file/v2.1.0/schema.json"
                                ],
                stac_version: "1.0.0",
                item_id: "default_item",
                collection_id: "default",
                properties: {
                    datetime: "2024-07-26T07:53:09.308573Z",
                    end_datetime:"2023-06-18T23:59:59Z",
                    start_datetime:"2023-06-13T00:00:00Z",
                    "mlm:name": "Water-Bodies-S6_Scikit-Learn-RandomForestClassifier",
                    "mlm:tasks": ["segmentation", "semantic-segmentation"],
                    "mlm:compiled": false,
                    "mlm:framework": "scikit-learn",
                    "mlm:framework_version": "1.4.2",
                    "mlm:architecture": "RandomForestClassifier",
                    "mlm:accelerator": "amd64",
                    "mlm:accelerator_constrained": true,
                    "mlm:hyperparameters": {
                        "n_jobs": -1,
                        "verbose": 0,
                        "bootstrap": true,
                        "ccp_alpha": 0,
                        "criterion": "gini",
                        "oob_score": false,
                        "warm_start": true,
                        "max_features": "sqrt",
                        "n_estimators": 200,
                        "random_state": 19,
                        "min_samples_leaf": 1,
                        "min_samples_split": 2,
                        "min_impurity_decrease": 0,
                        "min_weight_fraction_leaf": 0
                    }
                },
                bbox: [-121.87680832296513, 36.93063805399626, -120.06532070709298, 38.84330548198025],
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        [
                            [-121.87680832296513, 36.93063805399626],
                            [-120.06532070709298, 36.93063805399626],
                            [-120.06532070709298, 38.84330548198025],
                            [-121.87680832296513, 38.84330548198025],
                            [-121.87680832296513, 36.93063805399626]
                        ]
                    ]
                },
                links: [
                    { rel: "collection", type: "application/json", href: "https://ai-extensions-stac.terradue.com/collections/ML-Models" },
                    { rel: "parent", type: "application/json", href: "https://ai-extensions-stac.terradue.com/collections/ML-Models" },
                    { rel: "root", type: "application/json", href: "https://ai-extensions-stac.terradue.com/" },
                    { rel: "self", type: "application/geo+json", href: "https://ai-extensions-stac.terradue.com/collections/ML-Models/items/water-bodies-model-pystac" }
                ]
            });

            console.log("✅ Item added successfully.");
        } else {
            console.log("ℹ️ Item already exists.");
        }

        // Adding Assets
        let asset1 = await Asset1.findOne({ where: { href: "https://github.com/ai-extensions/notebooks/raw/main/scenario-7/model/best_model.onnx" } });
        if (!asset1) {
             console.log("➕ Adding Asset...");
 
             await Asset1.create({
                 href: "https://github.com/ai-extensions/notebooks/raw/main/scenario-7/model/best_model.onnx",
                 title: "ONNX Model",
                 type: "application/octet-stream; framework=onnx; profile=onnx",
                 roles: ["mlm:model"],
                 item_id: "default_item"
             });
 
             console.log("✅ Asset added successfully.");
         } else {
             console.log("ℹ️ Asset already exists");
         }

        let asset2 = await Asset2.findOne({ where: { href: "https://github.com/ai-extensions/notebooks/releases/download/v1.0.8/water-bodies-app-training.1.0.8.cwl" } });
        if (!asset2) {
             console.log("➕ Adding Asset...");
 
             await Asset2.create({
                 href: "https://github.com/ai-extensions/notebooks/releases/download/v1.0.8/water-bodies-app-training.1.0.8.cwl",
                 title: "Workflow for water bodies training",
                 type: "application/cwl+yaml",
                 roles: ["ml-model:training-runtime", "runtime", "mlm:training-runtime"],
                 item_id: "default_item"
             });
 
             console.log("✅ Asset added successfully.");
         } else {
             console.log("ℹ️ Asset already exists");
         }

         let asset3 = await Asset3.findOne({ where: { href: "https://github.com/ai-extensions/notebooks/releases/download/v1.0.8/water-bodies-app-inference.1.0.8.cwl" } });
        if (!asset3) {
             console.log("➕ Adding Asset...");
 
             await Asset3.create({
                 href: "https://github.com/ai-extensions/notebooks/releases/download/v1.0.8/water-bodies-app-inference.1.0.8.cwl",
                 title: "Workflow for water bodies inference",
                 type: "application/cwl+yaml",
                 roles: ["ml-model:training-runtime", "runtime", "mlm:training-runtime"],
                 item_id: "default_item"
             });
 
             console.log("✅ Asset added successfully.");
         } else {
             console.log("ℹ️ Asset already exists");
         }

        // Adding MLM-Model
        let mlmModel = await MlmModel.findOne({ where: { mlm_name: "Water-Bodies-S6_Scikit-Learn-RandomForestClassifier" } });
        if (!mlmModel) {
            console.log("➕ Adding Mlm-model...");

            await MlmModel.create({
                item_id: "default_item",
                mlm_name: "Water-Bodies-S6_Scikit-Learn-RandomForestClassifier",
                mlm_tasks: ["segmentation", "semantic-segmentation"],
                mlm_compiled: false,
                mlm_framework: "scikit-learn",
                mlm_framework_version: "1.4.2",
                mlm_architecture: "RandomForestClassifier",
                mlm_accelerator: "amd64",
                mlm_accelerator_constrained: true,
                mlm_hyperparameters: {
                    n_jobs: -1,
                    verbose: 0,
                    bootstrap: true,
                    ccp_alpha: 0,
                    criterion: "gini",
                    oob_score: false,
                    warm_start: true,
                    max_features: "sqrt",
                    n_estimators: 200,
                    random_state: 19,
                    min_samples_leaf: 1,
                    min_samples_split: 2,
                    min_impurity_decrease: 0,
                    min_weight_fraction_leaf: 0
                },
                mlm_pretrained_source: "Unknown",  
                mlm_batch_size_suggestion: 10,      
                mlm_accelerator_summary: "N/A",    
                mlm_input: [
                    {
                        name:"EO Data",
                        bands:[
                           "B01",
                           "B02",
                           "B03",
                           "B04",
                           "B08",
                           "B8A",
                           "B09",
                           "B11",
                           "B12",
                           "NDVI",
                           "NDWI1",
                           "NDWI2"
                        ],
                        input:{
                           shape:[
                              -1,
                              12,
                              10980,
                              10980
                           ],
                           data_type:"float32",
                           dim_order:[
                              "batch",
                              "channel",
                              "height",
                              "width"
                           ]
                        }
                     }
                ],
                mlm_output: [
                    {
                        name:"CLASSIFICATION",
                        tasks:[
                           "segmentation",
                           "semantic-segmentation"
                        ],
                        result:{
                           shape:[
                              -1,
                              10980,
                              10980
                           ],
                           data_type:"uint8",
                           dim_order:[
                              "batch",
                              "height",
                              "width"
                           ]
                        },
                        "classification:classes": [
                           {
                              name:"NON-WATER",
                              value:0,
                              nodata:false,
                              color_hint:"000000",
                              description:"pixels without water"
                           },
                           {
                              name:"WATER",
                              value:1,
                              nodata:false,
                              color_hint:"0000FF",
                              description:"pixels with water"
                           },
                           {
                              name:"CLOUD",
                              value:2,
                              nodata:false,
                              color_hint:"FFFFFF",
                              description:"pixels with cloud"
                           }
                        ]
                     }
                ],                
                collection_id: "default"
            });

            console.log("✅ MLM-Model added successfully.");
        } else {
            console.log("ℹ️ MLM-Model already exists.");
        }

    } catch (error) {
        console.error("❌ Database initialization error:", error);
    }
}

module.exports = initDB;