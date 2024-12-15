# Water-Bodies-S6 🌊  
**Framework**: Scikit-Learn | **Architektur**: RandomForestClassifier  

### 📝 Beschreibung  
Klassifiziert Pixel von EO-Daten in:  
- **NON-WATER** (0) `#000000`  
- **WATER** (1) `#0000FF`  
- **CLOUD** (2) `#FFFFFF`  

### 📊 Eingabedaten  
- **Bänder**: B01–B12, NDVI, NDWI1, NDWI2  
- **Shape**: `[batch, 12, 10980, 10980]`  

### 🔢 Ausgabe  
- **Shape**: `[batch, 10980, 10980]`  
- **Format**: `uint8`  

### ⚙️ Hyperparameter  
- `n_estimators`: 200 | `criterion`: Gini  
- `max_features`: sqrt  

### 📅 Trainingszeitraum  
2023-06-13 bis 2023-06-18  

🔗 [Details zum Modell](http://localhost:5555/collections/ml-models-rs/items/water-bodies-model-pystac)
