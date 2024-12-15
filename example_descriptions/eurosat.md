# EuroSAT Land Cover 🛰️  
**Framework**: PyTorch | **Architektur**: ResNet-18  

🌍 **Beschreibung**  
Klassifiziert Sentinel-2 Bilder in 10 Landbedeckungsklassen:  
- **Forest**, **Pasture**, **River**, **SeaLake**, ...  

📊 **Input**:  
- **Bänder**: B01–B12  
- **Shape**: `[batch, 13, 64, 64]`  

🎯 **Output**:  
- **Shape**: `[batch, 10]`  
- **Kategorien**: Scene-Classification  

⚙️ **Training**:  
- **Batch-Größe**: 3300 | **GPU**: NVIDIA (24GB)  

🔗 [Details ansehen](http://localhost:5555/collections/ml-models-rs/items/item_landcover_eurosat_sentinel2)
