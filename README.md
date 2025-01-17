**The German version of the README is available below.**


# Geosoftware II - TerraLink

---

## Important Links:

- **Repository:** [GS2-2024 Repository](https://github.com/ReinerMx/GS2-2024)
- **Project Documentation (Overleaf):** [Project Documentation](https://www.overleaf.com/project/67121d8286e37093f88de455)
- **Presentation:** [Google Slides](https://docs.google.com/presentation/d/1VwPwdpmAnKLgP32q3Nw64L7xUm2H4YQJQVxEfDnQM30/edit?usp=sharing)
- **Similar Catalog:** [Hugging Face](https://huggingface.co/)

---

## Project Description

**Web Catalog for ML Models for EO Data**

This project, developed as part of the Geosoftware II course (WiSe 2024/25), aims to create a web-based catalog for the user-friendly search and retrieval of machine learning models specifically designed for Earth Observation (EO) Datacubes.

### Key Features:

- **Model Search & Retrieval:** Search and filter ML models for EO analysis using the STAC MLM extension.
- **Seamless Integration:** Easily integrate models into Python and R workflows through STAC clients (e.g., PySTAC, RSTAC).
- **Metadata Management:** Upload and download spatiotemporal metadata for efficient model access.
- **Community-Driven:** Users can upload their own models and contribute to the catalog.

---

## Installation Guide

### Prerequisites

- Node.js (Version 14 or higher)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL (optional for local deployment without Docker)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/ReinerMx/GS2-2024.git
cd GS2-2024
```

#### 2. Backend Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and define environment variables:
   ```env
   POSTGRES_USER=yourusername
   POSTGRES_PASSWORD=yourpassword
   POSTGRES_DB=huggingearth
   ```
4. Initialize the database:
   ```bash
   npm run migrate
   ```
5. Start the backend:
   ```bash
   npm start
   ```

#### 3. Frontend Installation

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm start
   ```

#### 4. Deployment with Docker

1. Ensure Docker and Docker Compose are installed.
2. Run the Docker Compose file:
   ```bash
   docker-compose up --build
   ```

---

## Project Structure

```
TerraLink/
├── backend/      # Backend code and API implementations
├── frontend/     # Frontend code
├── docker-compose.yml  # Docker configuration file
├── README.md     # Project overview
├── .env.example  # Example environment variables
└── docs/         # Documentation
```

---

## Usage

### Model Upload

1. Log in or register through the user interface.
2. Navigate to the upload page.
3. Upload:
   - The model (JSON metadata in STAC format).
   - An optional description.

### Model Search and Download

1. Use the search bar and filter options to browse models.
2. Click on a specific model for detailed information.
3. Use the provided link to access the related GitHub repository for further use.
4. Integrate models and metadata into workflows using PySTAC or RSTAC.

---

## Continuous Integration (CI/CD)

The platform uses **GitHub Actions** for CI/CD.

- **Automated Testing:** Tests are executed for every pull request.
- **Docker Builds:** Docker images are automatically built and published to Docker Hub.

**Configuration:**

- `.github/workflows/ci.yml`

---

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for more details.

---

**Developed by:** Amelie Julia Luschnig, Jakub Zahwe, Lukas Ahlert, Maximilian Reiner, and Lara Sieksmeier

**Instructors:** Brian Pondi, Christian Knoth

---
<!-- ![Repository Logo](Dokumente/Logo-Ideen/TerraLink1.png) -->


---
---
# GERMAN VERSION
---
---

# Geosoftware II - TerraLink 

---

## Wichtige Links:

- Repo: https://github.com/ReinerMx/GS2-2024
- Pflichtenheft (Overleaf): https://www.overleaf.com/project/67121d8286e37093f88de455
- Präsi: https://docs.google.com/presentation/d/1VwPwdpmAnKLgP32q3Nw64L7xUm2H4YQJQVxEfDnQM30/edit?usp=sharing
- Ähnlicher Catalog: https://huggingface.co/

## Wichtige Links

- **Repository:** [GS2-2024 Repository](https://github.com/ReinerMx/GS2-2024)
- **Pflichtenheft (Overleaf):** [Projekt-Dokumentation](https://www.overleaf.com/project/67121d8286e37093f88de455)
- **Ähnlicher Katalog:** [Hugging Face](https://huggingface.co/)

---

## Projektbeschreibung

**Webkatalog für ML-Modelle für EO-Daten**

Dieses Projekt, entwickelt im Rahmen des Geosoftware II Kurses (WiSe 2024/25), zielt darauf ab, einen webbasierten Katalog für die benutzerfreundliche Suche und den Abruf von Machine-Learning-Modellen zu erstellen, die speziell für Earth Observation (EO) Datacubes entwickelt wurden.

### Hauptfunktionen:

- **Modellsuche & -abruf:** Durchsuchen und Filtern von ML-Modellen für EO-Analysen mithilfe der STAC MLM-Erweiterung.
- **Einfache Integration:** Nahtlose Integration in Python- und R-Workflows über STAC-Clients (z. B. PySTAC, RSTAC).
- **Metadaten-Management:** Hochladen und Herunterladen von raum-zeitlichen Metadaten für effizienten Modellzugriff.
- **Community-Driven:** Benutzer können eigene Modelle hochladen und zum Katalog beitragen.

---

## Installationsanleitung

### Voraussetzungen

- Node.js (Version 14 oder höher)
- npm oder yarn
- Docker und Docker Compose
- PostgreSQL (optional bei lokalem Deployment ohne Docker)

### Schritte zur Installation

#### 1. Repository klonen

```bash
git clone https://github.com/ReinerMx/GS2-2024.git
cd GS2-2024
```

#### 2. Backend-Installation

1. Wechseln Sie ins Backend-Verzeichnis:
   ```bash
   cd backend
   ```
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. `.env`-Datei erstellen und Umgebungsvariablen definieren:
   ```env
   POSTGRES_USER=yourusername
   POSTGRES_PASSWORD=yourpassword
   POSTGRES_DB=huggingearth
   ```
4. Datenbank initialisieren:
   ```bash
   npm run migrate
   ```
5. Backend starten:
   ```bash
   npm start
   ```

#### 3. Frontend-Installation

1. Wechseln Sie ins Frontend-Verzeichnis:
   ```bash
   cd ../frontend
   ```
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. Frontend starten:
   ```bash
   npm start
   ```

#### 4. Deployment mit Docker

1. Stellen Sie sicher, dass Docker und Docker Compose installiert sind.
2. Docker-Compose-Datei ausführen:
   ```bash
   docker-compose up --build
   ```

---

## Projektstruktur

```
HuggingEarth/
├── backend/      # Backend-Code und API-Implementierungen
├── frontend/     # Frontend-Code
├── docker-compose.yml  # Docker-Konfigurationsdatei
├── README.md     # Projektübersicht
├── .env.example  # Beispiel für Umgebungsvariablen
└── docs/         # Dokumentation
```

---

## Nutzung

### Modell-Upload

1. Melden Sie sich an oder registrieren Sie sich über die Benutzeroberfläche.
2. Navigieren Sie zur Upload-Seite.
3. Laden Sie:
   - Das Modell (JSON-Metadaten im STAC-Format) hoch
   - Eine optionale Beschreibung hoch.

### Modell-Suche und -Download

1. Verwenden Sie die Suchleiste und Filteroptionen, um Modelle zu durchsuchen.
2. Klicken sie auf ein spezifisches Modell um mehr Details zu erfahren
3. Gelangen Sie über den bereitgestellten Link zum zugehörige GitHub Repository, um somit das Modell nutzen zu können
4. Nutzen Sie PySTAC oder RSTAC, um Modelle und Metadaten in Ihren Workflow zu integrieren.

---

## Continuous Integration (CI/CD)

Die Plattform nutzt **GitHub Actions** für CI/CD.

- **Automatisierte Tests:** Bei jedem Pull-Request werden Tests ausgeführt.
- **Docker-Builds:** Docker-Images werden automatisch erstellt und auf Docker Hub veröffentlicht.

**Konfiguration:**

- `.github/workflows/ci.yml`

---

## Lizenz

Dieses Projekt wird unter der MIT-Lizenz veröffentlicht. Siehe [LICENSE](LICENSE) für weitere Informationen.

---

**Entwickelt von:** Amelie Julia Luschnig, Jakub Zahwe, Lukas Ahlert, Maximilian Reiner und Lara Sieksmeier

**Dozenten:** Brian Pondi, Christian Knoth

---
<!-- ![Repository Logo](Dokumente/Logo-Ideen/TerraLink1.png) -->
