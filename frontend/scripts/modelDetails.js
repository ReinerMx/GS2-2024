document.addEventListener('DOMContentLoaded', async () => {
    const modelDetailsContainer = document.getElementById('modelDetailsContainer');

    if (!modelDetailsContainer) {
        console.error('Error: modelDetailsContainer element not found');
        return;
    }

    // Retrieve item and collection IDs from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('item_id');
    const collectionId = urlParams.get('collection_id');

    if (!itemId || !collectionId) {
        modelDetailsContainer.innerHTML = '<p class="error-text">Error: Collection ID or Item ID is missing in the URL.</p>';
        return;
    }

    console.log(`Loading model details for Collection ID: ${collectionId}, Item ID: ${itemId}`);

    const loadModelDetails = async (collectionId, itemId) => {
        try {
            const response = await fetch(`/collections/${collectionId}/items/${itemId}`);
            if (!response.ok) throw new Error('Failed to fetch model details');

            const model = await response.json();

            // Render temporal coverage
            const temporalCoverageHTML = model.properties.start_datetime && model.properties.end_datetime
                ? `<p><strong>Temporal Coverage:</strong> ${new Date(model.properties.start_datetime).toLocaleDateString()} - ${new Date(model.properties.end_datetime).toLocaleDateString()}</p>`
                : '<p>No temporal coverage data available.</p>';

            // Render assets section
            const assetsHTML = model.assets
                ? Object.entries(model.assets).map(([key, asset]) => `
                    <div class="asset">
                        <h5>${asset.title || key}</h5>
                        <p>${asset.description || 'No description available.'}</p>
                        <p><strong>Type:</strong> ${asset.type}</p>
                        <p><strong>Link:</strong> <a href="${asset.href}" target="_blank">${asset.href}</a></p>
                    </div>
                `).join('')
                : '<p>No assets available.</p>';

            // Populate model details
            modelDetailsContainer.innerHTML = `
                <div class="model-details-container">
                    <div class="text-section">
                        <h3>${model.properties['mlm:name'] || 'Model Name'}</h3>
                        <p>${model.properties.description || 'No description available.'}</p>
                        <div class="model-section">
                            <h4>Overview</h4>
                            <p><strong>Framework:</strong> ${model.properties['mlm:framework'] || 'N/A'}</p>
                            <p><strong>Framework Version:</strong> ${model.properties['mlm:framework_version'] || 'N/A'}</p>
                            <p><strong>Architecture:</strong> ${model.properties['mlm:architecture'] || 'N/A'}</p>
                            <p><strong>Total Parameters:</strong> ${model.properties['mlm:total_parameters'] || 'N/A'}</p>
                            ${temporalCoverageHTML}
                        </div>
                        <div class="model-section">
                            <h4>Assets</h4>
                            ${assetsHTML}
                        </div>
                    </div>
                </div>
            `;

            // Render spatial coverage on map
            const map = L.map('map').setView([0, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            if (model.geometry) {
                const geometry = model.geometry;
                if (geometry.type === 'Polygon') {
                    const polygonCoords = geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                    const polygon = L.polygon(polygonCoords, { color: 'blue' }).addTo(map);
                    map.fitBounds(polygon.getBounds());
                } else if (geometry.type === 'Point') {
                    const point = L.marker([geometry.coordinates[1], geometry.coordinates[0]]).addTo(map);
                    map.setView([geometry.coordinates[1], geometry.coordinates[0]], 10);
                } else {
                    console.warn('Unsupported geometry type:', geometry.type);
                }
            }
        } catch (error) {
            console.error('Error loading model details:', error);
            modelDetailsContainer.innerHTML = '<p class="error-text">Error loading model details.</p>';
        }
    };

    await loadModelDetails(collectionId, itemId);
});
