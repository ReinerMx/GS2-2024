document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('resultsContainer');
    const searchInput = document.getElementById('searchInput');

    // Initialize Leaflet map
    const map = L.map('map').setView([51.505, -0.09], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);

    // Add Leaflet Draw tool
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

    let drawnGeometry = null;

    // Save geometry after drawing
    map.on(L.Draw.Event.CREATED, (event) => {
        const layer = event.layer;
        map.addLayer(layer); // Add the drawn shape to the map
        drawnGeometry = layer;
        console.log('GeoJSON:', layer.toGeoJSON());
    });

    // Event listener for applying geographic filter
    document.getElementById('applyGeoFilter').addEventListener('click', async () => {
        if (!drawnGeometry) {
            alert('Please draw a geographic region first!');
            return;
        }

        const geoJSON = drawnGeometry.toGeoJSON();
        console.log('Geographic Filter GeoJSON:', geoJSON);

        try {
            const response = await fetch('/api/models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ geoFilter: geoJSON.geometry }),
            });
            const models = await response.json();
            displayModels(models);
        } catch (error) {
            console.error('Error applying geographic filter:', error);
        }
    });

    // Debugging initialization
    console.log('Document loaded. Initializing collections and event listeners.');

    // Function to fetch and display all collections
    const loadAllCollections = async () => {
        console.log('Starting to load all collections...');
        try {
            const response = await fetch('/collections');
            console.log('Fetch response for collections:', response);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('Fetched collections data:', data);
            const collections = data.collections || [];
            displayCollections(collections);
        } catch (error) {
            console.error('Error loading collections:', error);
            resultsContainer.innerHTML = '<p>Error loading collections.</p>';
        }
    };

    // Function to fetch and display items in a specific collection
    const loadItemsInCollection = async (collectionId) => {
        console.log(`Starting to load items for collection ID: ${collectionId}`);
        try {
            const response = await fetch(`/collections/${collectionId}/items`);
            console.log(`Fetch response for items in collection ${collectionId}:`, response);
            if (!response.ok) throw new Error('Failed to fetch items');
            const data = await response.json();
            console.log('Fetched items data:', data);
            displayItems(data.items || []);
        } catch (error) {
            console.error(`Error loading items for collection ID ${collectionId}:`, error);
            resultsContainer.innerHTML = `<p>Error loading items for collection ${collectionId}.</p>`;
        }
    };

    // Function to display collections
    const displayCollections = (collections) => {
        console.log('Displaying collections:', collections);
        resultsContainer.innerHTML = ''; // Clear previous content

        if (collections.length === 0) {
            resultsContainer.innerHTML = '<p>No collections found.</p>';
            return;
        }

        collections.forEach((collection) => {
            console.log('Rendering collection:', collection);
            const collectionDiv = document.createElement('div');
            collectionDiv.classList.add('collection-item', 'mb-4');

            collectionDiv.innerHTML = `
                <h4>${collection.title || 'No Title'}</h4>
                <p>${collection.description || 'No Description'}</p>
                <button class="btn btn-primary view-items-btn" data-id="${collection.collection_id}">View Items</button>
            `;

            resultsContainer.appendChild(collectionDiv);
        });

        attachViewItemsListeners();
    };

    // Function to display items in a collection
    const displayItems = (items) => {
        console.log('Displaying items:', items);
        resultsContainer.innerHTML = ''; // Clear previous content

        if (items.length === 0) {
            resultsContainer.innerHTML = '<p>No items found in this collection.</p>';
            return;
        }

        items.forEach((item) => {
            console.log('Rendering item:', item);
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item', 'mb-4');

            itemDiv.innerHTML = `
                <h5>${item.properties['mlm:name'] || 'No Name'}</h5>
                <p>${item.properties.description || 'No Description Available'}</p>
                <button class="btn btn-info view-details-btn" data-collection-id="${item.collection_id}" data-item-id="${item.item_id}">View Details</button>
            `;

            resultsContainer.appendChild(itemDiv);
        });

        attachViewDetailsListeners();
    };

    // Attach click listeners to "View Items" buttons
    const attachViewItemsListeners = () => {
        console.log('Attaching event listeners to "View Items" buttons.');
        document.querySelectorAll('.view-items-btn').forEach((button) => {
            button.addEventListener('click', (event) => {
                const collectionId = event.target.getAttribute('data-id');
                console.log(`"View Items" button clicked for collection ID: ${collectionId}`);
                loadItemsInCollection(collectionId);
            });
        });
    };

    // Attach click listeners to "View Details" buttons
    const attachViewDetailsListeners = () => {
        console.log('Attaching event listeners to "View Details" buttons.');
        document.querySelectorAll('.view-details-btn').forEach((button) => {
            button.addEventListener('click', (event) => {
                const collectionId = event.target.getAttribute('data-collection-id');
                const itemId = event.target.getAttribute('data-item-id');
                console.log(`"View Details" button clicked for Collection ID: ${collectionId}, Item ID: ${itemId}`);
                window.location.href = `modelDetails.html?collection_id=${collectionId}&item_id=${itemId}`;
            });
        });
    };

    // Debugging DOM element checks
    console.log('Search input element:', searchInput);
    console.log('Results container element:', resultsContainer);

    // Load all collections on page load
    console.log('Loading all collections on page load...');
    loadAllCollections();

    // Attach search functionality
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim();
        console.log('Search input changed:', searchTerm);
        if (!searchTerm) {
            loadAllCollections();
        } else {
            // Implement search functionality if required
            console.log('Performing search is not yet implemented.');
        }
    });

    // Function to display models for geographic filter
    const displayModels = (models) => {
        resultsContainer.innerHTML = ''; // Clear previous content

        if (models.length === 0) {
            resultsContainer.innerHTML = '<p>No models found.</p>';
            return;
        }

        models.forEach((model) => {
            const modelDiv = document.createElement('div');
            modelDiv.classList.add('model-item', 'mb-4');
            modelDiv.innerHTML = `
                <h4>${model.name || 'No Name Provided'}</h4>
                <p><strong>Description:</strong> ${model.description || 'No Description Available'}</p>
            `;
            resultsContainer.appendChild(modelDiv);
        });
    };
});
