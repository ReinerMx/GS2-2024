document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('resultsContainer');
    const searchInput = document.getElementById('searchInput');

    // Function to fetch and display all models initially
    const loadAllModels = async () => {
        try {
            const response = await fetch('/api/models');
            const models = await response.json();
            console.log('Fetched models:', models);
            displayModels(models);
        } catch (error) {
            console.error('Error loading models:', error);
            resultsContainer.innerHTML = '<p>Error loading models.</p>';
        }
    };

    // Function to perform search based on input
    const performSearch = async () => {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            loadAllModels();
            return;
        }
        
        try {
            const response = await fetch(`/api/models/search?term=${encodeURIComponent(searchTerm)}`);
            const models = await response.json();
            displayModels(models);
        } catch (error) {
            console.error('Error searching models:', error);
            resultsContainer.innerHTML = '<p>Error searching models.</p>';
        }
    };

    // initialising Leaflet-Map 
    const map = L.map('map').setView([51.505, -0.09], 5); // Zentrum und Zoom-Level setzen
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);

    // adding Leaflet.Draw-Tool 
    const drawControl = new L.Control.Draw({
        draw: {
            polygon: true,
            rectangle: true,
            polyline: false,
            circle: false,
            marker: false,
            circlemarker: false,
        },
    });
    map.addControl(drawControl);

    // safing geometry after drawing
    map.on(L.Draw.Event.CREATED, (event) => {
        const layer = event.layer;
        map.addLayer(layer); // Füge die gezeichnete Form zur Karte hinzu
        console.log('GeoJSON:', layer.toGeoJSON());
    });

    // Event-Listener for the Geo-Filter-Button
    document.getElementById('applyGeoFilter').addEventListener('click', async () => {
        if (!drawnGeometry) {
            alert('Please draw a geographic region first!');
            return;
        }

        const geoJSON = drawnGeometry.toGeoJSON(); // Konvertiere zu GeoJSON
        console.log('Geographic Filter GeoJSON:', geoJSON);

        try {
            const response = await fetch('/api/models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ geoFilter: geoJSON.geometry }),
            });
            const models = await response.json();
            displayModels(models); // Gefilterte Modelle anzeigen
        } catch (error) {
            console.error('Error applying geographic filter:', error);
        }
    });
    

    // Function to display models
    const displayModels = (models) => {
        resultsContainer.innerHTML = ''; // Clear previous content
        if (models.length === 0) {
            resultsContainer.innerHTML = '<p>No models found.</p>';
            return;
        }
    
        models.forEach((model) => {
            const modelDiv = document.createElement('div');
            modelDiv.classList.add('model-item', 'mb-4');
    
            // Zugriff auf die tatsächlichen Felder der API-Response
            modelDiv.innerHTML = `
                <h4>${model.name || 'No Name Provided'}</h4>
                <p><strong>Tasks:</strong> ${model.tasks ? model.tasks.join(', ') : 'No Tasks Defined'}</p>
                <p><strong>Description:</strong> ${model.description || 'No Description Available'}</p>
                <button class="btn btn-info view-details-btn" data-id="${model.id}">View Details</button>
            `;
    
            resultsContainer.appendChild(modelDiv);
        });
    
        // Attach event listeners to "View Details" buttons
        attachViewDetailsListeners();
    };
    
    

    // Function to attach click listeners to "View Details" buttons
    const attachViewDetailsListeners = () => {
        document.querySelectorAll('.view-details-btn').forEach((button) => {
            button.addEventListener('click', (event) => {
                const modelId = event.target.getAttribute('data-id');
                window.location.href = `modelDetails.html?id=${modelId}`;
            });
        });
    };
    

    // Function to navigate to the details page
    const viewDetails = (modelId) => {
        window.location.href = `modelDetails.html?id=${modelId}`;
    };

    // Load all models on page load
    loadAllModels();

    // Attach search functionality
    searchInput.addEventListener('input', performSearch);
});
