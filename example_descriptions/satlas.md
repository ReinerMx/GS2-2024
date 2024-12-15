# Satlas Solar Farm 🏭  
**Framework**: PyTorch | **Architektur**: Swin Transformer V2  

📌 **Einsatzgebiet**:  
Segmentiert Solar-Farmen auf Sentinel-2 Bildern.

🔍 **Input**:  
- **Bänder**: 9 Sentinel-2 (4 Zeitschritte)  
- **Shape**: `[batch, 36, 1024, 1024]`  

🎯 **Output**:  
- **Name**: Confidence Array  
- **Shape**: `[batch, 1, 1024, 1024]`  

⚙️ **Trainingsinfo**:  
- **Hardware**: GPU (Ampere/NVIDIA)  
- **Batch-Größe**: 10  

🔗 [Modell-Details](http://localhost:5555/collections/ml-models-rs/items/item_solar_satlas_sentinel2)
